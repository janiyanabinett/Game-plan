/**
 * LoanAnalyzerAgent
 * Federal student loan repayment plan calculator.
 * Implements Standard, Graduated, SAVE, IBR, and PSLF plans
 * using 2024-2025 federal guidelines — fully self-contained, no API needed.
 */

export class LoanAnalyzerAgent {
  // 2024 Federal Poverty Guidelines (continental US)
  FPL = {
    1: 15060, 2: 20440, 3: 25820, 4: 31200,
    5: 36580, 6: 41960, 7: 47340, 8: 52720,
  };

  analyze({ balance, interestRate, income, familySize, loanType }) {
    const P = parseFloat(balance);
    const annualRate = parseFloat(interestRate) / 100;
    const r = annualRate / 12;
    const agi = parseFloat(income);
    const size = Math.min(8, Math.max(1, parseInt(familySize) || 1));
    const isPrivate = loanType === 'private';

    const plans = [];

    // Standard 10-year plan
    plans.push(this._standardPlan(P, r));

    // Graduated plan
    plans.push(this._graduatedPlan(P, r, annualRate));

    if (!isPrivate) {
      // SAVE plan (Saving on a Valuable Education)
      plans.push(this._savePlan(P, r, agi, size, annualRate));

      // IBR plan
      plans.push(this._ibrPlan(P, r, agi, size, annualRate));

      // PSLF note (same as SAVE but 10-year forgiveness)
      plans.push(this._pslfPlan(P, r, agi, size, annualRate));
    }

    const recommendation = this._recommend(plans, agi, P, isPrivate, annualRate);
    const forgivenessPotential = this._forgivenessNote(agi, P, size, isPrivate, annualRate);
    const tips = this._tips(plans, agi, P, annualRate, isPrivate);

    return { plans, recommendation, forgivenessPotential, tips };
  }

  // ── Fixed-payment amortization helpers ─────────────────────────────────
  _fixedPayment(P, r, n) {
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  _amortize(P, r, monthlyPayment) {
    let bal = P;
    let totalInterest = 0;
    let months = 0;
    const MAX = 360;
    while (bal > 0.01 && months < MAX) {
      const interest = bal * r;
      totalInterest += interest;
      bal = bal + interest - monthlyPayment;
      months++;
    }
    return { totalInterest: Math.round(totalInterest), months, totalPaid: Math.round(P + totalInterest) };
  }

  // ── Plan calculators ─────────────────────────────────────────────────────
  _standardPlan(P, r) {
    const monthlyPayment = Math.round(this._fixedPayment(P, r, 120));
    const result = this._amortize(P, r, monthlyPayment);
    return {
      name: 'Standard (10-Year)',
      monthlyPayment,
      totalPaid: result.totalPaid,
      totalInterest: result.totalInterest,
      payoffYears: Math.ceil(result.months / 12),
      description: 'Fixed equal payments over 10 years. Least total interest of any plan.',
      bestFor: 'Borrowers who can afford the payment and want to minimize total interest paid.',
    };
  }

  _graduatedPlan(P, r, annualRate) {
    // Graduated: starts at ~60% of standard payment, increases ~10% every 2 years over 10 years
    const standard = this._fixedPayment(P, r, 120);
    const startPayment = Math.round(standard * 0.6);

    // Simulate graduated payments
    let bal = P;
    let totalInterest = 0;
    let totalPaid = 0;
    let months = 0;
    const MAX = 360;

    for (let period = 0; period < 5 && bal > 0; period++) {
      const payment = Math.round(startPayment * Math.pow(1.1, period));
      for (let m = 0; m < 24 && bal > 0.01 && months < MAX; m++) {
        const interest = bal * r;
        totalInterest += interest;
        totalPaid += payment;
        bal = bal + interest - payment;
        months++;
      }
    }

    return {
      name: 'Graduated (10-Year)',
      monthlyPayment: startPayment,
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      payoffYears: Math.ceil(months / 12),
      description: `Starts at ~$${startPayment}/month, increases every 2 years. Ends at ~$${Math.round(startPayment * Math.pow(1.1, 4))}/month.`,
      bestFor: 'New grads expecting income to grow significantly over time.',
    };
  }

  _savePlan(P, r, agi, familySize, annualRate) {
    const fpl = this.FPL[familySize] || this.FPL[1];
    // SAVE: 5% of discretionary income for undergrad loans
    // Discretionary income = AGI - 225% of FPL
    const discretionary = Math.max(0, agi - 2.25 * fpl);
    const monthlyPayment = Math.round((discretionary * 0.05) / 12);

    // If payment doesn't cover interest, govt covers the gap (SAVE subsidy)
    const monthlyInterest = P * r;
    const effectivePayment = Math.max(monthlyPayment, 0);

    let result;
    if (effectivePayment >= monthlyInterest * 1.05) {
      result = this._amortize(P, r, effectivePayment);
    } else {
      // Forgiveness scenario: balance doesn't grow due to interest subsidy, forgiven at 20-25 years
      result = {
        months: 240, // 20 years
        totalInterest: Math.round(monthlyInterest * 240),
        totalPaid: Math.round(effectivePayment * 240),
      };
    }

    return {
      name: 'SAVE Plan (Income-Driven)',
      monthlyPayment: Math.max(0, monthlyPayment),
      totalPaid: result.totalPaid,
      totalInterest: result.totalInterest,
      payoffYears: Math.ceil(result.months / 12),
      description: 'Newest IDR plan. Payments = 5% of discretionary income above 225% FPL. Unpaid interest covered by government — balance cannot grow.',
      bestFor: 'Borrowers with high debt-to-income ratio or those pursuing loan forgiveness.',
    };
  }

  _ibrPlan(P, r, agi, familySize, annualRate) {
    const fpl = this.FPL[familySize] || this.FPL[1];
    // IBR: 10% of discretionary income (AGI - 150% FPL) for new borrowers after 7/1/2014
    const discretionary = Math.max(0, agi - 1.5 * fpl);
    const monthlyPayment = Math.max(0, Math.round((discretionary * 0.10) / 12));

    const monthlyInterest = P * r;
    let result;
    if (monthlyPayment >= monthlyInterest * 1.05) {
      result = this._amortize(P, r, monthlyPayment);
    } else {
      result = {
        months: 240,
        totalInterest: Math.round(monthlyInterest * 240),
        totalPaid: Math.round(monthlyPayment * 240),
      };
    }

    return {
      name: 'IBR (Income-Based Repayment)',
      monthlyPayment,
      totalPaid: result.totalPaid,
      totalInterest: result.totalInterest,
      payoffYears: Math.ceil(result.months / 12),
      description: 'Payments = 10% of discretionary income (AGI minus 150% of poverty line). Forgiveness after 20 years (taxable).',
      bestFor: 'Borrowers who don\'t qualify for SAVE or prefer the established IBR structure.',
    };
  }

  _pslfPlan(P, r, agi, familySize, annualRate) {
    const fpl = this.FPL[familySize] || this.FPL[1];
    const discretionary = Math.max(0, agi - 2.25 * fpl);
    const monthlyPayment = Math.max(0, Math.round((discretionary * 0.05) / 12));

    const paidOver10Yrs = monthlyPayment * 120;
    const monthlyInterest = P * r;
    let balanceAfter10 = P;
    let interestPaid = 0;

    for (let m = 0; m < 120; m++) {
      const interest = balanceAfter10 * r;
      interestPaid += Math.min(interest, monthlyPayment);
      // SAVE subsidy: balance doesn't grow if payment < interest
      if (monthlyPayment < interest) {
        // No negative amortization under SAVE
      } else {
        balanceAfter10 = balanceAfter10 + interest - monthlyPayment;
      }
    }

    const forgiven = Math.max(0, Math.round(balanceAfter10));

    return {
      name: 'PSLF (Public Service Forgiveness)',
      monthlyPayment,
      totalPaid: Math.round(paidOver10Yrs),
      totalInterest: Math.round(interestPaid),
      payoffYears: 10,
      description: `Work for government/qualifying nonprofit 10 years + 120 qualifying SAVE/IDR payments → remaining balance FORGIVEN tax-free. Estimated forgiven amount: $${forgiven.toLocaleString()}.`,
      bestFor: 'Educators, nurses, social workers, government employees, nonprofit workers.',
    };
  }

  // ── Recommendation logic ────────────────────────────────────────────────
  _recommend(plans, agi, balance, isPrivate, annualRate) {
    if (isPrivate) {
      const monthlyIncome = agi / 12;
      const standard = plans.find((p) => p.name.includes('Standard'));
      if (standard && standard.monthlyPayment < monthlyIncome * 0.10) {
        return `Since these are private loans, income-driven repayment isn't available. The Standard 10-Year plan at $${standard.monthlyPayment}/month is recommended — it keeps you under 10% of monthly income and eliminates the loan in 10 years with the least total interest. If the payment is unaffordable, contact your lender about hardship options or consider refinancing to a lower rate (though this removes any federal protections).`;
      }
      return `With private loans, you're limited to the repayment terms in your loan agreement. Contact your servicer to discuss options. If you have good credit and income, refinancing through SoFi, Earnest, or Splash Financial may lower your rate. Be aware: refinancing federal loans into private loses all federal protections (IDR, forgiveness, deferment).`;
    }

    const debtToIncome = balance / agi;
    const save = plans.find((p) => p.name.includes('SAVE'));
    const standard = plans.find((p) => p.name.includes('Standard'));
    const pslf = plans.find((p) => p.name.includes('PSLF'));

    if (debtToIncome > 1.5) {
      return `With a high debt-to-income ratio ($${balance.toLocaleString()} debt vs $${agi.toLocaleString()} income), the SAVE Plan is recommended. Your monthly payment of $${save?.monthlyPayment}/month is affordable, and the government covers unpaid interest so your balance won't grow. After 20–25 years, any remaining balance is forgiven. If you work in public service, PSLF could eliminate the balance in just 10 years — worth exploring if that career path is a possibility.`;
    }
    if (debtToIncome < 0.5 && standard && standard.monthlyPayment < agi / 12 * 0.15) {
      return `Your debt-to-income ratio is manageable. The Standard 10-Year plan at $${standard.monthlyPayment}/month is recommended — you'll pay the least total interest ($${standard.totalInterest.toLocaleString()}) and be debt-free in 10 years. If your income grows, making extra payments above the minimum will pay it off even faster and save additional interest.`;
    }
    return `The SAVE Plan is the most flexible option at $${save?.monthlyPayment}/month. It protects you from balance growth and leaves room in your budget. If you later find yourself earning significantly more, you can always make extra payments or switch to Standard. Check StudentAid.gov's Loan Simulator to confirm these figures with your exact loans.`;
  }

  _forgivenessNote(agi, balance, familySize, isPrivate, annualRate) {
    if (isPrivate) {
      return 'Private loans are not eligible for federal forgiveness programs. Only federal student loans qualify for PSLF, IDR forgiveness, Teacher Loan Forgiveness, and other federal programs.';
    }

    const fpl = this.FPL[familySize] || this.FPL[1];
    const discretionary = Math.max(0, agi - 2.25 * fpl);
    const savePayment = Math.round((discretionary * 0.05) / 12);
    const monthlyInterest = (balance * annualRate) / 12;
    const notes = [];

    notes.push(`**PSLF (Public Service Loan Forgiveness)**: Work for a qualifying employer (federal/state/local government, 501(c)(3) nonprofits, AmeriCorps, Peace Corps) for 10 years while making 120 qualifying IDR payments → remaining balance forgiven 100% tax-free. This is the best deal in student loans for eligible borrowers.`);

    if (savePayment < monthlyInterest) {
      notes.push(`**SAVE/IDR Forgiveness**: At your income level, your SAVE payment ($${savePayment}/month) doesn't cover the monthly interest, meaning your balance stays level (government covers the gap). After 20 years (25 for grad loans), the remaining balance is forgiven — though this forgiveness is currently taxable as income.`);
    }

    notes.push(`**Teacher Loan Forgiveness**: Teach full-time for 5 consecutive years at a low-income school → up to $17,500 forgiven. Can be combined with PSLF (teach 5 years for Teacher Forgiveness, continue to year 10 for PSLF).`);

    return notes.join('\n\n');
  }

  _tips(plans, agi, balance, annualRate, isPrivate) {
    const tips = [];
    const standard = plans.find((p) => p.name.includes('Standard'));
    const save = plans.find((p) => p.name.includes('SAVE'));

    tips.push(`Log into StudentAid.gov to see all your federal loans, servicer contact info, and use the official Loan Simulator — it will confirm these calculations using your exact loan data.`);

    if (!isPrivate && save && standard && save.monthlyPayment < standard.monthlyPayment * 0.5) {
      const monthlySavings = standard.monthlyPayment - save.monthlyPayment;
      tips.push(`You'd save $${monthlySavings}/month choosing SAVE over Standard. Consider investing that difference ($${monthlySavings}/month in a Roth IRA) — over 10 years at 7%, that grows to $${Math.round(monthlySavings * ((Math.pow(1 + 0.07/12, 120) - 1) / (0.07/12))).toLocaleString()}.`);
    }

    if (!isPrivate) {
      tips.push(`If pursuing PSLF, submit the Employment Certification Form (now called PSLF Form) every year — don't wait until year 10. This confirms your employer qualifies and keeps your count accurate. Use the PSLF Help Tool at StudentAid.gov.`);
    } else {
      tips.push(`For private loans, check your rate against current refinancing offers. If your credit score is 700+ and you have stable income, you may qualify for a lower rate through Earnest, SoFi, or Splash Financial — potentially saving thousands in interest.`);
    }

    return tips;
  }
}
