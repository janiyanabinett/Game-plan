/**
 * FinAdvisorAgent
 * Rule-based NLP financial literacy advisor for college students.
 * Uses intent classification, keyword scoring, and number extraction
 * to generate personalized, contextual financial guidance.
 */

export class FinAdvisorAgent {
  constructor() {
    this.intents = {
      budgeting: {
        weight: 1,
        keywords: ['budget', 'budgeting', 'spending', 'spend', 'track', 'tracking', 'expenses',
          '50/30/20', 'fifty thirty', 'zero based', 'zero-based', 'where does my money', 'money go',
          'categorize', 'categories', 'cash flow', 'overspend', 'monthly plan', 'allowance'],
      },
      emergency_fund: {
        weight: 1,
        keywords: ['emergency fund', 'emergency', 'rainy day', 'safety net', 'cushion', 'buffer',
          'unexpected expense', 'job loss', 'savings account', 'how much to save', 'three months',
          'six months', '3-6 months', 'starter fund'],
      },
      credit_score: {
        weight: 1,
        keywords: ['credit score', 'fico', 'credit report', 'credit history', 'credit rating',
          'credit bureau', 'equifax', 'transunion', 'experian', 'hard inquiry', 'soft inquiry',
          'build credit', 'improve credit', 'raise credit', 'bad credit', 'no credit'],
      },
      credit_card: {
        weight: 1,
        keywords: ['credit card', 'card balance', 'utilization', 'credit limit', 'minimum payment',
          'apr', 'interest rate', 'rewards', 'cash back', 'secured card', 'student card',
          'carry a balance', 'pay off card', 'statement balance', 'annual fee'],
      },
      banking: {
        weight: 1,
        keywords: ['bank', 'checking', 'savings account', 'high yield', 'hysa', 'apy', 'interest',
          'ally', 'marcus', 'sofi', 'online bank', 'fdic', 'routing number', 'direct deposit',
          'overdraft', 'atm', 'fee', 'monthly fee'],
      },
      student_loans: {
        weight: 1.5,
        keywords: ['student loan', 'student debt', 'federal loan', 'private loan', 'fafsa',
          'pslf', 'public service', 'income driven', 'idr', 'save plan', 'ibr', 'paye',
          'loan forgiveness', 'repayment plan', 'loan servicer', 'subsidized', 'unsubsidized',
          'plus loan', 'studentaid', 'deferment', 'forbearance', 'default', 'refinance'],
      },
      debt_payoff: {
        weight: 1,
        keywords: ['debt', 'pay off debt', 'payoff', 'avalanche', 'snowball', 'high interest',
          'debt free', 'owing', 'owe', 'balance', 'car loan', 'personal loan', 'medical bill',
          'pay down', 'extra payment', 'debt to income', 'good debt', 'bad debt'],
      },
      investing: {
        weight: 1,
        keywords: ['invest', 'investing', 'stock', 'stocks', 'etf', 'index fund', 'mutual fund',
          'brokerage', 'dividend', 'portfolio', 'market', 's&p 500', 'vti', 'fzrox',
          'bonds', 'asset allocation', 'diversify', 'expense ratio', 'active fund', 'passive'],
      },
      compound_interest: {
        weight: 1,
        keywords: ['compound', 'compound interest', 'grow money', 'start early', 'time in market',
          'rule of 72', 'double money', 'returns', 'interest on interest', 'exponential'],
      },
      retirement: {
        weight: 1,
        keywords: ['retirement', '401k', '401(k)', 'roth ira', 'traditional ira', 'ira',
          'roth', 'employer match', '403b', 'pension', 'retire', 'retirement age', 'social security',
          'nest egg', 'withdraw', 'required minimum', 'rmd', 'contribution limit'],
      },
      taxes: {
        weight: 1,
        keywords: ['tax', 'taxes', 'filing', 'file taxes', 'w-2', 'w2', '1099', 'deduction',
          'tax bracket', 'standard deduction', 'taxable income', 'refund', 'owe taxes',
          'federal tax', 'state tax', 'self employment', 'quarterly', 'estimated tax',
          'turbotax', 'free file', 'irs', 'american opportunity', 'education credit'],
      },
      insurance: {
        weight: 1,
        keywords: ['insurance', 'health insurance', 'renters insurance', 'auto insurance', 'car insurance',
          'life insurance', 'premium', 'deductible', 'copay', 'coinsurance', 'hsa', 'hdhp',
          'aca', 'marketplace', 'medicaid', 'cobra', 'out of pocket', 'coverage', 'policy'],
      },
      net_worth: {
        weight: 1,
        keywords: ['net worth', 'assets', 'liabilities', 'wealth', 'financial health', 'balance sheet',
          'what i own', 'what i owe', 'track wealth', 'financial snapshot'],
      },
      housing: {
        weight: 1,
        keywords: ['rent', 'buy a house', 'mortgage', 'homeowner', 'renting vs buying', 'down payment',
          'landlord', 'apartment', 'lease', 'real estate', 'property', 'housing cost', 'pmi'],
      },
      income: {
        weight: 1,
        keywords: ['income', 'salary', 'raise', 'negotiat', 'side hustle', 'freelance', 'gig',
          'extra money', 'earn more', 'second job', 'passive income', 'part time', 'stipend'],
      },
      getting_started: {
        weight: 1,
        keywords: ['where do i start', 'getting started', 'beginner', 'new to finance', 'first job',
          'graduating', 'just graduated', 'financial advice', 'first steps', 'dont know where',
          'overwhelmed', 'help me', 'what should i do first', 'priority'],
      },
    };

    this.greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'howdy', 'what\'s up', 'sup'];
    this.thanks = ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'perfect', 'awesome'];
  }

  // ── Classify intent ──────────────────────────────────────────────────────
  classify(text) {
    const lower = text.toLowerCase();

    if (this.greetings.some((g) => lower.trim().startsWith(g))) {
      return { intent: 'greeting', score: 10 };
    }
    if (this.thanks.some((t) => lower.includes(t))) {
      return { intent: 'thanks', score: 10 };
    }

    let best = { intent: 'general', score: 0 };

    for (const [intent, cfg] of Object.entries(this.intents)) {
      const hits = cfg.keywords.filter((kw) => lower.includes(kw)).length;
      const score = hits * (cfg.weight || 1);
      if (score > best.score) best = { intent, score };
    }

    return best;
  }

  // ── Extract numbers/context from text ────────────────────────────────────
  extractContext(text) {
    const amounts = [...text.matchAll(/\$[\d,]+k?|\b[\d,]+k\b/gi)].map((m) => m[0]);
    const percentages = [...text.matchAll(/\b\d+\.?\d*\s*%/g)].map((m) => m[0]);
    const ageMatch = text.match(/\b(1[89]|2\d|3[0-5])\b.*?\b(year|old|yo)\b/i) ||
                     text.match(/\b(year|old|yo)\b.*?\b(1[89]|2\d|3[0-5])\b/i);
    const age = ageMatch ? parseInt(ageMatch[0].match(/\d+/)[0]) : null;
    const hasDebt = /debt|loan|owe|balance|credit card/i.test(text);
    const isStudent = /student|college|university|grad|graduate|campus/i.test(text);
    const hasJob = /job|work|employ|salary|income|earn/i.test(text);

    return { amounts, percentages, age, hasDebt, isStudent, hasJob };
  }

  // ── Main respond method ──────────────────────────────────────────────────
  respond(text, history = []) {
    const { intent } = this.classify(text);
    const ctx = this.extractContext(text);
    const lastTopic = history.length > 1 ? history[history.length - 2]?.intent : null;

    return this.responses[intent]?.(ctx, text, lastTopic) ?? this.responses.general(ctx, text, lastTopic);
  }

  // ── Response templates ──────────────────────────────────────────────────
  responses = {
    greeting: () =>
      `Hey there! I'm your FinLit financial advisor agent. I'm here to help you build a strong money foundation as a college student or new grad.\n\nHere are some popular topics I can help with:\n• 💰 Building your first budget (50/30/20 rule)\n• 💳 Credit scores and credit cards\n• 📈 Starting to invest (Roth IRA, index funds)\n• 🎓 Student loan repayment strategies\n• 🛡️ Emergency funds and insurance\n• 🧾 Filing taxes for the first time\n\nWhat financial topic is on your mind?`,

    thanks: () =>
      `You're welcome! Financial literacy is one of the most valuable skills you can build — the fact that you're asking questions puts you ahead of most people your age.\n\nIs there anything else you'd like to dive deeper on? I'm happy to go more detailed on any topic.`,

    budgeting: (ctx) => {
      const personalNote = ctx.amounts.length > 0
        ? `Based on the amount you mentioned (${ctx.amounts[0]}), let's look at how a budget could work for you.\n\n`
        : '';
      return `${personalNote}**The 50/30/20 Rule — Your Starting Framework**\n\nSplit your after-tax income into three buckets:\n• **50% → Needs**: Rent, groceries, utilities, minimum debt payments, transport\n• **30% → Wants**: Dining out, entertainment, clothing, subscriptions\n• **20% → Savings/Debt**: Emergency fund, retirement accounts, extra debt payments\n\n**Making It Stick**\nThe best budget is one you'll actually use. Pick a tracking method:\n1. **App**: Copilot or YNAB sync to your accounts and auto-categorize\n2. **Spreadsheet**: Simple Google Sheet with two columns — income vs. expenses\n3. **Envelope method**: Cash in physical envelopes per category\n\n**Weekly 10-Minute Check-In**: Every Sunday, review actual vs. budgeted. Did you overspend dining? Cut it the rest of the month. This habit prevents month-end surprises.\n\n**Sinking Funds** are key for college students — set aside $15–30/month for irregular costs (textbooks, car registration, holiday gifts) so they don't blow your budget when they arrive.\n\nWant me to go deeper on any part of budgeting?`;
    },

    emergency_fund: (ctx) => {
      const amtNote = ctx.amounts.length > 0
        ? `You mentioned ${ctx.amounts[0]} — ` : '';
      return `${amtNote}**Your Emergency Fund — The Foundation Before Everything Else**\n\nAn emergency fund is the financial safety net that keeps unexpected expenses from derailing your entire plan. Without one, every surprise (car repair, medical bill, laptop dying) becomes high-interest credit card debt.\n\n**How Much to Target**\n• **Starter goal**: $1,000 — handle this before aggressive investing or extra debt payments\n• **Full goal**: 3–6 months of essential expenses\n• For students: $2,000–$5,000 is usually adequate\n• Freelancers/irregular income: aim for 6 months\n\n**Where to Keep It**\nHigh-yield savings account (HYSA) — earns 4–5% APY while staying accessible. Top options: Ally, Marcus by Goldman Sachs, SoFi.\n\n❌ NOT in checking (too easy to spend)\n❌ NOT invested in stocks (value can drop 30% right when you need it)\n\n**What Qualifies as an Emergency**\n✅ Job loss, urgent car repair, medical bills, broken essential appliance\n❌ Vacation, concert tickets, new phone (save for those separately in sinking funds)\n\n**Building It Fast**: Even saving $25/week puts $1,300 in your emergency fund in one year. Automate a transfer the day after payday so it never feels optional.`;
    },

    credit_score: (ctx) => `**How Your Credit Score Works**\n\nYour FICO score (300–850) is used by lenders, landlords, and sometimes employers. It has 5 components:\n\n| Factor | Weight | What It Means |\n|---|---|---|\n| Payment History | 35% | On-time payments — never miss one |\n| Credit Utilization | 30% | Balance ÷ limit — keep under 30%, ideally under 10% |\n| Length of History | 15% | Older accounts help — don't close old cards |\n| Credit Mix | 10% | Having both cards and loans helps |\n| New Credit | 10% | Too many hard inquiries in a short period hurts |\n\n**Score Ranges**\n• 800–850: Exceptional — best rates on everything\n• 740–799: Very Good\n• 670–739: Good — most loans approved\n• 580–669: Fair — higher interest rates\n• Below 580: Poor — limited options\n\n**Building Credit from Scratch**\n1. Open a secured credit card (deposit $200–500 as collateral) or a student card\n2. Use it for one recurring bill (Netflix, gas)\n3. Pay the full balance every single month\n4. Set up autopay for the full balance — not just minimum\n5. Keep utilization under 30% of your limit\n\n**Free Credit Monitoring**: Check your report free at AnnualCreditReport.com (all 3 bureaus weekly). Apps like Credit Karma give free score tracking.\n\nOne missed payment can drop your score 50–100 points and stays on your report for 7 years. That single habit — paying on time — matters more than everything else combined.`,

    credit_card: (ctx) => `**Using Credit Cards Wisely — The One Rule That Changes Everything**\n\nCredit cards are powerful tools or debt traps. The difference is one habit: **pay the full statement balance every month, no exceptions**.\n\n**Why Carrying a Balance Is Devastating**\nA $1,000 balance at 24% APR costs $240/year in interest. If you only pay the minimum ($25–30/month), that $1,000 takes 5+ years to pay off and costs $700+ in interest.\n\n**Smart Card Strategy for Students**\n1. **Get a student card** (Discover it Student, Chase Freedom Student) or secured card if no history\n2. Use it only for planned purchases you'd make anyway — groceries, gas, subscriptions\n3. **Pay the FULL statement balance before the due date**\n4. Set up autopay for the full balance (not the minimum)\n5. Keep utilization under 30% — if your limit is $1,000, don't charge more than $300\n6. Never use for cash advances — immediate interest and fees\n\n**Rewards for Students**\nA flat 1.5% cash-back card on $400/month spending = $72/year free. Not life-changing, but free for zero extra effort. Don't chase complex rewards until you've mastered the basics.\n\n**Warning Signs You're Misusing Credit**\n• You only pay the minimum payment each month\n• Your balance grows month over month\n• You use the card for things you can't otherwise afford\n\nBuilding a 2–3 year history of on-time, full payments will put your credit score in the 720–780+ range — unlocking better rates on everything.`,

    banking: () => `**Choosing the Right Bank Accounts**\n\nWhere you keep your money matters more than most people realize. Most big-bank savings accounts pay 0.01% APY. A high-yield savings account (HYSA) pays 4–5% APY — a 400–500x difference.\n\n**Account Structure to Set Up**\n\n**1. Checking Account** — for bills and daily spending\n• Zero monthly fees and no minimums\n• Free ATM access or reimbursements\n• Best options: Ally, SoFi, Schwab, Chime\n\n**2. High-Yield Savings Account (HYSA)** — for emergency fund and goals\n• Earns 4–5% APY (2024 rates)\n• Fully FDIC insured up to $250,000\n• Best options: Ally (4.20%), Marcus by Goldman Sachs, UFB Direct\n• Transfers to checking in 1–3 business days\n\n**The Math on HYSAs**\n$5,000 in a traditional savings account at 0.01% = $0.50/year\n$5,000 in a HYSA at 4.5% = $225/year\nThat's $224.50 in free interest — just for switching banks.\n\n**For Savings Goals**: Consider opening multiple HYSA sub-accounts (most banks allow this) labeled by goal — "Emergency Fund," "Spring Break Trip," "New Laptop." Out of sight = out of mind in the best way.\n\n**Online Banks vs. Traditional Banks**: Online banks are just as safe (FDIC insured) but have no physical branches. You get better rates in exchange for doing everything digitally — a worthwhile trade for most students.`,

    student_loans: (ctx) => {
      const amtNote = ctx.amounts.length > 0
        ? `With the loan amount you mentioned (${ctx.amounts[0]}), here's what you need to know:\n\n`
        : '';
      return `${amtNote}**Student Loans — Know Your Options**\n\n**Federal vs. Private Loans** (the most important distinction)\nFederal loans come with income-driven repayment, forgiveness programs, deferment, and hardship protections. Private loans have none of these — treat them as high-priority debt to aggressively pay off.\n\n**Key Federal Repayment Plans**\n\n**Standard (10 years)**: Fixed payment, lowest total interest. Best if you can afford it.\n\n**SAVE Plan (newest IDR)**: Pay 5–10% of discretionary income. Remaining balance forgiven after 20–25 years. Interest subsidy prevents balance from growing if payment doesn't cover it.\n\n**IBR**: Pay 10–15% of discretionary income. Forgiveness after 20–25 years.\n\n**PSLF (Public Service Loan Forgiveness)**: Work for government or qualifying nonprofit 10 years + make 120 IDR payments = remaining balance FULLY forgiven, tax-free. Best deal in student loans for qualifying borrowers.\n\n**Graduated**: Starts lower, increases every 2 years. Good for careers with growing income.\n\n**Action Steps**\n1. Log into StudentAid.gov to see all your federal loans, balances, and servicer\n2. Use the Loan Simulator at StudentAid.gov to compare plans for your income\n3. If pursuing PSLF, submit the Employment Certification Form every year — don't wait until year 10\n4. Never miss a payment — late payments can cause capitalized interest and ruin forgiveness progress\n\nWant me to explain any specific repayment plan in more detail?`;
    },

    debt_payoff: (ctx) => `**Paying Off Debt Strategically**\n\n**Priority Order** (follow this sequence):\n1. Pay minimums on all debts — never miss a payment\n2. Build $1,000 starter emergency fund\n3. Capture full employer 401k match (free money first)\n4. Aggressively attack high-interest debt (>7–8% APR)\n5. Full 3–6 month emergency fund\n6. Invest and pay lower-interest debt simultaneously\n\n**Avalanche vs. Snowball — Choose Your Strategy**\n\n**Avalanche Method** (mathematically optimal):\n• Pay minimums on all debts\n• Throw all extra money at the HIGHEST interest rate debt first\n• Then attack the next highest, and so on\n• Saves the most money in total interest\n• Can feel slow if your highest-rate debt has a big balance\n\n**Snowball Method** (motivationally powerful):\n• Pay minimums on all debts\n• Attack the SMALLEST balance first regardless of rate\n• Each eliminated debt frees up cash flow and builds confidence\n• Costs more in interest but higher completion rates in studies\n\n**Rule of Thumb on Interest Rates**:\n• Above 7–8%: Pay aggressively — you earn that rate guaranteed\n• 4–6%: Consider paying minimums and investing the difference\n• Below 4%: Likely better to invest than pay extra on the debt\n\n**Use the Debt Calculator** in this app to get exact payoff timelines and interest comparisons for both methods with your specific numbers.`,

    investing: (ctx) => `**Getting Started with Investing**\n\n**The Key Vehicles for Beginners**\n\n**Stocks (Equities)**: Ownership stake in a company. Higher potential return (~10% historical avg for S&P 500), higher volatility year-to-year. Best for 10+ year horizons.\n\n**Bonds (Fixed Income)**: Lending money to government/corporations. Lower risk, lower return (2–5%). Used to stabilize portfolios as you near your goal.\n\n**Index ETFs** — Start here: A basket of hundreds of stocks in one purchase. Instant diversification, very low cost (0.03–0.20% expense ratio), trades like a stock.\n• VTI / FZROX: Total US stock market\n• VXUS: International stocks\n• BND: Total bond market\n\n**Why Index Funds Beat Active Funds**\nOver 15 years, ~90% of actively managed funds underperform their benchmark index. The 1–2% higher expense ratio compounds massively against you. Stick to low-cost index funds.\n\n**Account Priority**\n1. 401k to employer match (free money)\n2. Max Roth IRA ($7,000/year at Fidelity, Vanguard, or Schwab — free to open)\n3. Max 401k ($23,000/year)\n4. Taxable brokerage for additional investing\n\n**Starting Portfolio for a 20-Something**\n• 90% total stock market index (VTI or FXAIX)\n• 10% international index (VXUS)\n\nTime in the market beats timing the market. Start with $25/month if that's all you have. The habit matters more than the amount at this stage.`,

    compound_interest: (ctx) => {
      const ageNote = ctx.age
        ? `At ${ctx.age}, you have ${65 - ctx.age} years until traditional retirement age — that's an enormous compounding runway.\n\n`
        : '';
      return `${ageNote}**Compound Interest — Why Starting Now Changes Everything**\n\nCompound interest means earning returns on your returns. Your money grows exponentially, not linearly. Einstein reportedly called it "the eighth wonder of the world."\n\n**The Rule of 72**: Divide 72 by your expected return to find how long it takes to double your money.\n• At 7%: ~10 years to double\n• At 10%: ~7.2 years to double\n\n**The Dramatic Math of Starting Early**\n\nSarah invests $200/month from age 22 to 32 (10 years, $24,000 total). She then stops.\nMike invests $200/month from age 32 to 62 (30 years, $72,000 total).\n\nAt age 62, assuming 7% average annual return:\n• **Sarah: ~$337,000** (invested $24,000)\n• **Mike: ~$227,000** (invested $72,000)\n\nSarah invested 1/3 as much and ends up with 50% MORE. Time is the most powerful variable.\n\n**What Every Year of Delay Costs**\nDelaying from 22 to 32 on $200/month = ~$170,000 in lost retirement wealth.\nDelaying from 22 to 25 = ~$60,000+ in lost wealth.\n\n**The Action**: Open a Roth IRA today at Fidelity or Schwab. Invest in a total market index fund. Start with whatever you can — even $25/month. The habit compounds too.`;
    },

    retirement: (ctx) => `**Retirement Accounts — Your Wealth-Building Engines**\n\n**401(k) / 403(b) — Always Start Here**\n• Offered by your employer; contributions reduce taxable income (traditional) or grow tax-free (Roth 401k)\n• 2024 limit: $23,000/year\n• **Employer match = free money**: If your employer matches 50% of contributions up to 6% of salary, contribute at least 6% — that's an immediate 50% return before any market gains\n• Check your vesting schedule before leaving a job — unvested match money stays with the employer\n\n**Roth IRA — The Young Person's Secret Weapon**\n• Contribute after-tax money; withdrawals in retirement are 100% tax-free forever\n• 2024 limit: $7,000/year (income limit: under ~$146,000 single)\n• Open for free at Fidelity, Vanguard, or Schwab — takes 10 minutes\n• Best investment: total stock market index fund (FZROX at Fidelity is 0% expense ratio)\n• $500/month from age 22 to 65 at 7% return = **over $1.4 million — completely tax-free**\n\n**Traditional IRA**: Tax deduction now; taxable in retirement. Better if you expect a lower tax bracket in retirement.\n\n**Roth vs. Traditional Decision**\nFor most college students and young grads earning under $60,000: **Roth wins**. You're in a lower tax bracket now than you'll be at retirement. Pay taxes now at the low rate; withdraw tax-free later.\n\n**The Order of Operations**:\n1. 401k to full employer match\n2. Max Roth IRA ($7,000)\n3. Max 401k ($23,000)\n4. Taxable brokerage account`,

    taxes: (ctx) => `**Taxes for College Students and New Grads**\n\n**How Tax Brackets Actually Work** (many people misunderstand this)\nThe US uses marginal brackets — you don't pay the top rate on all your income. Each bracket applies only to the income within it.\n\n2024 Single Filer Brackets:\n• 10% on first $11,600\n• 12% on $11,601–$47,150\n• 22% on $47,151–$100,525\n\nOn $45,000 income, your effective tax rate is ~12% — NOT 22%.\n\n**Standard Deduction**: Reduces your taxable income before any brackets apply.\n• 2024: $14,600 (single), $29,200 (married filing jointly)\n• Most students use the standard deduction\n\n**Education Tax Credits** (use these!):\n• American Opportunity Credit: Up to $2,500/year for first 4 years of college\n• Lifetime Learning Credit: Up to $2,000/year for any higher education\n• Student Loan Interest Deduction: Up to $2,500 of interest is deductible (income limits apply)\n\n**Free Filing Options**\n• IRS Free File: Free if income under $79,000 at IRS.gov\n• FreeTaxUSA: Free federal, $15 state\n• VITA centers: Free in-person help for qualifying taxpayers\n\n**Gig/Freelance Income (1099)**\nYou owe income tax + self-employment tax (15.3%). Set aside 25–30% of every payment. Pay quarterly estimated taxes (April, June, September, January) to avoid underpayment penalties.\n\n**Biggest Win**: Contribute to a Traditional 401k to reduce taxable income dollar-for-dollar — if you earn $40,000 and contribute $4,000, you're taxed on $36,000.`,

    insurance: () => `**Insurance — Protect Everything You're Building**\n\n**Health Insurance** (most critical for students):\n• Stay on parents' plan until age 26 if possible — usually the cheapest option\n• First job: enroll in employer coverage during open enrollment — employers subsidize 50–80% of premiums\n• On your own: ACA Marketplace (healthcare.gov) — many students qualify for substantial subsidies\n• Low income: Check Medicaid eligibility — may be free or near-free\n\n**Renters Insurance** — The Best Insurance Value for Students:\n• Cost: $10–20/month (~$150–240/year)\n• Covers: Theft of your laptop, phone, and belongings; water/fire damage to your stuff; liability if someone's injured in your apartment\n• Your landlord's insurance covers the building — NOT your stuff\n• One laptop stolen = $1,000–1,500 loss without it. With it, you get reimbursed minus the deductible.\n• Get a quote at Lemonade.com — takes 5 minutes and can be under $8/month for students\n\n**Auto Insurance** (required by law):\n• Liability coverage (damages you cause to others): Go above state minimums — aim for $100k/$300k\n• Collision (your car in an accident): Skip if your car is worth under $3,000 — not worth the premium\n• Shop quotes every 6–12 months: prices vary 2–3x between insurers for identical coverage\n\n**Life Insurance**: Don't need it yet if you have no dependents. When you have kids or a mortgage, get term life (not whole life) at 10–20x your annual income. Avoid whole life policies — expensive and rarely the right product for young people.`,

    net_worth: () => `**Calculating and Improving Your Net Worth**\n\n**Net Worth = Assets − Liabilities**\n\n**Assets** (what you own with monetary value):\n• Checking and savings account balances\n• Investment accounts (401k, Roth IRA, brokerage)\n• Car value (use Kelley Blue Book)\n• Any property, valuable equipment, or collectibles\n\n**Liabilities** (what you owe):\n• Student loans\n• Credit card balances\n• Car loan\n• Any other debt\n\n**For most college students, net worth is negative — that's okay.** You've invested in your education. The goal is to track the trend: are you moving toward zero and beyond?\n\n**How to Track It**\nCreate a simple spreadsheet and update it quarterly. Two columns: Assets | Liabilities. Track the trend, not the number. A net worth improving by $300–500/month is excellent progress for a student or new grad.\n\n**How to Improve It Faster**\n1. Increase income (raises, side hustles, career growth)\n2. Reduce expenses (budget intentionally)\n3. Pay down high-interest debt aggressively\n4. Invest consistently — even $100/month compounds significantly over time\n5. Avoid lifestyle inflation as income grows\n\n**The One-Page Financial Snapshot**: Once a quarter, write down your net worth, monthly cash flow, savings rate, and top financial goal. This 10-minute review is more valuable than any financial app.`,

    housing: () => `**Renting vs. Buying — Making the Right Call**\n\n**As a student or recent grad, renting is almost always the right choice.** Here's why:\n• You have limited down payment savings\n• Your job/location may change\n• Buying has huge transaction costs (6–10% of home value to buy and sell)\n• The "rent vs. buy" break-even is typically 3–5 years — you need to stay that long for buying to win\n\n**Renting Smart**\n• Target rent under 30% of gross income (ideally under 25%)\n• Get renters insurance ($10–20/month) — covers your belongings; landlord's insurance doesn't\n• Read the lease carefully: early termination fees, pet policies, subletting rules\n• Document any existing damage before moving in (photos with timestamps)\n\n**When Buying Makes Sense**\n• You plan to stay 5+ years\n• You have 10–20% down payment saved\n• Your emergency fund is fully funded\n• You have stable income and a good credit score (740+)\n• Monthly housing costs won't exceed 28% of gross income (PITI: principal + interest + taxes + insurance)\n\n**Mortgage Math to Know**\n• PMI (private mortgage insurance): Required if down payment < 20%. Adds ~0.5–1% of loan value per year. Avoid if possible or plan to reach 20% equity to cancel it.\n• 15-year vs 30-year: 15-year saves enormous interest but has higher monthly payment. 30-year is more common for flexibility.\n\n**Bottom Line**: In your 20s, focus on building savings, paying off debt, and investing. The home will be there when you're ready.`,

    income: () => `**Growing Your Income — The Highest-Return Financial Move**\n\nExpense cuts have a floor; income has no ceiling. A $5,000 raise or promotion impacts your finances far more than cutting your coffee budget.\n\n**Negotiating Salary** — The Most Overlooked Skill\n• Research market rates: Glassdoor, Levels.fyi, LinkedIn Salary, Bureau of Labor Statistics\n• Always negotiate your first offer — employers expect it and rarely rescind offers\n• Counter at the top of the market range, not the middle\n• Frame it as: "Based on my research and the value I'll bring, I was expecting X. Is there flexibility?"\n• Negotiate benefits too: PTO, remote work, signing bonus, professional development\n\n**Building Income in College**\n• Part-time job on campus (often flexible + student-friendly)\n• Paid internships in your field (résumé + income + networking)\n• Freelance skills: graphic design, web development, tutoring, writing, video editing\n• Research assistant positions through your department\n• Resident Advisor (RA): often covers room and board\n\n**Side Hustles That Work for Students**\n• Tutoring: $20–60/hour, especially in STEM subjects\n• Freelance writing/design: Upwork, Fiverr to start\n• Delivery (DoorDash, Instacart): flexible hours\n• Selling notes/study guides (check campus policies)\n\n**1099 vs W-2**: If you freelance, set aside 25–30% for taxes and track all business expenses — they're deductible.`,

    getting_started: (ctx) => {
      const isStudent = ctx.isStudent;
      return `**Your Financial Starting Point${isStudent ? ' as a Student' : ''}**\n\nFinancial success is built step by step. Here's the exact order of operations:\n\n**Step 1: Know Your Numbers**\n• Calculate your monthly net income (take-home pay)\n• List every expense for last month\n• Calculate Net Worth: assets minus liabilities\n• Know your credit score (free at Credit Karma)\n\n**Step 2: Build a Simple Budget**\nStart with the 50/30/20 rule:\n• 50% needs (rent, food, transport, minimum debt payments)\n• 30% wants (dining out, entertainment, subscriptions)\n• 20% savings and extra debt payments\n\n**Step 3: $1,000 Emergency Fund**\nBefore anything else, save $1,000 in a high-yield savings account. This prevents every unexpected expense from becoming credit card debt.\n\n**Step 4: Attack High-Interest Debt**\nAny debt above 7–8% interest should be paid off aggressively. Credit cards at 20–25%? Those go first.\n\n**Step 5: Start Investing**\n• Get your full 401k employer match if you have one (free money)\n• Open a Roth IRA at Fidelity or Schwab — even $25/month matters\n• Invest in a total stock market index fund\n\n**Step 6: Keep Learning**\nUse the modules in this app to go deeper on each topic. The 8 modules here cover everything you need for a solid financial foundation.\n\nWhat step are you currently at? I can help you go deeper on any of them.`;
    },

    general: (ctx, text) => {
      const keywords = text.toLowerCase();
      if (keywords.includes('how much') && keywords.includes('save')) {
        return `**How Much Should You Save?**\n\nA common target: save 20% of your take-home income. But for many students, even 10% is a great starting point.\n\nHere's a practical framework:\n• First $1,000: Emergency fund (highest priority)\n• Then: Capture any employer 401k match\n• Then: Roth IRA contributions ($7,000/year max)\n• Then: Additional emergency fund to 3–6 months of expenses\n\nEven $25/week ($100/month) invested from age 22 grows to over $300,000 by retirement at 7% average returns. The habit is more important than the amount right now.\n\nWant me to walk through a budget framework or talk through how to find room to save in your current spending?`;
      }
      if (keywords.includes('crypto') || keywords.includes('bitcoin') || keywords.includes('nft')) {
        return `**Cryptocurrency — What Students Should Know**\n\nCrypto can be a legitimate speculative investment for a small portion of a portfolio, but understand the risks first:\n\n**The Honest Reality**\n• Crypto is highly volatile — assets can drop 50–80% and take years to recover\n• It's speculative, not a replacement for index fund investing\n• Many projects fail entirely; diversification within crypto doesn't help much if the whole market drops\n\n**If You Want Exposure**\n• Build your foundation first: emergency fund, debt under control, Roth IRA contributing\n• Allocate no more than 5–10% of your investment portfolio to speculative assets\n• Stick to established assets (Bitcoin, Ethereum) over altcoins or memecoins\n• Only invest what you could lose entirely without affecting your financial plan\n• Use a reputable regulated exchange; never leave large amounts on exchanges long-term\n\n**The Math Comparison**: $200/month in a total stock market index fund for 40 years at 7% = ~$525,000. The reliable, boring path often beats the exciting one.\n\nIs there a specific aspect of crypto or investing you'd like to explore?`;
      }
      return `That's a great financial question. Let me point you in the right direction.\n\nHere are the core areas of personal finance I can help with — which one is most relevant to what you're dealing with?\n\n💰 **Budgeting** — Setting up a spending plan that works\n💳 **Credit** — Building and protecting your credit score\n🏦 **Banking** — Finding the best accounts and rates\n📈 **Investing** — Starting to grow wealth with index funds\n🎓 **Student Loans** — Repayment strategies and forgiveness programs\n⚖️ **Debt** — Paying off debt efficiently (avalanche vs snowball)\n🛡️ **Insurance** — What coverage you actually need\n🧾 **Taxes** — Filing, deductions, and minimizing your bill\n🏖️ **Retirement** — 401k, Roth IRA, and compound interest\n🏠 **Housing** — Renting smart and when to consider buying\n\nTell me more about your specific situation and I'll give you targeted advice!`;
    },
  };
}
