import { Router } from 'express';
import { FinAdvisorAgent }         from '../agents/FinAdvisorAgent.js';
import { BudgetAnalyzerAgent }     from '../agents/BudgetAnalyzerAgent.js';
import { InvestmentSimulatorAgent } from '../agents/InvestmentSimulatorAgent.js';
import { DebtOptimizerAgent }      from '../agents/DebtOptimizerAgent.js';
import { LoanAnalyzerAgent }       from '../agents/LoanAnalyzerAgent.js';

const router = Router();

// Instantiate agents once (stateless — safe to reuse)
const finAdvisor      = new FinAdvisorAgent();
const budgetAnalyzer  = new BudgetAnalyzerAgent();
const investSim       = new InvestmentSimulatorAgent();
const debtOptimizer   = new DebtOptimizerAgent();
const loanAnalyzer    = new LoanAnalyzerAgent();

// ── POST /api/ai/advisor — streaming financial advice chat ────────────────
router.post('/advisor', (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  // Last user message
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return res.status(400).json({ error: 'no user message found' });

  // History context (exclude last message)
  const history = messages.slice(0, -1);

  const response = finAdvisor.respond(lastUser.content, history);

  // Stream response word-by-word for natural feel
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const words = response.split(' ');
  let idx = 0;
  const CHUNK_SIZE = 3; // words per chunk
  const DELAY_MS   = 28;

  const send = () => {
    if (idx >= words.length) {
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
    const chunk = words.slice(idx, idx + CHUNK_SIZE).join(' ') + ' ';
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    idx += CHUNK_SIZE;
    setTimeout(send, DELAY_MS);
  };

  send();
});

// ── POST /api/ai/budget ───────────────────────────────────────────────────
router.post('/budget', (req, res) => {
  const { income, expenses, goals } = req.body;
  if (!income || income <= 0) return res.status(400).json({ error: 'income required' });

  try {
    const result = budgetAnalyzer.analyze({ income, expenses: expenses || {}, goals });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/investment ───────────────────────────────────────────────
router.post('/investment', (req, res) => {
  const { amount, riskTolerance, timeHorizon, goals } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'amount required' });

  try {
    const result = investSim.simulate({ amount, riskTolerance, timeHorizon, goals });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/debt ─────────────────────────────────────────────────────
router.post('/debt', (req, res) => {
  const { debts, extraPayment } = req.body;
  if (!debts?.length) return res.status(400).json({ error: 'debts required' });

  try {
    const result = debtOptimizer.optimize({ debts, extraPayment });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/loans ────────────────────────────────────────────────────
router.post('/loans', (req, res) => {
  const { balance, interestRate, income, familySize, loanType } = req.body;
  if (!balance || !interestRate || !income) {
    return res.status(400).json({ error: 'balance, interestRate, and income are required' });
  }

  try {
    const result = loanAnalyzer.analyze({ balance, interestRate, income, familySize, loanType });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/quiz-explain ─────────────────────────────────────────────
router.post('/quiz-explain', (req, res) => {
  const { question, correctAnswer, userAnswer, topic } = req.body;
  const isCorrect = correctAnswer === userAnswer;

  // Generate explanation from the question's built-in context
  const explanation = isCorrect
    ? `Correct! ${correctAnswer} is right. This is a key concept in ${topic}: understanding this principle helps you make better financial decisions in real life.`
    : `The correct answer is "${correctAnswer}." You chose "${userAnswer}." In ${topic}, this distinction matters because it directly affects your financial outcomes. Review the lesson on this topic to reinforce the concept.`;

  res.json({ explanation });
});

export default router;
