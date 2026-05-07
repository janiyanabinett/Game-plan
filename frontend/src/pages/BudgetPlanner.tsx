import { useState } from 'react';
import { api } from '../lib/api';
import { useProgress } from '../hooks/useProgress';

const EXPENSE_CATEGORIES = [
  'Rent/Housing', 'Groceries', 'Transportation', 'Phone', 'Utilities',
  'Dining Out', 'Entertainment', 'Clothing', 'Subscriptions', 'Healthcare',
  'Student Loan Payment', 'Credit Card Payment', 'Other',
];

interface BudgetResult {
  score: number;
  scoreExplanation: string;
  improvements: string[];
  fiftyThirtyTwenty: { needs: number; wants: number; savings: number; assessment: string };
  quickTip: string;
}

export default function BudgetPlanner() {
  const { recordToolUse } = useProgress();
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState('');
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalExpenses = Object.values(expenses).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const netCashFlow = (parseFloat(income) || 0) - totalExpenses;

  const handleAnalyze = async () => {
    if (!income || parseFloat(income) <= 0) {
      setError('Please enter your monthly income.');
      return;
    }
    setError('');
    setLoading(true);
    recordToolUse('budget-planner');

    try {
      const { data } = await api.post<BudgetResult>('/api/ai/budget', {
        income: parseFloat(income),
        expenses: Object.fromEntries(
          Object.entries(expenses)
            .filter(([, v]) => parseFloat(v) > 0)
            .map(([k, v]) => [k, parseFloat(v)])
        ),
        goals,
      });
      setResult(data);
    } catch {
      setError('Failed to analyze budget. Make sure the backend is running with ANTHROPIC_API_KEY set.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Budget Analyzer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your income and expenses to get AI-powered budget analysis and recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-5">
          {/* Income */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Monthly Income (After Tax)</h2>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="2,400"
                className="input pl-7"
              />
            </div>
          </div>

          {/* Expenses */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Monthly Expenses</h2>
            <div className="space-y-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-44 flex-shrink-0">{cat}</label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={expenses[cat] || ''}
                      onChange={(e) => setExpenses((prev) => ({ ...prev, [cat]: e.target.value }))}
                      placeholder="0"
                      className="input pl-7 text-sm py-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Financial Goals</h2>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Build emergency fund, pay off credit card, save for study abroad..."
              rows={3}
              className="input resize-none text-sm"
            />
          </div>

          {/* Summary */}
          <div className={`card p-4 ${netCashFlow >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Income:</span>
              <span className="font-medium">${parseFloat(income || '0').toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-medium">${totalExpenses.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between text-sm font-bold mt-2 pt-2 border-t ${netCashFlow >= 0 ? 'border-green-200 text-green-700' : 'border-red-200 text-red-600'}`}>
              <span>Net Cash Flow:</span>
              <span>{netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}</span>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

          <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full">
            {loading ? '🤖 Analyzing with AI...' : '🤖 Analyze My Budget'}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">📊</div>
              <div className="font-medium text-gray-500">Enter your budget details and click Analyze</div>
              <div className="text-sm mt-1">You'll get a budget health score, 50/30/20 breakdown, and personalized recommendations.</div>
            </div>
          )}

          {loading && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3 animate-bounce">🤖</div>
              <div className="text-gray-500 font-medium">Analyzing your budget...</div>
              <div className="text-sm text-gray-400 mt-1">Claude is reviewing your spending patterns</div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Score */}
              <div className={`card p-5 border-2 ${scoreBg(result.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Budget Health Score</h3>
                  <div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</div>
                </div>
                <p className="text-sm text-gray-700">{result.scoreExplanation}</p>
              </div>

              {/* 50/30/20 */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">50/30/20 Breakdown</h3>
                {[
                  { label: 'Needs (target 50%)', value: result.fiftyThirtyTwenty.needs, target: 50, color: 'bg-blue-500' },
                  { label: 'Wants (target 30%)', value: result.fiftyThirtyTwenty.wants, target: 30, color: 'bg-purple-500' },
                  { label: 'Savings (target 20%)', value: result.fiftyThirtyTwenty.savings, target: 20, color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={`font-medium ${Math.abs(item.value - item.target) > 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 ${item.color} rounded-full`} style={{ width: `${Math.min(100, item.value)}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">{result.fiftyThirtyTwenty.assessment}</p>
              </div>

              {/* Improvements */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Top 3 Improvements</h3>
                <div className="space-y-2">
                  {result.improvements.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 font-bold mt-0.5">{i + 1}.</span>
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div className="card p-4 bg-amber-50 border-amber-200">
                <div className="text-sm font-semibold text-amber-900 mb-1">💡 Quick Win This Month</div>
                <div className="text-sm text-amber-800">{result.quickTip}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
