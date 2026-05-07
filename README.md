# FinLit AI — College Financial Literacy Program

A comprehensive financial literacy program for college students. Learn personal finance through interactive modules, quizzes, and intelligent AI tools — all built with custom agents, no external AI subscription required.

## Features

### Learning Modules
- **Financial Foundations** — Income, net worth, financial statements
- **Budgeting Mastery** — 50/30/20 rule, zero-based budgeting
- **Banking & Credit** — Credit scores, credit cards, banking basics
- **Debt Management** — Avalanche vs snowball, student loans
- **Investing 101** — Stocks, bonds, ETFs, compound interest
- **Retirement Planning** — 401k, IRA, Roth IRA
- **Tax Literacy** — Filing, deductions, credits
- **Insurance & Protection** — Health, auto, renters, life insurance

### Custom AI Agents (no subscription needed)
| Agent | What it does |
|---|---|
| **FinAdvisorAgent** | Rule-based NLP chatbot — detects 17+ financial intent categories, extracts numbers and context, generates personalized advice |
| **BudgetAnalyzerAgent** | Scores budgets 0–100, categorizes into 50/30/20 buckets, generates ranked improvement recommendations |
| **InvestmentSimulatorAgent** | Compound interest projections, risk-based portfolio allocation, personalized action plans |
| **DebtOptimizerAgent** | Month-by-month amortization simulation of Avalanche and Snowball strategies with exact interest math |
| **LoanAnalyzerAgent** | Calculates Standard, Graduated, SAVE, IBR, and PSLF repayment plans using 2024-2025 federal guidelines |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| AI Agents | Custom rule-based agents (no external API) |
| Routing | React Router v6 |

## Running Locally

```bash
# 1. Install all dependencies
npm run install:all

# 2. Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Publishing / Deployment

### Option 1: Railway (Backend) + Vercel (Frontend) — Recommended

**Deploy Backend to Railway (free tier available)**
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repository
3. Railway auto-detects the `railway.json` config
4. Set root directory to `/` — it will run `node backend/server.js`
5. Copy your Railway URL (e.g. `https://finlit-ai.up.railway.app`)

**Deploy Frontend to Vercel (free)**
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select this repository
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Click Deploy — Vercel uses `vercel.json` automatically

### Option 2: Render (Full-stack, one platform)

**Backend service:**
1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`

**Frontend static site:**
1. New Static Site → connect same repo
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add env var: `VITE_API_URL` = your backend Render URL

### Option 3: Netlify (Frontend only) + Railway (Backend)
Same as Option 1, replace Vercel with Netlify. Use `netlify.toml` if needed.

## Project Structure

```
├── backend/
│   ├── agents/
│   │   ├── FinAdvisorAgent.js         # NLP financial chatbot agent
│   │   ├── BudgetAnalyzerAgent.js     # Budget scoring and analysis agent
│   │   ├── InvestmentSimulatorAgent.js # Portfolio projection agent
│   │   ├── DebtOptimizerAgent.js      # Debt payoff strategy agent
│   │   └── LoanAnalyzerAgent.js       # Student loan calculator agent
│   ├── routes/ai.js                   # API routes wiring agents
│   └── server.js                      # Express server
├── frontend/
│   └── src/
│       ├── components/                # Layout, Sidebar, ProgressBar
│       ├── pages/                     # All page components
│       ├── data/modules.ts            # Full course curriculum content
│       ├── hooks/useProgress.ts       # Progress tracking
│       └── types/index.ts             # TypeScript types
├── vercel.json                        # Vercel frontend deploy config
├── railway.json                       # Railway backend deploy config
└── package.json                       # Root scripts
```
