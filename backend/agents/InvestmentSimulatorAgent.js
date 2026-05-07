/**
 * InvestmentSimulatorAgent
 * Compound interest projection engine with rule-based portfolio allocation.
 * Generates growth curves, portfolio allocations, and action plans
 * based on risk tolerance and time horizon — no external API required.
 */

export class InvestmentSimulatorAgent {
  // Annual return assumptions
  RETURNS = { conservative: 0.04, moderate: 0.07, optimistic: 0.10 };

  // Portfolio allocation rules by risk level
  ALLOCATIONS = {
    low: [
      { category: 'US Bond Index ETF',        percentage: 40, examples: 'BND, FXNAX',      rationale: 'Capital preservation and stable income' },
      { category: 'Total US Stock Market ETF', percentage: 35, examples: 'VTI, FZROX',      rationale: 'Moderate equity growth' },
      { category: 'International Stock ETF',   percentage: 15, examples: 'VXUS, FZILX',     rationale: 'Geographic diversification' },
      { category: 'Money Market / Cash',       percentage: 10, examples: 'SPAXX, VMFXX',    rationale: 'Liquidity buffer for short-term needs' },
    ],
    medium: [
      { category: 'Total US Stock Market ETF', percentage: 60, examples: 'VTI, FZROX',      rationale: 'Core growth engine — low cost, diversified' },
      { category: 'International Stock ETF',   percentage: 25, examples: 'VXUS, FZILX',     rationale: 'Capture international growth opportunities' },
      { category: 'US Bond Index ETF',         percentage: 15, examples: 'BND, FXNAX',      rationale: 'Reduce volatility as portfolio grows' },
    ],
    high: [
      { category: 'Total US Stock Market ETF', percentage: 70, examples: 'VTI, FZROX',      rationale: 'Maximum long-term growth potential' },
      { category: 'International Stock ETF',   percentage: 20, examples: 'VXUS, FZILX',     rationale: 'International diversification for upside' },
      { category: 'Small-Cap Value ETF',       percentage: 10, examples: 'VBR, VIOV',        rationale: 'Historical small-cap premium for long horizons' },
    ],
  };

  PRINCIPLES = {
    low: [
      'Capital preservation is priority one — bonds protect your balance from severe stock market drops.',
      'Keep 6+ months of expenses in a high-yield savings account before investing anything.',
      'Rebalance your portfolio once per year to maintain target allocation percentages.',
    ],
    medium: [
      'Time in the market beats timing the market — stay invested during market downturns.',
      'Keep expense ratios under 0.10% — a 1% fee difference costs you hundreds of thousands over 30 years.',
      'Automate monthly contributions so you invest consistently without willpower or decision-making.',
    ],
    high: [
      'Volatility is the price of higher long-term returns — a 30–40% drop is normal and temporary.',
      'Never sell during a market crash — this locks in losses and misses the recovery.',
      'Increase your savings rate when income grows instead of increasing lifestyle spending.',
    ],
  };

  FIRST_STEPS = {
    low: [
      'Open a high-yield savings account (Ally, Marcus) and fully fund your emergency fund (3–6 months expenses) before investing.',
      'Open a Roth IRA at Fidelity or Schwab. Set up a monthly auto-invest into FXNAX (bonds) and FZROX (stocks) at your target allocation.',
      'Enroll in your employer 401k at least to the match amount — allocate to a Target Date Fund if unsure where to start.',
    ],
    medium: [
      'Open a Roth IRA at Fidelity (free, 10 minutes). Invest in FZROX for US stocks and FZILX for international — both have 0% expense ratio.',
      'Contribute to your 401k up to your employer match, then prioritize maxing your Roth IRA ($7,000/year in 2024).',
      'Set up automatic monthly transfers on payday so investing happens before you can spend the money.',
    ],
    high: [
      'Open a Roth IRA at Fidelity or Vanguard. Buy VTI (total market) and VXUS (international) — rebalance once per year.',
      'Max your Roth IRA ($7,000/year), then max your 401k ($23,000/year), then open a taxable brokerage for additional investing.',
      'Use market downturns as buying opportunities — set up a recurring investment and do NOT pause it when the market drops.',
    ],
  };

  simulate({ amount, riskTolerance, timeHorizon, goals }) {
    const risk = riskTolerance?.toLowerCase() || 'medium';
    const years = parseInt(timeHorizon) || 30;
    const monthly = parseFloat(amount) || 0;

    // Generate year-by-year projections
    const projections = this._buildProjections(monthly, years);

    // Get allocation for this risk level
    const allocation = this.ALLOCATIONS[risk] || this.ALLOCATIONS.medium;

    // Get principles and first steps
    const keyPrinciples = this.PRINCIPLES[risk] || this.PRINCIPLES.medium;
    const firstSteps = this.FIRST_STEPS[risk] || this.FIRST_STEPS.medium;

    // Customize first steps based on goals
    const customSteps = this._customizeSteps(firstSteps, goals, amount, risk);

    return { allocation, projections, keyPrinciples, firstSteps: customSteps };
  }

  // Future Value of annuity: FV = PMT × ((1+r)^n - 1) / r
  _fv(monthly, annualRate, years) {
    if (annualRate === 0) return monthly * 12 * years;
    const r = annualRate / 12;
    const n = years * 12;
    return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
  }

  _buildProjections(monthly, totalYears) {
    const checkpoints = this._getCheckpoints(totalYears);
    return checkpoints.map((yr) => ({
      years: yr,
      conservative: this._fv(monthly, this.RETURNS.conservative, yr),
      moderate:     this._fv(monthly, this.RETURNS.moderate, yr),
      optimistic:   this._fv(monthly, this.RETURNS.optimistic, yr),
    }));
  }

  _getCheckpoints(totalYears) {
    // Generate meaningful checkpoints up to totalYears
    const points = new Set([1, 3, 5, 10, 15, 20, 25, 30, 35, 40]);
    // Always include the target year
    points.add(totalYears);
    return [...points].filter((y) => y <= totalYears).sort((a, b) => a - b);
  }

  _customizeSteps(steps, goals, amount, risk) {
    if (!goals) return steps;
    const gl = goals.toLowerCase();
    const customized = [...steps];

    if (gl.includes('house') || gl.includes('home')) {
      customized[0] = `For a home down payment goal: use a taxable brokerage account or high-yield savings for money you'll need in under 5 years. Stocks are too volatile for near-term goals.`;
    } else if (gl.includes('retire') || gl.includes('retirement')) {
      customized[0] = `For retirement: prioritize tax-advantaged accounts — 401k to match → max Roth IRA ($7,000) → max 401k ($23,000). This order saves the most in taxes over your career.`;
    } else if (gl.includes('emerg')) {
      customized[0] = `Build your $1,000 starter emergency fund first, then a full 3–6 month fund in a HYSA, before routing money into investments. Emergency fund comes before investing.`;
    }

    if (parseFloat(amount) < 100) {
      customized[1] = `Starting with $${amount}/month is great — consistency matters more than amount. Increase contributions by $25–50 whenever you get a raise or pay off a debt.`;
    }

    return customized;
  }
}
