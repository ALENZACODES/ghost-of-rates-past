# 👻 Ghost of Rates Past

Your old mortgage rate comes back to warn you before renewal.

Many Canadians locked in a low 5-year fixed rate in 2020 or 2021 and are renewing now. Type in the rate you signed and the renewal rate you've been offered. The page works out what happens to your payment, and the ghost of your old rate writes you a short letter about it.

The letter's spooky opening is written by **Gemma 3 1B**, an open-weight model, running **in your browser** with [Transformers.js](https://github.com/huggingface/transformers.js). Your numbers never leave your device. There is no server and no API key.

Made in Toronto, Ontario for the [DEV Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26). Started Oct 30, 2026.

## The one rule: the ghost never touches the numbers

Small models are bad at numbers. When I gave the model the figures and asked it to write the whole letter, it dropped the most important number, mixed up "a month" and "a year", and once invented a rate. So the work is split:

| Part | Who writes it |
|---|---|
| Payments, balance, difference | `calc.js` (plain JavaScript, unit tested) |
| The spooky opening | Gemma 3 1B, in your browser |
| The practical nudge | fixed text |

The model is never shown a single number. `guard.js` checks what it writes: any digit, any number word ("twenty", "half", "percent"), a placeholder like `[Name]`, or a too-short answer, and the attempt is thrown out. After three bad tries the page uses a plain opening. If your browser can't run the model at all, you still get the full letter and every number.

## Run it

It's a static site. Any web server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The first time you summon the ghost, your browser downloads the model once (about 760 MB with WebGPU, about 860 MB on CPU) and keeps it in its cache. WebGPU is used if your browser has it; otherwise it runs on the CPU, which is slower.

## Tests

```bash
npm test
```

Checks the mortgage math against a textbook value ($100,000 at 5%, 25 years = $581.60 a month with semi-annual compounding), the example in the demo, and the number guard.

## Assumptions

- 5-year fixed term, monthly payments, semi-annual compounding (the usual Canadian convention for fixed rates).
- At renewal the remaining balance is spread over the remaining amortization.
- No prepayments, no fees, no penalties.
- The "posted rate" line uses the Bank of Canada's weekly series [V80691335](https://www.bankofcanada.ca/valet/observations/V80691335/json) (5-year conventional mortgage rate posted by chartered banks). Posted rates are list prices; most people pay less. Data saved Oct 30, 2026 in `data/boc-5y-posted.json`.

Educational only. Not financial advice.

## Credits

- Model: [google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it), ONNX build by [onnx-community](https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX). Use is subject to the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).
- Runtime: [Transformers.js](https://github.com/huggingface/transformers.js) (Apache-2.0) and ONNX Runtime Web.
- Rate data: Bank of Canada Valet API.

## License

MIT for the code in this repo. See LICENSE.
