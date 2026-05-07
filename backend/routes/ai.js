import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

const ADVISOR_SYSTEM = `You are FinLit AI, an expert financial literacy coach for college students.
You provide clear, actionable, jargon-free financial advice tailored to young adults managing
student loans, entry-level incomes, and building wealth from scratch.

Guidelines:
- Keep responses concise and practical (under 300 words unless deep analysis is needed)
- Use relatable examples relevant to college students
- Always clarify that you are an educational tool, not a licensed financial advisor
- Encourage good habits: emergency funds, avoiding high-interest debt, investing early
- When asked about specific investments, explain concepts but remind users to consult a professional`;

// POST /api/ai/advisor — streaming chat
router.post('/advisor', async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: ADVISOR_SYSTEM,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// POST /api/ai/budget — analyze budget
router.post('/budget', async (req, res) => {
  const { income, expenses, goals } = req.body;

  const prompt = `Analyze this college student's monthly budget and provide specific, actionable recommendations.

Monthly Income: $${income}
Expenses:
${Object.entries(expenses).map(([k, v]) => `  - ${k}: $${v}`).join('\n')}
Financial Goals: ${goals || 'Build savings, manage debt'}

Provide:
1. A budget health score (0-100) with brief explanation
2. Top 3 specific improvements they can make right now
3. How their budget compares to the 50/30/20 rule (needs/wants/savings)
4. One actionable tip to save more this month

Format as JSON with keys: score, scoreExplanation, improvements (array of 3 strings), fiftyThirtyTwenty (object with needs/wants/savings percentages and assessment), quickTip`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/investment — portfolio strategy
router.post('/investment', async (req, res) => {
  const { amount, riskTolerance, timeHorizon, goals } = req.body;

  const prompt = `Provide an educational investment portfolio allocation for a college student with these parameters:

Monthly investment amount: $${amount}
Risk tolerance: ${riskTolerance} (low/medium/high)
Time horizon: ${timeHorizon} years
Goals: ${goals}

Provide educational portfolio guidance as JSON with keys:
- allocation: array of objects with { category, percentage, examples, rationale }
- projections: array of objects with { years, conservative, moderate, optimistic } showing $ growth at 3 years, 10 years, 30 years
- keyPrinciples: array of 3 strings with investing principles for beginners
- firstSteps: array of 3 specific action items to start investing

Use realistic return assumptions (conservative 4%, moderate 7%, optimistic 10% annual).
Include a disclaimer that this is educational, not financial advice.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/debt — debt payoff strategy
router.post('/debt', async (req, res) => {
  const { debts, extraPayment } = req.body;

  const prompt = `Calculate and compare debt payoff strategies for this college student.

Debts:
${debts.map((d) => `  - ${d.name}: $${d.balance} balance, ${d.rate}% APR, $${d.minPayment}/month minimum`).join('\n')}
Extra monthly payment available: $${extraPayment}

Calculate both Avalanche (highest interest first) and Snowball (smallest balance first) strategies.
Return JSON with keys:
- avalanche: { order (array of debt names), totalInterestPaid, monthsToPayoff, monthlySavingsVsMinimum }
- snowball: { order (array of debt names), totalInterestPaid, monthsToPayoff, motivationBenefit }
- recommendation: string explaining which strategy suits this situation and why
- totalDebt: number
- minimumOnlyPayoff: { months, totalInterestPaid }`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/loans — student loan analysis
router.post('/loans', async (req, res) => {
  const { balance, interestRate, income, familySize, loanType } = req.body;

  const prompt = `Analyze federal student loan repayment options for this graduate.

Loan details:
- Total balance: $${balance}
- Interest rate: ${interestRate}%
- Annual income: $${income}
- Family size: ${familySize}
- Loan type: ${loanType} (federal/private)

Compare these repayment plans and return JSON with keys:
- plans: array of objects, each with:
  { name, monthlyPayment, totalPaid, totalInterest, payoffYears, description, bestFor }
  Include: Standard (10yr), Graduated, SAVE/IBR (income-driven), PSLF eligibility note
- recommendation: string with the best plan for this person's situation
- forgivenessPotential: string explaining any loan forgiveness options
- tips: array of 3 actionable tips

Note: Use current 2024-2025 federal guidelines for income-driven repayment calculations.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/quiz-explain — explain a quiz answer
router.post('/quiz-explain', async (req, res) => {
  const { question, correctAnswer, userAnswer, topic } = req.body;

  const prompt = `A college student answered a financial literacy quiz question.

Topic: ${topic}
Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}
Did they get it right: ${correctAnswer === userAnswer ? 'Yes' : 'No'}

Provide a brief, encouraging explanation (2-3 sentences) that:
1. Confirms or corrects their answer
2. Explains the key concept clearly
3. Gives a real-world example relevant to college students

Return plain text, no JSON needed.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ explanation: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
