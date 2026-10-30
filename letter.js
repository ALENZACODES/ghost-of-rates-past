// What the ghost is told, and how its words are joined to the real numbers.

const $ = (n) => '$' + n.toLocaleString('en-CA');

// The model only writes the opening. No facts are given to it on purpose:
// it can't get a number wrong if it never holds one.
export function prompt() {
  return [
    'You are the ghost of an old, low mortgage rate. You died when the term ended.',
    'Write the opening of a short letter to the homeowner who signed you, a few months before their renewal.',
    'Say that you were the small, quiet payment that came every month, that you are fading now, and that something colder is coming to take your place.',
    'Two or three short sentences. Speak to them as "you". Eerie but kind. Plain words. No rhymes. No greeting line, no name, no sign-off.',
    'Do not use any numbers, digits, dates, amounts or percentages. Do not give advice.',
  ].join('\n');
}

export const OPENING_FALLBACK =
  'You may have forgotten me. I was the quiet one, there every month, asking for very little. Now my time is up, and I came back to tell you what happens next.';

// The part with numbers. Always built here, never by the model.
export function numbersPart(f) {
  return `I was born in ${f.signYear} at ${f.oldRate}%. While I lived, your payment was ${$(f.oldPayment)} a month. ` +
    `At renewal in ${f.renewYear}, the rate waiting for you is ${f.newRate}%. ` +
    `Your payment becomes ${$(f.newPayment)} a month: ${$(f.monthlyIncrease)} more, or ${$(f.yearlyIncrease)} more a year.`;
}

export const NUDGE =
  'Do not wait for the letter in the mail. Start comparing lenders early, and read the renewal offer closely.';

export function letter(f, opening = OPENING_FALLBACK) {
  return `${opening.trim()}\n\n${numbersPart(f)}\n\n${NUDGE}\n\n— your old rate`;
}

export function plainLetter(f) {
  return letter(f);
}
