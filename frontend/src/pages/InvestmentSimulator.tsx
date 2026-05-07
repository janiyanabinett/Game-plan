import { useState } from 'react';
import { api } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProgress } from '../hooks/useProgress';

interface Allocation {
  category: string;
  percentage: number;
  examples: string;
  rationale: string;
}

interface Projection {
  years: number;
  conservative: number;
  moderate: number;
  optimistic: number;
}

interface InvestmentResult {
  allocation: Allocation[];
  projections: Projection[];
  keyPrinciples: string[];
  firstSteps: string[];
}

const formatDollar = (v: number) =>
  v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;

export default function InvestmentSimulator() {
  const { recordToolUse } = useProgress();
  const [amount, setAmount] = useState('200');
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [horizon, setHorizon] = useState('30');
  const [goals, setGoals] = useState('Retirement savings and wealth building');
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSimulate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a monthly investment amount.');
      return;
    }
    setError('');
    setLoading(true);
    recordToolUse('investment-simulator');

    try {
      const { data } = await api.post<InvestmentResult>('/api/ai/investment', {
        amount: parseFloat(amount),
        riskTolerance: risk,
        timeHorizon: parseInt(horizon),
        goals,
      });
      setResult(data);
    } catch {
      setError('Failed to generate simulation. Make sure the backend is running with ANTHROPIC_API_KEY set.');
    } finally {
      setLoading(false);
    }
  };

  const allocationColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio Simulator</h1>
        <p className="text-gray-500 text-sm mt-1">
          Build an AI-guided investment strategy and see your wealth grow over time.
        </p>
      </div>

      {/* Inputs */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Portfolio Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Monthly Investment</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-7"
                placeholder="200"
              />
            </div>
          </div>
          <div>
            <label className="label">Risk Tolerance</label>
            <select value={risk} onChange={(e) => setRisk(e.target.value as 'low' | 'medium' | 'high')} className="input">
              <option value="low">Low — Preservation</option>
              <option value="medium">Medium — Balanced</option>
              <option value="high">High — Growth</option>
            </select>
          </div>
          <div>
            <label className="label">Time Horizon (years)</label>
            <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="input">
              {[5, 10, 15, 20, 25, 30, 35, 40].map((y) => (
                <option key={y} value={y}>{y} years</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Primary Goal</label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="input"
              placeholder="Retirement, house, etc."
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-3">{error}</div>}

        <button onClick={handleSimulate} disabled={loading} className="btn-primary mt-4">
          {loading ? '🤖 Building Strategy...' : '🤖 Generate AI Strategy'}
        </button>
      </div>

      {loading && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3 animate-bounce">📈</div>
          <div className="text-gray-500 font-medium">Building your personalized investment strategy...</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          {/* Growth Chart */}
          {result.projections?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Projected Portfolio Growth</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={result.projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="years" tickFormatter={(v) => `Year ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatDollar} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} labelFormatter={(l) => `Year ${l}`} />
                  <Legend />
                  <Line type="monotone" dataKey="conservative" stroke="#94a3b8" name="Conservative (4%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="moderate" stroke="#3b82f6" name="Moderate (7%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="optimistic" stroke="#10b981" name="Optimistic (10%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Projections assume ${amount}/month invested. Past performance does not guarantee future results.
              </p>
            </div>
          )}

          {/* Allocation */}
          {result.allocation?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Recommended Portfolio Allocation</h2>
              <div className="space-y-3">
                {result.allocation.map((a, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{a.category}</span>
                      <span className="font-bold" style={{ color: allocationColors[i % allocationColors.length] }}>
                        {a.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${a.percentage}%`, backgroundColor: allocationColors[i % allocationColors.length] }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{a.examples}</span>
                      <span className="italic">{a.rationale}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key Principles */}
            {result.keyPrinciples?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Key Investing Principles</h2>
                <div className="space-y-2">
                  {result.keyPrinciples.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-0.5">●</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* First Steps */}
            {result.firstSteps?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Action Plan — Start Today</h2>
                <div className="space-y-2">
                  {result.firstSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg p-3">
            ⚠️ This is an educational simulation only. Investment returns are not guaranteed. Consult a licensed financial advisor before making investment decisions.
          </div>
        </div>
      )}
    </div>
  );
}
