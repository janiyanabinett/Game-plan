/**
 * BudgetAnalyzerAgent
 * Rules-based budget analysis engine.
 * Scores budgets, categorizes expenses into 50/30/20 buckets,
 * generates personalized improvement recommendations, and identifies quick wins.
 */

export class BudgetAnalyzerAgent {
  // Expense category classification
  NEEDS_CATEGORIES = new Set([
    'Rent/Housing', 'Groceries', 'Transportation', 'Phone', 'Utilities',
    'Healthcare', 'Student Loan Payment', 'Credit Card Payment',
  ]);

  WANTS_CATEGORIES = new Set([
    'Dining Out', 'Entertainment', 'Clothing', 'Subscriptions',
  ]);

  // Benchmark ratios for common expense categories as % of income
  BENCHMARKS = {
    'Rent/Housing':         { low: 0.20, ideal: 0.28, high: 0.35 },
    'Groceries':            { low: 0.05, ideal: 0.10, high: 0.15 },
    'Transportation':       { low: 0.05, ideal: 0.10, high: 0.15 },
    'Dining Out':           { low: 0.02, ideal: 0.05, high: 0.10 },
    'Entertainment':        { low: 0.01, ideal: 0.05, high: 0.08 },
    'Subscriptions':        { low: 0.01, ideal: 0.02, high: 0.04 },
    'Clothing':             { low: 0.01, ideal: 0.03, high: 0.05 },
    'Phone':                { low: 0.01, ideal: 0.02, high: 0.04 },
    'Healthcare':           { low: 0.01, ideal: 0.03, high: 0.06 },
    'Student Loan Payment': { low: 0.05, ideal: 0.10, high: 0.15 },
    'Credit Card Payment':  { low: 0.00, ideal: 0.00, high: 0.05 },
    'Utilities':            { low: 0.02, ideal: 0.04, high: 0.07 },
  };

  analyze({ income, expenses, goals = '' }) {
    const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
    const netCashFlow = income - totalExpenses;
    const savingsAmount = Math.max(0, netCashFlow); // leftover = savings potential

    // ── Categorize into 50/30/20 buckets ────────────────────────────────
    let needsTotal = 0;
    let wantsTotal = 0;
    let savingsTotal = 0;

    for (const [cat, amt] of Object.entries(expenses)) {
      if (this.NEEDS_CATEGORIES.has(cat)) needsTotal += amt;
      else if (this.WANTS_CATEGORIES.has(cat)) wantsTotal += amt;
      else savingsTotal += amt; // "Other" treated as ambiguous — neutral
    }

    // Add actual savings/investment if present
    if (expenses['Other']) {
      // Already counted above
    }

    const needsPct  = Math.round((needsTotal / income) * 100);
    const wantsPct  = Math.round((wantsTotal / income) * 100);
    // Savings = whatever's left over (unused income) + any savings line items
    const actualSavingsPct = Math.max(0, Math.round(((income - needsTotal - wantsTotal) / income) * 100));

    // ── Scoring algorithm ────────────────────────────────────────────────
    let score = 100;
    const deductions = [];

    // 1. Net cash flow check
    if (netCashFlow < 0) {
      const deficit = Math.abs(netCashFlow);
      score -= Math.min(40, Math.round((deficit / income) * 100));
      deductions.push(`Spending $${deficit.toLocaleString()} more than you earn per month — immediate priority.`);
    } else if (netCashFlow < income * 0.05) {
      score -= 10;
      deductions.push('Very little cushion between income and expenses — vulnerable to any surprise cost.');
    }

    // 2. Needs bucket
    if (needsPct > 65) { score -= 20; deductions.push(`Needs at ${needsPct}% — far above the 50% target.`); }
    else if (needsPct > 55) { score -= 8; deductions.push(`Needs at ${needsPct}% — slightly above the 50% guideline.`); }

    // 3. Wants bucket
    if (wantsPct > 40) { score -= 15; deductions.push(`Wants at ${wantsPct}% — significantly over the 30% target.`); }
    else if (wantsPct > 33) { score -= 5; deductions.push(`Wants at ${wantsPct}% — a bit above the 30% guideline.`); }

    // 4. Savings rate
    if (actualSavingsPct < 5) { score -= 20; deductions.push('Savings rate under 5% — building wealth will be very slow.'); }
    else if (actualSavingsPct < 10) { score -= 10; deductions.push('Savings rate under 10% — aim to increase gradually.'); }
    else if (actualSavingsPct < 20) { score -= 3; }

    // 5. Category-level overspending
    for (const [cat, amt] of Object.entries(expenses)) {
      const bm = this.BENCHMARKS[cat];
      if (!bm) continue;
      const pct = amt / income;
      if (pct > bm.high) {
        score -= 5;
        deductions.push(`${cat} at ${Math.round(pct * 100)}% of income — above typical range.`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    // ── Generate improvement recommendations ─────────────────────────────
    const improvements = this._generateImprovements(income, expenses, netCashFlow, needsPct, wantsPct, actualSavingsPct, goals);

    // ── Generate quick tip ───────────────────────────────────────────────
    const quickTip = this._generateQuickTip(income, expenses, netCashFlow);

    // ── Score explanation ────────────────────────────────────────────────
    const scoreExplanation = this._scoreExplanation(score, netCashFlow, actualSavingsPct, needsPct, wantsPct);

    // ── 50/30/20 assessment ──────────────────────────────────────────────
    const fiftyThirtyTwenty = {
      needs: needsPct,
      wants: wantsPct,
      savings: actualSavingsPct,
      assessment: this._fiftyThirtyTwentyAssessment(needsPct, wantsPct, actualSavingsPct),
    };

    return { score, scoreExplanation, improvements, fiftyThirtyTwenty, quickTip };
  }

  _generateImprovements(income, expenses, netCashFlow, needsPct, wantsPct, savingsPct, goals) {
    const tips = [];

    // Overspending detection (sorted by impact)
    const overSpent = [];
    for (const [cat, amt] of Object.entries(expenses)) {
      const bm = this.BENCHMARKS[cat];
      if (!bm) continue;
      const pct = amt / income;
      if (pct > bm.high) {
        const excess = amt - bm.high * income;
        overSpent.push({ cat, excess: Math.round(excess), pct: Math.round(pct * 100) });
      }
    }
    overSpent.sort((a, b) => b.excess - a.excess);

    if (overSpent.length > 0) {
      const top = overSpent[0];
      tips.push(`Cut ${top.cat} by $${top.excess}/month — it's at ${top.pct}% of your income, above the typical range. That's $${top.excess * 12}/year in savings potential.`);
    }

    // Savings rate tip
    if (savingsPct < 20) {
      const gap = Math.round((0.20 - savingsPct / 100) * income);
      if (netCashFlow > 0) {
        tips.push(`Automate $${Math.min(gap, netCashFlow)}/month into a Roth IRA or high-yield savings account. You currently have $${Math.round(netCashFlow)}/month unassigned — put it to work immediately.`);
      } else {
        tips.push(`Reduce total expenses by $${Math.abs(Math.round(netCashFlow))}/month to reach a positive cash flow, then immediately direct that surplus to savings or debt payoff.`);
      }
    }

    // Wants overspending
    if (wantsPct > 35) {
      const diningAmt = expenses['Dining Out'] || 0;
      const entAmt = expenses['Entertainment'] || 0;
      const subAmt = expenses['Subscriptions'] || 0;

      if (diningAmt > income * 0.08) {
        tips.push(`Your dining out spend ($${diningAmt}/month) is high. Meal prepping 2–3 dinners per week and limiting restaurant meals to once per week could save $80–150/month without major lifestyle sacrifice.`);
      } else if (entAmt + subAmt > income * 0.10) {
        tips.push(`Audit your subscriptions and entertainment ($${entAmt + subAmt}/month combined). Cancel unused streaming services and set a weekly entertainment cash limit — many students cut $50–100/month this way.`);
      } else {
        tips.push(`Your wants bucket is at ${wantsPct}% — over the 30% guideline. Identify your top 2–3 discretionary categories and set specific monthly caps for each. Use a weekly check-in to stay on track.`);
      }
    }

    // Specific goal-based advice
    if (goals) {
      const gl = goals.toLowerCase();
      if (gl.includes('emergency')) {
        tips.push(`For your emergency fund goal: open a high-yield savings account (Ally, Marcus, SoFi — all 4–5% APY) and automate a transfer right after payday. Even $100/month builds a $1,200 starter fund in a year.`);
      } else if (gl.includes('invest') || gl.includes('roth') || gl.includes('retirement')) {
        tips.push(`For investing: open a Roth IRA at Fidelity (free, takes 10 minutes). Invest in FZROX (0% expense ratio total market fund). Set up a monthly auto-invest so you never have to remember.`);
      } else if (gl.includes('loan') || gl.includes('debt')) {
        const ccAmt = expenses['Credit Card Payment'] || 0;
        if (ccAmt > 0 && netCashFlow > 50) {
          tips.push(`To accelerate debt payoff: add your $${Math.round(netCashFlow)} monthly surplus to your highest-interest debt payment. Use the Debt Calculator in this app to compare avalanche vs snowball for your specific balances.`);
        }
      }
    }

    // Catch-all if not enough tips
    if (tips.length === 0) {
      tips.push('Your budget looks well-structured. Focus on automating savings so it happens without willpower — treat savings like a bill that must be paid first.');
      tips.push('Consider increasing your retirement contributions by 1% every time you get a raise — you\'ll never feel the lifestyle difference, but it compounds significantly over 30 years.');
      tips.push('Build sinking funds for irregular expenses: divide annual costs (car registration, holiday gifts, travel) by 12 and save that amount monthly. This eliminates "budget-busting" surprises.');
    }

    return tips.slice(0, 3);
  }

  _generateQuickTip(income, expenses, netCashFlow) {
    const dining = expenses['Dining Out'] || 0;
    const subs = expenses['Subscriptions'] || 0;
    const clothing = expenses['Clothing'] || 0;

    if (dining > income * 0.07) {
      const save = Math.round(dining * 0.4);
      return `Meal prep Sunday: cook 3 dinners in bulk and bring lunch to work/school. This alone typically cuts dining costs by 35–45% — that's ~$${save}/month back in your pocket with one afternoon of cooking per week.`;
    }
    if (subs > 60) {
      return `Log into your email and search "subscription" and "receipt." Most people find 2–4 subscriptions they forgot about. Canceling $20–30 in unused subscriptions takes 10 minutes and saves $240–360/year.`;
    }
    if (netCashFlow > 200) {
      return `You have $${Math.round(netCashFlow)}/month unassigned. Set up an automatic transfer to a Roth IRA or high-yield savings account today — it takes 10 minutes and removes the decision from your monthly routine.`;
    }
    if (clothing > income * 0.05) {
      return `Before your next clothing purchase, implement a 48-hour wait. Research shows ~65% of impulse purchases feel unnecessary after two days. This single habit can cut clothing spending by 30–40%.`;
    }
    return `Open a high-yield savings account (Ally, Marcus, SoFi) if you haven't. You're likely earning 0.01% APY in a traditional savings account. Switching to a 4.5% HYSA earns you hundreds in free interest annually on your existing savings.`;
  }

  _scoreExplanation(score, netCashFlow, savingsPct, needsPct, wantsPct) {
    if (score >= 85) {
      return `Excellent budget health. You're living within your means with a solid savings rate. Focus on optimizing — increase investments and keep wants spending intentional.`;
    }
    if (score >= 70) {
      return `Good foundation with clear room to improve. Your needs are covered and you have some savings, but ${wantsPct > 33 ? 'discretionary spending is slightly elevated' : 'savings rate could be higher'}. Implement the recommendations below to reach the next level.`;
    }
    if (score >= 55) {
      return `Your budget needs attention. ${netCashFlow < 0 ? 'You\'re spending more than you earn, which means debt is growing.' : 'Cash flow is tight, leaving little room for savings or emergencies.'} The improvements below will have a meaningful near-term impact.`;
    }
    return `Your budget has significant pressure points. ${netCashFlow < 0 ? `You're spending $${Math.abs(Math.round(netCashFlow))} more than you earn — this is the top priority to fix.` : 'Very low savings rate creates financial vulnerability.'} Focus on the top improvement below first before anything else.`;
  }

  _fiftyThirtyTwentyAssessment(needs, wants, savings) {
    const assessments = [];
    if (needs > 55) assessments.push(`Needs (${needs}%) are above the 50% target — consider a cheaper living situation or reducing fixed costs.`);
    else if (needs < 40) assessments.push(`Needs (${needs}%) are well under 50% — great, but verify you're not undercounting essential expenses.`);
    else assessments.push(`Needs (${needs}%) are right on target.`);

    if (wants > 33) assessments.push(`Wants (${wants}%) exceed the 30% guideline — trim discretionary spending.`);
    else assessments.push(`Wants (${wants}%) are within the 30% target.`);

    if (savings < 10) assessments.push(`Savings (${savings}%) are well below the 20% goal — this is the highest-impact area to improve.`);
    else if (savings >= 20) assessments.push(`Savings (${savings}%) meet or exceed the 20% goal — excellent discipline.`);
    else assessments.push(`Savings (${savings}%) are progressing toward the 20% goal.`);

    return assessments.join(' ');
  }
}
