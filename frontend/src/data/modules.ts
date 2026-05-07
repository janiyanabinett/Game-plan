import { Module } from '../types';

export const modules: Module[] = [
  {
    id: 'financial-foundations',
    title: 'Financial Foundations',
    description: 'Understand your income, net worth, and how to read your own financial picture.',
    icon: '🏛️',
    color: 'blue',
    estimatedMinutes: 25,
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'ff-1',
        title: 'Understanding Your Income',
        content: `Your income is the foundation of your financial life. As a college student or new graduate, you likely have multiple income streams: a part-time job, internship stipend, scholarships, or parental support.

**Gross vs. Net Income**
Gross income is what you earn before any deductions. Net income — your "take-home pay" — is what actually hits your bank account after taxes, Social Security (6.2%), and Medicare (1.45%) are withheld.

For example, if you earn $3,000/month gross, your net might be around $2,400–$2,600 depending on your tax bracket and benefits elections. Always budget using your net income.

**Income Types**
- **W-2 income**: Wages from an employer who withholds taxes for you
- **1099 income**: Freelance or gig work — you owe taxes yourself (set aside ~25–30%)
- **Passive income**: Dividends, interest, rental income — generally taxed differently

**Your First Step**: Find your most recent pay stub. Identify your gross pay, federal/state taxes withheld, and net pay. This is your real working number.`,
        keyPoints: [
          'Always budget from net (take-home) income, not gross',
          'W-2 workers have taxes withheld; 1099 workers must save for taxes themselves',
          'Knowing your income sources helps you plan accurately',
        ],
      },
      {
        id: 'ff-2',
        title: 'Calculating Your Net Worth',
        content: `Net worth is the single most important number for measuring your financial health. It's simple:

**Net Worth = Assets − Liabilities**

**Assets** (what you own):
- Checking and savings account balances
- Investment accounts (401k, IRA, brokerage)
- Car value (use Kelley Blue Book)
- Any property or valuables

**Liabilities** (what you owe):
- Student loans
- Credit card balances
- Car loans
- Any other debt

**For most college students, net worth is negative** — and that's okay. You've invested in your education. The goal is to track the trend: are you moving toward zero and beyond?

A negative net worth of −$30,000 at graduation that becomes −$20,000 a year later is progress. Track it quarterly in a spreadsheet.

**Pro tip**: Student loans are a "good debt" investment if they're used for a degree with strong earning potential. High-interest credit card debt is almost always destructive.`,
        keyPoints: [
          'Net Worth = Assets − Liabilities',
          'A negative net worth as a student is normal — focus on the trend',
          'Track net worth quarterly to measure real progress',
        ],
      },
      {
        id: 'ff-3',
        title: 'The Personal Financial Statement',
        content: `Think of your finances like a business: companies use income statements and balance sheets. You should too.

**Your Personal Income Statement** (monthly):
- Total income (all sources)
- Fixed expenses (rent, car payment, subscriptions — same each month)
- Variable expenses (food, gas, entertainment — varies)
- Net cash flow = Income − All Expenses

A positive net cash flow means you're saving. A negative means you're going into debt.

**Your Personal Balance Sheet** (snapshot in time):
- Assets: everything you own with monetary value
- Liabilities: everything you owe
- Difference = Net Worth

**Cash Flow vs. Net Worth**:
You can have positive cash flow but low net worth (new grad saving well). You can also have high net worth but negative cash flow (retiree drawing down savings). Both matter.

**Action**: Create a simple two-column spreadsheet. List all income on one side, all expenses on the other. This takes 15 minutes and is your financial foundation.`,
        keyPoints: [
          'Track monthly cash flow: income minus all expenses',
          'Positive cash flow is the key to building wealth',
          'Your personal balance sheet = net worth snapshot',
        ],
      },
    ],
    quiz: [
      {
        id: 'ff-q1',
        question: 'You earn $4,000/month gross and take home $3,200. Which amount should you use for budgeting?',
        options: ['$4,000 — gross income', '$3,200 — net income', 'An average of both', 'Neither — use your annual salary'],
        correctIndex: 1,
        explanation: 'Always budget from net (take-home) income. Gross income includes taxes and deductions that you never actually receive.',
      },
      {
        id: 'ff-q2',
        question: 'You have $5,000 in savings, a $15,000 student loan, and a car worth $8,000. What is your net worth?',
        options: ['$28,000', '$-2,000', '$-10,000', '$13,000'],
        correctIndex: 1,
        explanation: 'Net Worth = Assets − Liabilities = ($5,000 + $8,000) − $15,000 = $13,000 − $15,000 = −$2,000.',
      },
      {
        id: 'ff-q3',
        question: 'What is "cash flow"?',
        options: [
          'Your total savings balance',
          'Your net worth divided by 12',
          'Income minus all expenses in a given period',
          'The amount in your checking account',
        ],
        correctIndex: 2,
        explanation: 'Cash flow is income minus expenses over a period (usually monthly). Positive cash flow means you\'re adding to your net worth.',
      },
    ],
  },
  {
    id: 'budgeting',
    title: 'Budgeting Mastery',
    description: 'Build a budget that actually works using proven frameworks for college life.',
    icon: '📊',
    color: 'green',
    estimatedMinutes: 30,
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'bud-1',
        title: 'The 50/30/20 Rule',
        content: `The 50/30/20 rule is the most practical budgeting framework for beginners. Split your after-tax income into three buckets:

**50% → Needs**
Essential expenses you can't avoid:
- Rent/housing
- Groceries
- Utilities
- Minimum loan/debt payments
- Transportation to work

**30% → Wants**
Non-essential spending that improves your life:
- Dining out
- Entertainment, streaming services
- Clothing (beyond basics)
- Hobbies, travel

**20% → Savings & Debt Payoff**
Future-you will thank present-you:
- Emergency fund contributions
- Retirement accounts (401k, Roth IRA)
- Extra debt payments
- Investing

**Adapting for College**: If rent is expensive in your city, you may run 60/20/20. That's okay — adapt the framework to your reality. The point is intentionality.

**Example on $2,400/month net**:
- Needs: $1,200 (rent $800 + groceries $200 + phone $50 + transport $150)
- Wants: $720 (dining $200 + entertainment $150 + clothing $150 + misc $220)
- Savings: $480 (emergency fund $200 + Roth IRA $200 + extra loan payment $80)`,
        keyPoints: [
          '50% needs, 30% wants, 20% savings/debt — use after-tax income',
          'Adapt percentages to your city\'s cost of living',
          'Automate the savings 20% first so it\'s never an afterthought',
        ],
      },
      {
        id: 'bud-2',
        title: 'Zero-Based Budgeting',
        content: `Zero-based budgeting means every dollar of your income has a specific job assigned to it. Income minus all assigned uses = $0.

This doesn't mean you spend everything — it means you decide on paper/app where every dollar goes, including savings and investments.

**How It Works**:
1. Start with your monthly net income: e.g., $2,400
2. List every expense and savings goal with dollar amounts
3. Subtract until you reach exactly $0
4. If you're over $0, increase savings; if under, cut a want

**Sample Zero-Based Budget ($2,400)**:
| Category | Amount |
|---|---|
| Rent | $800 |
| Groceries | $250 |
| Transport | $120 |
| Phone | $50 |
| Dining out | $150 |
| Entertainment | $100 |
| Clothing | $75 |
| Emergency fund | $200 |
| Roth IRA | $200 |
| Student loan extra | $80 |
| Miscellaneous | $175 |
| **Total** | **$2,400** |

**Best For**: People who want total control and tend to have "mystery spending" drain their accounts.`,
        keyPoints: [
          'Every dollar gets a job — income minus assignments = $0',
          'Catches "mystery spending" before it drains your account',
          'Review and rebuild the budget each month as income/expenses change',
        ],
      },
      {
        id: 'bud-3',
        title: 'Tracking and Staying on Budget',
        content: `A budget is only useful if you track against it. Here's how to build a sustainable tracking habit.

**Tracking Methods**:

**Apps**: Mint (free), YNAB ($15/month but powerful), Copilot (iOS). They sync to bank accounts and auto-categorize.

**Spreadsheet**: Google Sheets + a simple template. More work but total control. Great for privacy-conscious users.

**Envelope method**: Cash in physical envelopes per category. Old-school but works — when the envelope is empty, spending stops.

**The Weekly Review (10 minutes)**:
Every Sunday, check your actual spending vs. budget. Are you on track? If you overspent dining, where can you cut the rest of the month?

**Dealing with Irregular Expenses**:
Annual costs (car registration, holiday gifts, subscriptions) wreck monthly budgets. Solution: divide by 12 and save monthly into a sinking fund. $240 car registration = $20/month saved.

**The 24-Hour Rule for Wants**: Before any unplanned purchase over $30, wait 24 hours. About 70% of the time, you won't want it anymore. This single habit saves hundreds per month.`,
        keyPoints: [
          'Pick one tracking method and stick with it for 60 days',
          'Weekly 10-minute check-ins prevent month-end surprises',
          'Sinking funds handle irregular expenses without budget-busting',
        ],
      },
    ],
    quiz: [
      {
        id: 'bud-q1',
        question: 'In the 50/30/20 rule, which category does a minimum student loan payment fall into?',
        options: ['Wants (30%)', 'Needs (50%)', 'Savings (20%)', 'It doesn\'t fit any category'],
        correctIndex: 1,
        explanation: 'Minimum debt payments are considered a "need" — they are non-negotiable obligations. Extra payments above the minimum would go in the savings/debt payoff 20%.',
      },
      {
        id: 'bud-q2',
        question: 'What is a "sinking fund"?',
        options: [
          'Money set aside for emergencies',
          'A retirement account',
          'Monthly savings toward a known future expense',
          'An overdraft protection fund',
        ],
        correctIndex: 2,
        explanation: 'A sinking fund is money you save monthly for a predictable future expense (car repair, holiday gifts, annual subscriptions). It prevents large irregular expenses from blowing up your budget.',
      },
      {
        id: 'bud-q3',
        question: 'In zero-based budgeting, what should income minus all budget assignments equal?',
        options: ['As much as possible', '$100 buffer', '$0', 'Your monthly savings goal'],
        correctIndex: 2,
        explanation: 'Zero-based budgeting requires every dollar to have a purpose. Income − all assigned uses = $0. This includes savings, which is treated as a budget line item.',
      },
    ],
  },
  {
    id: 'credit',
    title: 'Banking & Credit',
    description: 'Master credit scores, credit cards, and banking to build a strong financial foundation.',
    icon: '💳',
    color: 'purple',
    estimatedMinutes: 35,
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'cred-1',
        title: 'How Credit Scores Work',
        content: `Your credit score (FICO score) is a 3-digit number from 300–850 that lenders use to evaluate your creditworthiness. It affects loan approvals, interest rates, apartment applications, and even some job offers.

**The 5 FICO Factors**:
1. **Payment History (35%)** — Most important. Pay on time, every time.
2. **Credit Utilization (30%)** — How much of your available credit you're using. Keep it below 30%, ideally under 10%.
3. **Length of Credit History (15%)** — Older accounts help. Don't close old cards.
4. **Credit Mix (10%)** — Having both revolving (credit cards) and installment (loans) credit helps.
5. **New Credit (10%)** — Too many hard inquiries in a short period hurts your score.

**Score Ranges**:
- 800–850: Exceptional — best rates
- 740–799: Very Good
- 670–739: Good — most loans approved
- 580–669: Fair — higher rates
- Below 580: Poor — limited options

**Building Credit as a Student**:
1. Get a secured credit card or student credit card
2. Use it for small purchases (Netflix, gas)
3. Pay the full balance monthly — never carry a balance
4. Set up autopay to never miss a payment

Check your free credit report at AnnualCreditReport.com (all 3 bureaus free weekly).`,
        keyPoints: [
          'Payment history (35%) is the biggest factor — never miss a payment',
          'Keep credit utilization under 30% (ideally under 10%)',
          'Start building credit early — length of history matters',
        ],
      },
      {
        id: 'cred-2',
        title: 'Using Credit Cards Wisely',
        content: `Credit cards are powerful tools when used correctly — or debt traps when misused. The difference comes down to one rule: **pay the full balance every month**.

**The Interest Math**:
A $1,000 balance at 24% APR costs ~$240/year in interest if you only make minimum payments — and takes years to pay off.

**Choosing Your First Card**:
- **Student cards**: Discover it Student, Chase Freedom Student — no annual fee, rewards, credit-building features
- **Secured cards**: You deposit $200–500 as collateral. Great if you have no credit history.

**Smart Credit Card Habits**:
1. Use for planned purchases you'd make anyway (groceries, gas, subscriptions)
2. Pay the FULL statement balance before the due date every month
3. Set up auto-pay for the full balance, not just the minimum
4. Keep utilization under 30% — if your limit is $1,000, don't charge more than $300
5. Never use a credit card for cash advances (fees + immediate interest)

**Rewards Strategy for Students**:
A 1.5% flat cash-back card on $500/month in spending = $90/year back. Not life-changing, but free money for zero extra effort.

**Warning signs you're misusing credit**:
- You only pay the minimum payment
- You use credit for things you can't afford
- Your balance grows month over month`,
        keyPoints: [
          'Always pay the full statement balance — interest destroys your budget',
          'Keep utilization under 30% of your credit limit',
          'Start with a student or secured card, use it for regular purchases',
        ],
      },
      {
        id: 'cred-3',
        title: 'Checking, Savings & High-Yield Accounts',
        content: `Choosing the right bank accounts can mean hundreds of dollars in free interest annually. Most big bank savings accounts pay 0.01% APY — a high-yield savings account (HYSA) pays 4–5% APY.

**Checking Account Essentials**:
- Zero monthly fees (or easily waivable)
- No minimum balance requirements
- ATM fee reimbursements
- Mobile check deposit
- Online banks (Ally, Marcus, SoFi) often beat traditional banks

**High-Yield Savings Account (HYSA)**:
At 4.5% APY, $5,000 earns ~$225/year. A traditional savings account at 0.01% earns $0.50. That's a $224.50 difference on the same money.

Top HYSAs (2024): Ally, Marcus by Goldman Sachs, SoFi, UFB Direct.

**Account Structure for Students**:
1. **Checking**: Bills, daily spending. Keep 1–2 months of expenses here.
2. **HYSA #1 (Emergency Fund)**: 3–6 months of expenses. Do not touch unless true emergency.
3. **HYSA #2 (Sinking Funds)**: Short-term goals (car, travel, semester costs)
4. **Investment Account**: Roth IRA, brokerage for long-term money

**FDIC Insurance**: All deposits up to $250,000 per bank are federally insured. Online HYSAs are just as safe as brick-and-mortar banks.`,
        keyPoints: [
          'High-yield savings accounts pay 400–500x more than traditional savings',
          'Keep 1–2 months expenses in checking; park the rest in HYSA',
          'Online banks offer the best rates with full FDIC protection',
        ],
      },
    ],
    quiz: [
      {
        id: 'cred-q1',
        question: 'Which factor has the largest impact on your FICO credit score?',
        options: ['Credit utilization', 'Length of credit history', 'Payment history', 'Number of credit cards'],
        correctIndex: 2,
        explanation: 'Payment history accounts for 35% of your FICO score — the single largest factor. A single late payment can drop your score by 50–100 points and stays on your report for 7 years.',
      },
      {
        id: 'cred-q2',
        question: 'Your credit card limit is $2,000. For the best credit score impact, your balance should stay below:',
        options: ['$1,000 (50%)', '$600 (30%)', '$200 (10%)', '$800 (40%)'],
        correctIndex: 1,
        explanation: 'Credit utilization should stay below 30% for a good score impact ($600 on a $2,000 limit). Under 10% is ideal. High utilization signals financial stress to lenders.',
      },
      {
        id: 'cred-q3',
        question: 'A high-yield savings account paying 4.5% APY vs. a traditional savings account at 0.01% APY — on $3,000, the annual difference is approximately:',
        options: ['$3', '$135', '$450', '$13.50'],
        correctIndex: 1,
        explanation: '$3,000 × 4.5% = $135/year vs. $3,000 × 0.01% = $0.30/year. The HYSA earns roughly $135 more — free money for simply switching banks.',
      },
    ],
  },
  {
    id: 'debt',
    title: 'Debt Management',
    description: 'Tackle debt strategically using proven payoff methods and avoid the debt traps.',
    icon: '⚖️',
    color: 'red',
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'debt-1',
        title: 'Good Debt vs. Bad Debt',
        content: `Not all debt is created equal. Understanding the difference between "productive" and "destructive" debt changes how you prioritize payoff.

**Good Debt** (invests in future earning power or appreciating assets):
- Federal student loans at 5–7%: Invest in a degree with strong ROI
- Mortgage at 6–7%: Real estate historically appreciates
- Business loans: Fund income-generating activities

**Bad Debt** (funds consumption of depreciating or consumed items):
- Credit cards at 20–30% APR: Destroys wealth faster than almost any investment can create it
- Buy-now-pay-later (BNPL): Often carries high rates or traps with deferred interest
- Payday loans at 300–400% APR: Financial emergency only — these are predatory
- Auto loans on luxury cars you can't afford

**The Interest Rate Threshold**:
If your debt interest rate is above ~7–8%, aggressively pay it off — you'll "earn" that rate guaranteed.
If below ~5%, consider paying minimums and investing the difference (S&P 500 historical ~10% average).

**Priority Order for College Grads**:
1. Pay minimums on all debts
2. Build $1,000 starter emergency fund
3. Get full employer 401k match (free money first)
4. Aggressively pay high-interest debt (>7%)
5. Build full 3–6 month emergency fund
6. Invest and tackle lower-interest debt simultaneously`,
        keyPoints: [
          'Good debt invests in appreciating assets or earning power; bad debt funds consumption',
          'Any debt above 7–8% interest should be aggressively paid off',
          'Always capture employer 401k match before extra debt payments',
        ],
      },
      {
        id: 'debt-2',
        title: 'Avalanche vs. Snowball Method',
        content: `Two battle-tested strategies exist for paying off multiple debts. Both work — the best one is the one you'll actually stick to.

**Avalanche Method (Mathematical Optimum)**:
Pay minimums on all debts, then throw all extra money at the highest-interest debt first.

Example: Credit card at 24%, car loan at 8%, student loan at 5%
→ Attack credit card first, then car loan, then student loan.

✅ Saves the most money in interest
✅ Fastest debt-free timeline mathematically
❌ Can feel slow if highest-interest debt has a large balance

**Snowball Method (Psychological Win)**:
Pay minimums on all debts, then attack the smallest balance first regardless of interest rate.

Example: $400 medical bill, $2,000 credit card, $12,000 car loan
→ Wipe out $400 medical bill first, then $2,000 credit card, then car loan.

✅ Quick wins build motivation
✅ Reduces number of payments you manage
❌ Costs more in total interest

**Research Finding**: Studies show the Snowball method leads to higher debt-payoff completion rates because of the psychological momentum from early wins. The "best" method is the one you complete.

**Hybrid Approach**: Use Avalanche logic, but if a high-interest debt has a huge balance, eliminate a small debt first to free up cash flow and motivation.`,
        keyPoints: [
          'Avalanche saves the most money; Snowball provides motivational quick wins',
          'Both require paying minimums on all debts, then extra toward the target debt',
          'The best method is the one you\'ll actually complete',
        ],
      },
      {
        id: 'debt-3',
        title: 'Student Loan Basics',
        content: `Student loans are the defining financial challenge of this generation. Understanding your options prevents costly mistakes.

**Federal vs. Private Loans**:
Federal loans come with protections: income-driven repayment, forgiveness programs, deferment, and forbearance. Private loans have none of these — treat them as high-priority debt.

**Federal Loan Types**:
- **Direct Subsidized**: Govt pays interest while you're in school. Best deal.
- **Direct Unsubsidized**: Interest accrues during school. More common.
- **PLUS Loans**: Higher rates, for grad students or parents. Avoid if possible.
- **Perkins Loans**: Low rate, need-based. Check if you have these.

**Repayment Plans Overview**:
- **Standard (10 years)**: Fixed payment, lowest total interest
- **Graduated**: Lower early payments that increase every 2 years
- **Income-Driven (IDR)**: Payments based on your income. Remaining balance forgiven after 20–25 years (taxable).
- **SAVE Plan**: Newest IDR plan — most generous for low-to-moderate earners
- **PSLF**: Work for govt/nonprofit 10 years + IDR payments = full forgiveness (tax-free)

**Key Action**: Log into StudentAid.gov to see all your federal loans, balances, and servicer contact info. Know what you owe before you graduate.`,
        keyPoints: [
          'Federal loans have income-driven repayment and forgiveness options; private loans do not',
          'PSLF forgives remaining balance after 10 years in public service — tax free',
          'Always check StudentAid.gov to understand your full federal loan picture',
        ],
      },
    ],
    quiz: [
      {
        id: 'debt-q1',
        question: 'Using the Avalanche method, which debt do you target first?',
        options: [
          'Smallest balance',
          'Largest balance',
          'Highest interest rate',
          'The one with the highest monthly payment',
        ],
        correctIndex: 2,
        explanation: 'The Avalanche method targets the highest-interest debt first. This minimizes total interest paid over time, making it the mathematically optimal approach.',
      },
      {
        id: 'debt-q2',
        question: 'PSLF (Public Service Loan Forgiveness) requires:',
        options: [
          '20 years of income-driven payments',
          '10 years working for govt/nonprofit + qualifying payments',
          '5 years of full-time teaching',
          'Income below $50,000',
        ],
        correctIndex: 1,
        explanation: 'PSLF requires 10 years (120 payments) of qualifying employment with a government or nonprofit organization while making income-driven repayment plan payments. The forgiven amount is tax-free.',
      },
      {
        id: 'debt-q3',
        question: 'You have $500 extra per month. You have a credit card at 22% APR and a student loan at 5.5%. Where should the $500 go?',
        options: [
          'Split evenly between both',
          'All to student loan (larger balance)',
          'All to credit card (highest rate)',
          'Into savings first',
        ],
        correctIndex: 2,
        explanation: 'The 22% credit card interest far exceeds any investment return. Paying off high-interest debt is a guaranteed "return" equal to the interest rate. After eliminating the credit card, evaluate whether to pay down the 5.5% loan or invest.',
      },
    ],
  },
  {
    id: 'investing',
    title: 'Investing 101',
    description: 'Start building wealth through the power of compound interest and diversified investing.',
    icon: '📈',
    color: 'emerald',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'inv-1',
        title: 'The Power of Compound Interest',
        content: `Albert Einstein reportedly called compound interest "the eighth wonder of the world." Whether or not he said it, the math backs it up completely.

**Compound Interest**: Earning returns on your returns. Your money grows exponentially, not linearly.

**The Rule of 72**: Divide 72 by your interest rate to find how many years to double your money.
- At 7%: 72 ÷ 7 = ~10 years to double
- At 10%: 72 ÷ 10 = ~7.2 years to double

**The Real Power — Starting Early**:
Sarah starts investing $200/month at age 22, stops at 32 (10 years, $24,000 total invested).
Mike starts investing $200/month at age 32, invests until 62 (30 years, $72,000 total invested).

At 62, assuming 7% average annual return:
- Sarah: ~$337,000 (invested $24,000)
- Mike: ~$227,000 (invested $72,000)

Sarah invested 1/3 as much but ends up with 48% more money. **Time is the most powerful variable in investing.**

**The Cost of Waiting**:
Every year you delay investing costs you far more than the money you would have put in. Starting at 22 vs. 25 can be the difference of $100,000+ at retirement.

**Key Takeaway**: Start investing something — even $25/month — immediately. Perfect is the enemy of good.`,
        keyPoints: [
          'Compound interest grows your wealth exponentially over time',
          'Starting early matters more than the amount invested',
          'Rule of 72: divide 72 by your return to find your money-doubling timeline',
        ],
      },
      {
        id: 'inv-2',
        title: 'Stocks, Bonds, and ETFs',
        content: `Understanding the basic investment vehicles helps you build a portfolio that matches your goals and risk tolerance.

**Stocks (Equities)**:
Buying a stock = owning a tiny piece of a company. If the company does well, your share value increases. If it struggles, it decreases.
- Higher potential return (historically ~10% avg annual for S&P 500)
- Higher volatility — value swings significantly year to year
- Best for: Long-term goals (10+ years away)

**Bonds (Fixed Income)**:
Lending money to a government or corporation in exchange for regular interest payments. Lower risk, lower return (~2–5%).
- Best for: Short-to-medium term goals, capital preservation, reducing portfolio volatility

**ETFs (Exchange-Traded Funds)**:
A basket of stocks or bonds in a single purchase. Like buying a tiny slice of hundreds of companies at once.
- Low cost (expense ratios often 0.03–0.20%)
- Instant diversification
- Trades like a stock
- **Index ETFs**: Track a market index (S&P 500, total stock market). The best starting point for most investors.

**Recommended Starting Portfolio for Young Investors**:
- 90% broad stock market index ETF (VTI, FXAIX, or similar)
- 10% international index ETF (VXUS)

As you age, gradually add bonds for stability. A simple rule: age in bonds (25 year old = 25% bonds), though young investors can be more aggressive.

**Avoid**: Individual stock picking, active funds with high expense ratios (>0.5%), and timing the market.`,
        keyPoints: [
          'Stocks = ownership, higher risk/reward. Bonds = lending, lower risk/reward',
          'Index ETFs offer instant diversification at very low cost — ideal for beginners',
          'Broad market index funds outperform most actively managed funds long-term',
        ],
      },
      {
        id: 'inv-3',
        title: 'Investment Accounts: Where to Invest',
        content: `Before picking investments, choose the right account type. Account type determines your tax treatment, which can be worth tens of thousands of dollars over a lifetime.

**Tax-Advantaged Accounts (Use These First)**:

**401(k) / 403(b)** — Employer-sponsored:
- Contributions reduce taxable income today (traditional) or grow tax-free (Roth 401k)
- 2024 limit: $23,000/year
- **Always get the full employer match first** — it's a 50–100% instant return

**Roth IRA** — Individual Retirement Account:
- Contribute after-tax dollars; withdrawals in retirement are 100% tax-free
- 2024 limit: $7,000/year (income limits apply)
- Best for: Young investors in lower tax brackets now
- Open at: Fidelity, Vanguard, Schwab (all free)

**Traditional IRA**:
- Tax deduction now; pay taxes on withdrawal in retirement
- Better if you expect to be in a lower tax bracket in retirement

**Taxable Brokerage Account** (after maxing tax-advantaged):
- No contribution limits, no restrictions on withdrawals
- Pay capital gains tax on profits

**Order of Operations**:
1. 401k up to employer match
2. Max Roth IRA ($7,000)
3. Max 401k ($23,000)
4. Taxable brokerage for additional investing`,
        keyPoints: [
          'Get your full 401k employer match first — it\'s an instant 50–100% return',
          'Roth IRA is ideal for young investors — tax-free growth and withdrawals',
          'Use tax-advantaged accounts before taxable brokerage accounts',
        ],
      },
    ],
    quiz: [
      {
        id: 'inv-q1',
        question: 'At a 7% annual return, approximately how long does it take to double your money?',
        options: ['7 years', '10 years', '14 years', '20 years'],
        correctIndex: 1,
        explanation: 'Using the Rule of 72: 72 ÷ 7 = ~10.3 years. This is why starting early is so powerful — even modest returns compound dramatically over a decade.',
      },
      {
        id: 'inv-q2',
        question: 'Which investment account should you max out AFTER getting your full employer 401k match?',
        options: ['Taxable brokerage account', 'Savings account', 'Roth IRA', 'Additional 401k contributions'],
        correctIndex: 2,
        explanation: 'After capturing the employer match (free money), the Roth IRA is typically the next priority. For young, lower-income earners, the Roth\'s tax-free growth is extremely valuable.',
      },
      {
        id: 'inv-q3',
        question: 'An S&P 500 index ETF with 0.03% expense ratio vs. an actively managed fund with 1.2% expense ratio — on $10,000 over 30 years at 8% gross return, the cost difference is approximately:',
        options: ['$150', '$3,600', '$12,000', '$25,000'],
        correctIndex: 2,
        explanation: 'Expense ratios compound just like returns — against you. The ~1.17% annual cost difference on $10k over 30 years compounds to roughly $12,000+ in lost returns. Low-cost index funds are one of the most important investment decisions.',
      },
    ],
  },
  {
    id: 'retirement',
    title: 'Retirement Planning',
    description: 'Build long-term wealth with retirement accounts and understand Social Security.',
    icon: '🏖️',
    color: 'orange',
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'ret-1',
        title: '401k and Employer Benefits',
        content: `The 401(k) is the most powerful wealth-building tool available to most Americans — especially when your employer matches contributions.

**How a 401(k) Works**:
Your employer offers a retirement plan through a provider (Fidelity, Vanguard, etc.). You elect to contribute a percentage of each paycheck pre-tax. That money invests in funds you select, grows tax-deferred, and you pay taxes only when you withdraw in retirement.

**The Employer Match — Never Leave This on the Table**:
If your employer matches 50% of contributions up to 6% of salary:
- You earn $50,000/year
- 6% of salary = $3,000 you contribute
- Employer adds $1,500 (50% match)
- That's a guaranteed 50% return on $3,000 before any market gains

Contribute at least enough to get the full match. Always. Every year.

**2024 Contribution Limits**:
- Employee contribution: up to $23,000/year
- With employer match, total can reach $69,000/year

**Traditional vs. Roth 401(k)**:
- Traditional: Pre-tax contributions → lower tax bill now → pay taxes on withdrawal
- Roth 401k: After-tax contributions → no tax break now → tax-FREE withdrawals

For most college grads in their 20s in low tax brackets, Roth is usually better.

**Vesting Schedules**: Employer match funds often "vest" (become fully yours) over 2–4 years. Check your plan — leaving a job before vesting means losing unvested match money.`,
        keyPoints: [
          'Always contribute enough to capture the full employer 401k match',
          'Roth 401k is usually better for young workers in lower tax brackets',
          'Check your vesting schedule before leaving a job',
        ],
      },
      {
        id: 'ret-2',
        title: 'Roth IRA — The Young Person\'s Secret Weapon',
        content: `The Roth IRA is arguably the most powerful retirement account for young adults. You pay taxes now (when your rate is low) and your money grows completely tax-free forever.

**How Roth IRA Works**:
- Contribute after-tax money (no deduction this year)
- Money grows tax-free
- Qualified withdrawals in retirement: 100% tax-free
- No required minimum distributions in your lifetime

**2024 Rules**:
- Contribution limit: $7,000/year (under 50)
- Income limits: Phase out at $146,000 single / $230,000 married
- Penalty-free withdrawal of contributions (not earnings) any time after 5 years

**Why It's Perfect for Students and Young Grads**:
If you earn $35,000 and pay 12% federal tax now, then retire in the 22%+ bracket, every dollar in your Roth IRA saves you 10%+ in future taxes.

$500/month in a Roth IRA from age 22 to 65 at 7% avg return = **over $1.4 million — completely tax-free**.

**Where to Open a Roth IRA**:
All three are excellent and free: Fidelity, Vanguard, Charles Schwab.
- Start investing in a Total Stock Market index fund (FZROX at Fidelity, VTI at Schwab/Vanguard)

**The "Backdoor Roth"**: High earners above the income limit can still contribute via a backdoor Roth IRA (consult a tax professional for this).`,
        keyPoints: [
          'Roth IRA grows tax-free — pay taxes now at your low rate, never again',
          '$7,000/year limit in 2024; open at Fidelity, Vanguard, or Schwab for free',
          'Starting at 22 with $500/month can produce $1.4M+ tax-free by retirement',
        ],
      },
      {
        id: 'ret-3',
        title: 'Social Security and Retirement Math',
        content: `Social Security will likely play a role in your retirement, but don't count on it as your primary income. Plan to build enough investment wealth to be self-sufficient.

**Social Security Basics**:
- You pay 6.2% of wages into Social Security (your employer pays another 6.2%)
- Benefits are based on your 35 highest-earning years
- Full retirement age: 67 for those born after 1960
- Can claim as early as 62 (reduced benefit) or as late as 70 (32% increase)

**Current Outlook**: The Social Security trust fund is projected to face shortfalls around 2033. Benefits won't disappear, but may be reduced ~20–25%. Plan conservatively.

**The Retirement Number**:
A common rule of thumb: You need 25x your annual expenses saved to retire (4% withdrawal rate).

If you spend $50,000/year in retirement, you need ~$1.25 million invested.

**Retirement Calculator Snapshot** (no contributions after 65, 7% return):
- Start at 22, invest $400/month → $1.2M by 65
- Start at 32, invest $400/month → $566K by 65
- Start at 22, invest $600/month → $1.8M by 65

The math is simple and ruthless: start now, invest consistently, don't stop.`,
        keyPoints: [
          'Social Security supplements retirement — don\'t rely on it as your only source',
          'Retirement target: 25x annual expenses (4% safe withdrawal rate)',
          'Starting 10 years later can cut your retirement wealth by over 50%',
        ],
      },
    ],
    quiz: [
      {
        id: 'ret-q1',
        question: 'Your employer matches 50% of 401k contributions up to 6% of your $48,000 salary. What is the maximum free employer money you can receive per year?',
        options: ['$1,440', '$2,880', '$4,800', '$1,000'],
        correctIndex: 0,
        explanation: '6% of $48,000 = $2,880 you contribute. Employer matches 50% of that = $1,440 free money per year. Always contribute at least 6% to capture this.',
      },
      {
        id: 'ret-q2',
        question: 'For a 23-year-old earning $38,000/year, which is usually the better 401k option?',
        options: [
          'Traditional 401k (pre-tax)',
          'Roth 401k (after-tax)',
          'Neither — save in a regular account',
          'Both equally',
        ],
        correctIndex: 1,
        explanation: 'Young, lower-income earners typically pay a lower tax rate now than they will in retirement. Roth contributions are taxed at today\'s lower rate; withdrawals are tax-free at the future higher rate. This difference can be worth tens of thousands of dollars.',
      },
      {
        id: 'ret-q3',
        question: 'Using the 4% rule, how much do you need saved to safely withdraw $40,000/year in retirement?',
        options: ['$400,000', '$800,000', '$1,000,000', '$1,600,000'],
        correctIndex: 2,
        explanation: 'The 4% rule: multiply annual expenses by 25. $40,000 × 25 = $1,000,000. This allows you to withdraw 4% annually with a high probability of not outliving your money over 30 years.',
      },
    ],
  },
  {
    id: 'taxes',
    title: 'Tax Literacy',
    description: 'Understand how taxes work, how to file, and how to legally minimize your tax bill.',
    icon: '🧾',
    color: 'yellow',
    estimatedMinutes: 35,
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'tax-1',
        title: 'How Income Tax Works',
        content: `The US uses a progressive (marginal) tax system — you don't pay the top rate on all your income. Understanding this prevents costly misconceptions.

**2024 Federal Tax Brackets (Single filers)**:
- 10%: $0 – $11,600
- 12%: $11,601 – $47,150
- 22%: $47,151 – $100,525
- 24%: $100,526 – $191,950
- (Higher brackets above this)

**The Marginal Rate Myth**:
If you earn $55,000, you are NOT in the "22% bracket" meaning you pay 22% on everything. You pay:
- 10% on the first $11,600 = $1,160
- 12% on $11,601–$47,150 = $4,266
- 22% on $47,151–$55,000 = $1,727
- **Total: $7,153 = ~13% effective rate** (not 22%)

**Standard Deduction**: Before calculating taxes, subtract the standard deduction from income.
- 2024: $14,600 single, $29,200 married filing jointly
- Most students and young adults use the standard deduction

**Taxable Income**: Gross income − standard deduction = what you're actually taxed on.
$55,000 income − $14,600 standard deduction = $40,400 taxable income → effective rate drops further.`,
        keyPoints: [
          'Tax brackets are marginal — you only pay each rate on income within that bracket',
          'Your effective tax rate is much lower than your marginal bracket',
          'The standard deduction reduces your taxable income significantly',
        ],
      },
      {
        id: 'tax-2',
        title: 'Filing Your Taxes',
        content: `Tax filing deadlines and tools every college student needs to know.

**Key Dates**:
- January 31: Employers send W-2 forms; banks send 1099-INT forms
- April 15: Tax filing deadline (or get a 6-month extension to October 15)
- June 15: Deadline for international students in some cases

**What You'll Need**:
- W-2 (from employer) — shows wages and withholding
- 1099 forms — freelance income, bank interest, investment gains
- 1098-T — tuition statement from your university
- 1098-E — student loan interest paid
- SSN and bank routing numbers for direct deposit refund

**Free Filing Options**:
- **IRS Free File**: If you earn under $79,000, you can file completely free at IRS.gov
- **FreeTaxUSA**: Free federal filing, $15 state
- **VITA**: IRS's free tax prep for qualifying taxpayers (volunteer-staffed)
- **TurboTax / H&R Block Free Edition**: Basic W-2 filers only

**Education Tax Benefits**:
- **American Opportunity Credit**: Up to $2,500/year for first 4 years of college
- **Lifetime Learning Credit**: Up to $2,000/year for any higher education
- **Student loan interest deduction**: Up to $2,500 interest deduction (income limits apply)

**Self-Employment Taxes**: Freelance/gig income → you owe self-employment tax (15.3%). Set aside 25–30% of every payment.`,
        keyPoints: [
          'File by April 15 or request a 6-month extension',
          'IRS Free File is free for incomes under $79,000',
          'American Opportunity Credit can save you up to $2,500/year in college',
        ],
      },
      {
        id: 'tax-3',
        title: 'Tax Strategy: Legally Reducing Your Bill',
        content: `Legal tax reduction is one of the most powerful financial tools available. Here are the strategies that matter most for young adults.

**Pre-Tax Contributions (Lower Taxable Income Now)**:
- Traditional 401k: Every dollar contributed reduces your taxable income dollar-for-dollar
- HSA (Health Savings Account): Triple tax advantage — deductible now, grows tax-free, tax-free withdrawals for medical expenses. 2024 limit: $4,150 single.

**After-Tax Strategies (Lower Taxes Later)**:
- Roth IRA: Pay taxes now; withdrawals tax-free in retirement

**Tax-Loss Harvesting**:
If investments lost value, selling them "harvests" the loss to offset capital gains tax. More relevant once you have a taxable brokerage account.

**Withholding Strategy**:
Adjust your W-4 withholding with your employer to avoid a large refund OR a large bill.
- Large refund = you gave the government an interest-free loan all year
- Large bill = underpayment penalty risk
- Goal: refund or bill close to $0

**Gig Worker Quarterly Taxes**:
If you earn freelance/1099 income, pay estimated taxes quarterly (April, June, September, January) to avoid underpayment penalties.

**Keep Receipts For**:
- Home office (if self-employed)
- Business-related education expenses
- Professional development costs
- Charitable donations`,
        keyPoints: [
          'Pre-tax contributions to 401k and HSA directly reduce your taxable income',
          'Adjust W-4 withholding to avoid overpaying all year',
          'Gig workers must pay quarterly estimated taxes or face penalties',
        ],
      },
    ],
    quiz: [
      {
        id: 'tax-q1',
        question: 'You earn $52,000 in 2024 (single filer). After the $14,600 standard deduction, what is your taxable income?',
        options: ['$52,000', '$37,400', '$47,000', '$44,600'],
        correctIndex: 1,
        explanation: '$52,000 − $14,600 standard deduction = $37,400 taxable income. This is the amount you actually pay tax on, not your gross income.',
      },
      {
        id: 'tax-q2',
        question: 'The American Opportunity Tax Credit provides up to how much per year for qualifying college expenses?',
        options: ['$500', '$1,000', '$2,500', '$5,000'],
        correctIndex: 2,
        explanation: 'The American Opportunity Credit provides up to $2,500/year for the first 4 years of college. It\'s partially refundable, meaning you may get money back even if you owe no tax.',
      },
      {
        id: 'tax-q3',
        question: 'You freelance and earn $8,000. How much should you roughly set aside for taxes?',
        options: ['$800 (10%)', '$1,600 (20%)', '$2,000–$2,400 (25–30%)', '$3,200 (40%)'],
        correctIndex: 2,
        explanation: 'Freelancers owe income tax plus self-employment tax (15.3% covers Social Security and Medicare). Setting aside 25–30% ensures you can cover your tax bill without stress.',
      },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance & Protection',
    description: 'Protect your financial life with the right insurance at the right price.',
    icon: '🛡️',
    color: 'indigo',
    estimatedMinutes: 25,
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'ins-1',
        title: 'Health Insurance Essentials',
        content: `Health insurance is the most critical insurance for young adults — one hospital visit without it can cost $30,000–$100,000+.

**How Health Insurance Works**:
- **Premium**: Monthly payment for coverage (whether you use it or not)
- **Deductible**: What you pay out-of-pocket before insurance kicks in ($500–$5,000+)
- **Copay**: Fixed amount per visit ($20–$50)
- **Coinsurance**: Your % share after deductible (often 20%)
- **Out-of-Pocket Maximum**: Most you'll ever pay in a year ($5,000–$9,000 typically)

**Options for Young Adults**:

**Parent's Plan** (under 26): Free or low-cost if parents have employer coverage. Usually the best option if available.

**Employer Coverage**: Often the best deal — employers subsidize 50–80% of premiums.

**ACA Marketplace** (healthcare.gov): Individual plans; subsidies available if income is 100–400% of federal poverty level. Many young adults qualify for significant subsidies.

**Medicaid**: Free or very low-cost if income is below ~138% FPL. Check eligibility.

**Choosing a Plan**:
- If you're healthy and rarely use care: High-Deductible Health Plan (HDHP) + Health Savings Account (HSA) — lower premiums, tax benefits
- If you have chronic conditions or frequent care needs: Lower deductible PPO plan worth higher premium`,
        keyPoints: [
          'Stay on parents\' plan until 26 if possible — often the cheapest option',
          'Employer coverage is typically heavily subsidized — enroll immediately',
          'ACA subsidies can make marketplace plans very affordable for low incomes',
        ],
      },
      {
        id: 'ins-2',
        title: 'Auto, Renters, and Life Insurance',
        content: `Beyond health insurance, three other policies are essential for most college students and young adults.

**Auto Insurance** (required in most states):

Key coverages:
- **Liability**: Covers damage you cause to others. State minimums are usually too low — get at least $100k/$300k.
- **Collision**: Covers your car in an accident. Skip if car value < $3,000.
- **Comprehensive**: Theft, weather, animals. Usually worth it.
- **Uninsured Motorist**: Covers you if the other driver has no insurance. Essential.

Shop quotes every 6–12 months. Prices vary 2–3x between insurers for identical coverage.

**Renters Insurance** (criminally underused):
Costs $10–$20/month and covers:
- Theft of your laptop, phone, belongings
- Water/fire damage to your stuff (landlord's insurance covers the building, NOT your stuff)
- Liability if someone is injured in your apartment

If your $1,500 laptop gets stolen, renters insurance pays for a new one minus your deductible. Without it, you're on your own. This is the best insurance value for young people.

**Life Insurance**:
As a single student with no dependents, you likely don't need it yet. Life insurance is for people who have others depending on their income.

When you get a mortgage or have kids → term life insurance (not whole life) at 10–20x your annual income is the right play. Avoid expensive whole life policies pitched by financial advisors.`,
        keyPoints: [
          'Renters insurance ($10–20/month) is the highest-value insurance for students',
          'Auto liability minimums are too low — get at least $100k/$300k',
          'Life insurance is only essential if others depend on your income',
        ],
      },
      {
        id: 'ins-3',
        title: 'Emergency Fund — Your First Line of Defense',
        content: `Before you invest aggressively, you need an emergency fund. This is the financial safety net that prevents every unexpected expense from turning into debt.

**Why an Emergency Fund Matters**:
Without one, any unexpected expense — car repair, medical bill, laptop dying — forces you to use a credit card or take out a loan. You then pay 20%+ interest and the "emergency" costs 30–50% more than it should have.

With one, you handle life's surprises from cash, stay debt-free, and don't derail your financial plan.

**How Much to Keep**:
- **Starter Fund**: $1,000 (first goal — get this before aggressive debt payoff)
- **Full Fund**: 3–6 months of essential expenses
- Students: $2,000–$5,000 is usually adequate
- Freelancers/irregular income: aim for 6 months+

**Where to Keep It**:
- High-yield savings account (HYSA) — earns 4–5% APY while staying accessible
- NOT in a checking account (too tempting to spend)
- NOT invested in stocks (value fluctuates — you need it to be there when you need it)

**Rebuilding After Use**:
If you use your emergency fund, treat replenishing it as your #1 financial priority. Don't invest, don't spend extra, just rebuild.

**What Counts as an Emergency**:
✅ Job loss, medical bills, essential car repair, urgent home repair
❌ Vacation, holiday gifts, new phone (save separately in a sinking fund)`,
        keyPoints: [
          'Start with a $1,000 emergency fund before aggressive investing or debt payoff',
          'Keep 3–6 months of expenses in a HYSA — accessible but not too accessible',
          'An emergency fund prevents unexpected costs from becoming high-interest debt',
        ],
      },
    ],
    quiz: [
      {
        id: 'ins-q1',
        question: 'Which insurance is most cost-effective and important for a college student renting an apartment?',
        options: ['Life insurance', 'Disability insurance', 'Renters insurance', 'Long-term care insurance'],
        correctIndex: 2,
        explanation: 'Renters insurance costs $10–20/month and covers theft, fire, and water damage to your belongings, plus liability. At $150–240/year, it\'s the best insurance value for students.',
      },
      {
        id: 'ins-q2',
        question: 'How large should a starter emergency fund be?',
        options: ['One week of expenses', '$500', '$1,000', '$10,000'],
        correctIndex: 2,
        explanation: 'A $1,000 starter emergency fund is the first financial goal. It handles most minor emergencies (car repair, medical copay, appliance replacement) without derailing your finances while you work on paying off debt.',
      },
      {
        id: 'ins-q3',
        question: 'Your landlord\'s insurance covers which of the following?',
        options: [
          'Your laptop if it\'s stolen',
          'The building structure itself',
          'Your clothing if damaged in a fire',
          'Your furniture',
        ],
        correctIndex: 1,
        explanation: 'Your landlord\'s insurance covers the building structure only — not your personal belongings. Renters insurance covers your stuff. Without renters insurance, you have zero coverage for theft or damage to your possessions.',
      },
    ],
  },
];

export const getModuleById = (id: string): Module | undefined =>
  modules.find((m) => m.id === id);
