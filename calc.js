// Canadian fixed-rate mortgage math. By Canadian convention, fixed rates are
// compounded semi-annually, so the monthly rate is (1 + r/2)^(1/6) - 1.

export function monthlyRate(annualPct) {
  return Math.pow(1 + annualPct / 100 / 2, 1 / 6) - 1;
}

export function payment(principal, annualPct, months) {
  const i = monthlyRate(annualPct);
  if (i === 0) return principal / months;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
}

export function balanceAfter(principal, annualPct, amortMonths, paidMonths) {
  const i = monthlyRate(annualPct);
  const pmt = payment(principal, annualPct, amortMonths);
  if (i === 0) return principal - pmt * paidMonths;
  const g = Math.pow(1 + i, paidMonths);
  return principal * g - pmt * ((g - 1) / i);
}

// The whole story in numbers. Every figure the ghost may say comes from here.
export function renewal({ principal, oldRate, newRate, amortYears = 25, termYears = 5 }) {
  const amort = amortYears * 12;
  const term = termYears * 12;
  const oldPayment = payment(principal, oldRate, amort);
  const balance = balanceAfter(principal, oldRate, amort, term);
  const newPayment = payment(balance, newRate, amort - term);
  const diff = newPayment - oldPayment;
  return {
    oldPayment: Math.round(oldPayment),
    balance: Math.round(balance),
    newPayment: Math.round(newPayment),
    monthlyIncrease: Math.round(diff),
    yearlyIncrease: Math.round(diff * 12),
    increasePct: Math.round((diff / oldPayment) * 1000) / 10,
    remainingYears: amortYears - termYears,
  };
}
