import { renewal } from './calc.js';
import { wake, summon } from './ghost.js';
import { plainLetter } from './letter.js';

const $ = (id) => document.getElementById(id);
const money = (n) => '$' + n.toLocaleString('en-CA');
let boc = null;

async function loadBoc() {
  boc = await (await fetch('data/boc-5y-posted.json')).json();
}

// Posted 5-year rate in the first week of a given month (or the closest week after it).
function postedRate(yyyymm) {
  const row = boc.observations.find(([d]) => d >= yyyymm + '-01') || boc.observations.at(-1);
  return { date: row[0], rate: row[1] };
}

function readForm() {
  const signed = $('signed').value; // "2021-03"
  return {
    signed,
    principal: Number($('principal').value),
    oldRate: Number($('oldRate').value),
    newRate: Number($('newRate').value),
    amortYears: Number($('amort').value),
    termYears: 5,
  };
}

function facts(input) {
  const r = renewal(input);
  const signYear = Number(input.signed.slice(0, 4));
  const then = postedRate(input.signed);
  const now = boc.observations.at(-1);
  return {
    ...r,
    signYear,
    renewYear: signYear + input.termYears,
    oldRate: input.oldRate,
    newRate: input.newRate,
    postedThen: then.rate,
    postedThenDate: then.date,
    postedNow: now[1],
    postedNowDate: now[0],
  };
}

function showNumbers(f) {
  $('numbers').innerHTML = `
    <tr><th>Payment at ${f.oldRate}%</th><td>${money(f.oldPayment)}/mo</td></tr>
    <tr><th>Balance left at renewal</th><td>${money(f.balance)}</td></tr>
    <tr><th>Payment at ${f.newRate}% (${f.remainingYears} yrs left)</th><td>${money(f.newPayment)}/mo</td></tr>
    <tr class="shock"><th>Difference</th><td>+${money(f.monthlyIncrease)}/mo · +${money(f.yearlyIncrease)}/yr (${f.increasePct}%)</td></tr>`;
  $('echo').textContent =
    `Bank of Canada posted 5-year rate the week of ${f.postedThenDate}: ${f.postedThen}%. ` +
    `Latest (${f.postedNowDate}): ${f.postedNow}%. Posted rates are list prices; most people pay less.`;
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = facts(readForm());
  showNumbers(f);
  $('result').hidden = false;
  const letter = $('letter');
  const status = $('status');
  letter.textContent = '';
  if (!$('useModel').checked) {
    letter.textContent = plainLetter(f);
    status.textContent = 'Plain letter (model off).';
    return;
  }
  status.textContent = 'Waking the ghost (first time downloads the model, about 800 MB, then your browser keeps it)...';
  try {
    await wake((p) => {
      if (p.status === 'progress' && p.file?.endsWith('.onnx_data')) {
        status.textContent = `Waking the ghost... ${Math.round(p.progress)}%`;
      }
    });
    status.textContent = 'The ghost is writing...';
    const res = await summon(f, (t, attempt) => { letter.textContent = t; status.textContent = `The ghost is writing (try ${attempt})...`; });
    letter.textContent = res.text;
    status.textContent = res.source === 'model'
      ? `Written on your device by Gemma 3 1B. Every number checked against the calculator (try ${res.attempt}).`
      : 'The ghost kept inventing numbers, so it was sent away. Here is the plain letter instead.';
  } catch (err) {
    console.error(err);
    letter.textContent = plainLetter(f);
    status.textContent = 'This browser could not run the model, so here is the plain letter.';
  }
});

loadBoc();
