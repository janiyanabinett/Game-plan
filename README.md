# FinLit AI — College Financial Literacy Program

A comprehensive, AI-powered financial literacy program for college students. Learn personal finance through interactive modules, quizzes, and AI-integrated tools powered by Claude.

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

### AI-Powered Tools
- **AI Financial Advisor** — Conversational AI coach for personalized financial guidance
- **Smart Budget Analyzer** — Input your income/expenses and get AI-driven recommendations
- **Investment Portfolio Simulator** — Model portfolio growth with AI strategy suggestions
- **Debt Payoff Optimizer** — AI-optimized avalanche vs snowball debt strategy calculator
- **Student Loan Analyzer** — Federal loan repayment plan comparator with AI guidance

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Routing | React Router v6 |

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key

### Installation

```bash
# Install all dependencies
npm run install:all

# Copy environment variables
cp backend/.env.example backend/.env
# Add your ANTHROPIC_API_KEY to backend/.env
```

### Running the App

```bash
# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Running Separately

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Project Structure

```
├── frontend/                  # React + TypeScript + Vite
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Page-level components
│       ├── data/              # Module content & quiz data
│       └── types/             # TypeScript type definitions
├── backend/                   # Node.js + Express
│   └── routes/                # AI and module API routes
└── package.json               # Root scripts
```
