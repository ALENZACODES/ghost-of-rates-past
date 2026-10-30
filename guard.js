// The ghost may speak, but it may not touch the numbers.
// The model writes only the spooky part of the letter. Any digit or number word
// in what it writes gets the whole attempt thrown away; the numbers in the
// letter always come straight from calc.js.

const NUMBER_WORDS = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|percent|dozen|half|double|twice|triple)\b/i;

export function findNumbers(text) {
  const found = text.match(/\d[\d,.]*%?/g) || [];
  const word = text.match(NUMBER_WORDS);
  return word ? [...found, word[0]] : found;
}

export function check(text) {
  const numbers = findNumbers(text);
  const tooLong = text.split(/[.!?]+\s/).length > 5;
  const empty = text.trim().length < 40;
  const placeholder = /[\[\]{}<>]|---/.test(text);
  return { pass: numbers.length === 0 && !tooLong && !empty && !placeholder, numbers, tooLong, empty, placeholder };
}

// Small models often stop mid-sentence at the token limit. Keep whole sentences only,
// and at most three of them.
export function tidy(text) {
  const clean = text.replace(/^(dear|dearest|my dear)[^\n]*\n/i, '').replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*/g) || [];
  return sentences.slice(0, 3).map((s) => s.trim()).join(' ');
}
