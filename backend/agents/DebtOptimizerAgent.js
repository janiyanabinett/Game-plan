/**
 * DebtOptimizerAgent
 * Precise amortization-based debt payoff calculator.
 * Simulates month-by-month Avalanche and Snowball strategies,
 * computes exact interest costs, and recommends the optimal approach.
 */

export class DebtOptimizerAgent {
  optimize({ debts, extraPayment = 0 }) {
    const extra = parseFloat(extraPayment) || 0;
    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

    // Simulate minimum-only baseline
    const minimumOnly = this._simulate(debts, 0, 'avalanche');

    // Simulate Avalanche (highest rate first)
    const avalanche = this._simulate(debts, extra, 'avalanche');

    // Simulate Snowball (smallest balance first)
    const snowball = this._simulate(debts, extra, 'snowball');

    const recommendation = this._recommend(avalanche, snowball, debts, extra);

    return {
      totalDebt: Math.round(totalDebt),
      avalanche: {
        order: avalanche.order,
        totalInterestPaid: avalanche.totalInterest,
        monthsToPayoff: avalanche.months,
        monthlySavingsVsMinimum: Math.max(0, minimumOnly.totalInterest - avalanche.totalInterest),
      },
      snowball: {
        order: snowball.order,
        totalInterestPaid: snowball.totalInterest,
        monthsToPayoff: snowball.months,
        motivationBenefit: this._motivationNote(snowball, debts),
      },
      minimumOnlyPayoff: {
        months: minimumOnly.months,
        totalInterestPaid: minimumOnly.totalInterest,
      },
      recommendation,
    };
  }

  // ── Core simulation engine ───────────────────────────────────────────────
  _simulate(originalDebts, extra, strategy) {
    // Deep copy to avoid mutating input
    const debts = originalDebts.map((d) => ({
      name: d.name,
      balance: parseFloat(d.balance),
      monthlyRate: parseFloat(d.rate) / 100 / 12,
      minPayment: parseFloat(d.minPayment),
    }));

    // Determine payoff order
    const sorted = this._sortDebts(debts, strategy);
    const order = sorted.map((d) => d.name);

    let month = 0;
    let totalInterest = 0;
    const MAX_MONTHS = 600; // 50 year safety cap

    while (debts.some((d) => d.balance > 0.01) && month < MAX_MONTHS) {
      month++;

      // Accrue interest on all active debts
      for (const d of debts) {
        if (d.balance <= 0) continue;
        const interest = d.balance * d.monthlyRate;
        d.balance += interest;
        totalInterest += interest;
      }

      // Pay minimums on all
      for (const d of debts) {
        if (d.balance <= 0) continue;
        const payment = Math.min(d.minPayment, d.balance);
        d.balance -= payment;
        if (d.balance < 0.01) d.balance = 0;
      }

      // Apply extra payment to target debt (per strategy order)
      let remaining = extra;
      for (const target of sorted) {
        if (remaining <= 0) break;
        const debt = debts.find((d) => d.name === target.name);
        if (!debt || debt.balance <= 0) continue;
        const payment = Math.min(remaining, debt.balance);
        debt.balance -= payment;
        remaining -= payment;
        if (debt.balance < 0.01) debt.balance = 0;
      }

      // Cascade freed-up minimum payments to next target
      // (when a debt is paid off, its min payment rolls to the next target)
      const freedPayments = debts
        .filter((d) => d.balance <= 0)
        .reduce((s, d) => s + d.minPayment, 0);

      if (freedPayments > 0 && extra === 0) {
        // In minimum-only mode still cascade to simulate realistic payoff
        let cascade = freedPayments;
        for (const target of sorted) {
          if (cascade <= 0) break;
          const debt = debts.find((d) => d.name === target.name && d.balance > 0);
          if (!debt) continue;
          const payment = Math.min(cascade, debt.balance);
          debt.balance -= payment;
          cascade -= payment;
          if (debt.balance < 0.01) debt.balance = 0;
        }
      }
    }

    return {
      order,
      months: month,
      totalInterest: Math.round(totalInterest),
    };
  }

  _sortDebts(debts, strategy) {
    const active = debts.filter((d) => d.balance > 0);
    if (strategy === 'avalanche') {
      return [...active].sort((a, b) => b.monthlyRate - a.monthlyRate);
    }
    // snowball: smallest balance first
    return [...active].sort((a, b) => a.balance - b.balance);
  }

  _motivationNote(snowball, debts) {
    const sorted = [...debts].sort((a, b) => a.balance - b.balance);
    if (sorted.length === 0) return '';
    const first = sorted[0];
    const annualRate = (first.balance * (parseFloat(first.rate || 0) / 100));
    const monthsToFirst = this._estimateMonthsToPayFirst(first);
    if (monthsToFirst <= 6) {
      return `You could eliminate your ${first.name} ($${first.balance}) in as little as ${monthsToFirst} months — a powerful early win that frees up $${first.minPayment}/month.`;
    }
    return `Eliminating your ${first.name} first gives you a clear, achievable target and frees $${first.minPayment}/month to roll into the next debt.`;
  }

  _estimateMonthsToPayFirst(debt) {
    let bal = parseFloat(debt.balance);
    const r = parseFloat(debt.rate || 0) / 100 / 12;
    const pmt = parseFloat(debt.minPayment);
    let m = 0;
    while (bal > 0.01 && m < 600) {
      bal += bal * r;
      bal -= pmt;
      m++;
    }
    return m;
  }

  _recommend(avalanche, snowball, debts, extra) {
    const interestDiff = snowball.totalInterestPaid - avalanche.totalInterestPaid;
    const monthDiff = snowball.monthsToPayoff - avalanche.monthsToPayoff;

    const highRateDebts = debts.filter((d) => parseFloat(d.rate) > 15);
    const hasHighRateDebt = highRateDebts.length > 0;

    const smallDebts = debts.filter((d) => parseFloat(d.balance) < 1500);
    const hasSmallQuickWins = smallDebts.length > 0;

    let rec = '';

    if (interestDiff <= 200 && hasSmallQuickWins) {
      rec = `For your situation, the Snowball method is recommended. The interest difference is small ($${interestDiff.toLocaleString()}) and you have ${smallDebts.length} debt(s) under $1,500 that you can eliminate quickly. Those early wins build momentum and reduce the number of payments you're managing — which research shows improves completion rates.`;
    } else if (interestDiff > 1000 && hasHighRateDebt) {
      const topRateDebt = highRateDebts.sort((a, b) => b.rate - a.rate)[0];
      rec = `The Avalanche method is strongly recommended. Your ${topRateDebt.name} at ${topRateDebt.rate}% APR is costing you significantly. By targeting it first, you save $${interestDiff.toLocaleString()} in total interest and pay off ${monthDiff} months sooner compared to Snowball. The math is clear — attack the highest rate first.`;
    } else if (hasHighRateDebt) {
      rec = `The Avalanche method gives you the better financial outcome — saving $${interestDiff.toLocaleString()} in interest. However, if you find it hard to stay motivated, start with the Snowball to knock out one small debt for a confidence boost, then switch to Avalanche. The best strategy is the one you complete.`;
    } else {
      rec = `Your debts have similar interest rates, so the difference between strategies is small ($${interestDiff.toLocaleString()}). Choose based on psychology: if you need motivation, go Snowball. If you're disciplined and want optimal math, go Avalanche. Either way, the extra $${extra}/month payment is doing meaningful work — you're ${monthDiff >= 0 ? 'ahead of' : 'on pace with'} minimum-only payoff by a significant margin.`;
    }

    if (extra === 0) {
      rec += ' Tip: Adding even $50–100/month extra can cut your payoff time by years and save thousands in interest.';
    }

    return rec;
  }
}
