import { test } from 'node:test';
import assert from 'node:assert/strict';
import { payment, renewal } from '../calc.js';
import { check, tidy } from '../guard.js';
import { letter, plainLetter, prompt } from '../letter.js';

test('textbook Canadian payment: $100,000 at 5%, 25 years = $581.60', () => {
  assert.equal(payment(100000, 5, 300).toFixed(2), '581.60');
});

test('zero rate splits principal evenly', () => {
  assert.equal(payment(120000, 0, 120), 1000);
});

const f = { ...renewal({ principal: 500000, oldRate: 1.89, newRate: 4.39 }), signYear: 2021, renewYear: 2026, oldRate: 1.89, newRate: 4.39 };

test('example renewal numbers', () => {
  assert.equal(f.oldPayment, 2091);
  assert.equal(f.balance, 417876);
  assert.equal(f.newPayment, 2610);
  assert.equal(f.monthlyIncrease, 519);
  assert.equal(f.yearlyIncrease, 6231);
});

test('the prompt gives the model no figures (no digits at all)', () => {
  assert.equal(/\d/.test(prompt()), false);
});

test('guard sends away digits and number words', () => {
  assert.equal(check('I was born at 2.09% and I stayed for years, quietly, in the walls.').pass, false);
  assert.equal(check('I stayed for twenty years, quietly, in the walls of your house.').pass, false);
  assert.equal(check('You may have forgotten me. I stayed quietly in the walls of your house.').pass, true);
});

test('letter always carries the calculator numbers', () => {
  const t = letter(f, 'You may have forgotten me. I was the quiet one.');
  for (const s of ['1.89%', '$2,091', '4.39%', '$2,610', '$519', '$6,231', '2021', '2026']) assert.ok(t.includes(s), s);
  assert.ok(plainLetter(f).includes('$519'));
});

test('tidy drops the greeting and any cut-off sentence', () => {
  const raw = 'Dearest you,\nI was the small payment. Now I am fading. Something colder is coming. I sense a shift, a';
  assert.equal(tidy(raw), 'I was the small payment. Now I am fading. Something colder is coming.');
});
