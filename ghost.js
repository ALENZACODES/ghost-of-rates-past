// Runs an open-weight model (Gemma 3 1B, instruction tuned) in the browser
// with Transformers.js. Nothing you type leaves your device.
import { pipeline, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2';
import { check, tidy } from './guard.js';
import { prompt, letter, plainLetter } from './letter.js';

const MODEL = 'onnx-community/gemma-3-1b-it-ONNX';
let generator = null;

export async function wake(onProgress) {
  if (generator) return generator;
  // Use the GPU when the browser really has one; otherwise run on the CPU (slower, still local).
  const adapter = navigator.gpu ? await navigator.gpu.requestAdapter().catch(() => null) : null;
  const device = adapter ? 'webgpu' : 'wasm';
  generator = await pipeline('text-generation', MODEL, {
    dtype: device === 'webgpu' ? 'q4f16' : 'q4',
    device,
    progress_callback: onProgress,
  });
  return generator;
}

// Ask the ghost for an opening up to 3 times. If it keeps reaching for
// numbers, it is sent away and the plain opening is used.
export async function summon(facts, onToken) {
  const g = await wake();
  for (let attempt = 1; attempt <= 3; attempt++) {
    let text = '';
    const streamer = new TextStreamer(g.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (t) => { text += t; onToken?.(text, attempt); },
    });
    const out = await g([{ role: 'user', content: prompt() }], {
      max_new_tokens: 90,
      do_sample: true,
      temperature: 0.8,
      streamer,
    });
    const opening = tidy(out[0].generated_text.at(-1).content.replace(/^["']|["']$/g, ''));
    const verdict = check(opening);
    if (verdict.pass) return { text: letter(facts, opening), attempt, source: 'model' };
    console.info(`attempt ${attempt} sent away:`, verdict);
  }
  return { text: plainLetter(facts), attempt: 3, source: 'fallback' };
}
