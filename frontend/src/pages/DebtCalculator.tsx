import { useState } from 'react';
import { api } from '../lib/api';
import { useProgress } from '../hooks/useProgress';
import { DebtItem } from '../types';

interface DebtStrategy {
  order: string[];
  totalInterestPaid: number;
  monthsToPayoff: number;
  monthlySavingsVsMinimum?: number;
  motivationBenefit?: string;
}

interface DebtResult {
  avalanche: DebtStrategy;
  snowball: DebtStrategy;
  recommendation: string;
  totalDebt: number;
  minimumOnlyPayoff: { months: number; totalInterestPaid: number };
}

const defaultDebts: DebtItem[] = [
  { name: 'Credit Card', balance: 2500, rate: 22, minPayment: 75 },
  { name: 'Student Loan', balance: 18000, rate: 5.5, minPayment: 195 },
  { name: 'Car Loan', balance: 8000, rate: 7.9, minPayment: 185 },
];

export default function DebtCalculator() {
  const { recordToolUse } = useProgress();
  const [debts, setDebts] = useState<DebtItem[]>(defaultDebts);
  const [extraPayment, setExtraPayment] = useState('300');
  const [result, setResult] = useState<DebtResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDebt = () => setDebts((prev) => [...prev, { name: '', balance: 0, rate: 0, minPayment: 0 }]);
  const removeDebt = (i: number) => setDebts((prev) => prev.filter((_, idx) => idx !== i));
  const updateDebt = (i: number, field: keyof DebtItem, val: string) => {
    setDebts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: field === 'name' ? val : parseFloat(val) || 0 } : d)));
  };

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayment = debts.reduce((s, d) => s + d.minPayment, 0);

  const handleCalculate = async () => {
    const validDebts = debts.filter((d) => d.name && d.balance > 0 && d.rate > 0 && d.minPayment > 0);
    if (validDebts.length === 0) {
      setError('Please add at least one debt with all fields filled in.');
      return;
    }
    setError('');
    setLoading(true);
    recordToolUse('debt-calculator');

    try {
      const { data } = await api.post<DebtResult>('/api/ai/debt', {
        debts: validDebts,
        extraPayment: parseFloat(extraPayment) || 0,
      });
      setResult(data);
    } catch {
      setError('Failed to calculate. Make sure the backend is running with ANTHROPIC_API_KEY set.');
    } finally {
      setLoading(false);
    }
  };

  const months = (m: number) => {
    const yrs = Math.floor(m / 12);
    const mos = m % 12;
    return yrs > 0 ? `${yrs}y ${mos}m` : `${mos}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Debt Payoff Optimizer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Compare Avalanche vs Snowball strategies with AI-optimized recommendations.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Your Debts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Debt Name</th>
                <th className="pb-2 font-medium">Balance</th>
                <th className="pb-2 font-medium">APR %</th>
                <th className="pb-2 font-medium">Min Payment</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {debts.map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => updateDebt(i, 'name', e.target.value)}
                      placeholder="e.g. Visa Card"
                      className="input text-sm"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={d.balance || ''}
                        onChange={(e) => updateDebt(i, 'balance', e.target.value)}
                        placeholder="0"
                        className="input text-sm pl-7"
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <div className="relative">
                      <input
                        type="number"
                        value={d.rate || ''}
                        onChange={(e) => updateDebt(i, 'rate', e.target.value)}
                        placeholder="0"
                        className="input text-sm pr-7"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={d.minPayment || ''}
                        onChange={(e) => updateDebt(i, 'minPayment', e.target.value)}
                        placeholder="0"
                        className="input text-sm pl-7"
                      />
                    </div>
                  </td>
                  <td className="py-2">
                    <button onClick={() => removeDebt(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addDebt} className="btn-secondary text-sm mt-3">+ Add Debt</button>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <span>Total Debt: <strong>${totalDebt.toLocaleString()}</strong></span>
          <span>Min Payments: <strong>${totalMinPayment}/month</strong></span>
        </div>

        <div className="mt-4">
          <label className="label">Extra Monthly Payment (beyond minimums)</label>
          <div className="relative w-48">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              className="input pl-7"
              placeholder="300"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-3">{error}</div>}

        <button onClick={handleCalculate} disabled={loading} className="btn-primary mt-4">
          {loading ? '🤖 Calculating...' : '🤖 Calculate Payoff Strategy'}
        </button>
      </div>

      {loading && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3 animate-bounce">⚖️</div>
          <div className="text-gray-500 font-medium">Comparing debt payoff strategies...</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Strategy Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avalanche */}
            <div className="card p-5 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏔️</span>
                <div>
                  <h3 className="font-bold text-gray-900">Avalanche Method</h3>
                  <p className="text-xs text-gray-500">Highest interest rate first</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payoff order:</span>
                  <span className="font-medium text-right">{result.avalanche.order?.join(' → ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time to debt-free:</span>
                  <span className="font-bold text-blue-600">{months(result.avalanche.monthsToPayoff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total interest paid:</span>
                  <span className="font-bold text-green-600">${result.avalanche.totalInterestPaid?.toLocaleString()}</span>
                </div>
                {result.avalanche.monthlySavingsVsMinimum !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Savings vs. minimum only:</span>
                    <span className="font-medium text-green-600">${result.avalanche.monthlySavingsVsMinimum?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Snowball */}
            <div className="card p-5 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⛄</span>
                <div>
                  <h3 className="font-bold text-gray-900">Snowball Method</h3>
                  <p className="text-xs text-gray-500">Smallest balance first</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payoff order:</span>
                  <span className="font-medium text-right">{result.snowball.order?.join(' → ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time to debt-free:</span>
                  <span className="font-bold text-purple-600">{months(result.snowball.monthsToPayoff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total interest paid:</span>
                  <span className="font-bold text-orange-500">${result.snowball.totalInterestPaid?.toLocaleString()}</span>
                </div>
                {result.snowball.motivationBenefit && (
                  <div className="text-xs text-purple-600 italic mt-1">{result.snowball.motivationBenefit}</div>
                )}
              </div>
            </div>
          </div>

          {/* Minimum only comparison */}
          {result.minimumOnlyPayoff && (
            <div className="card p-4 bg-red-50 border-red-200">
              <div className="text-sm font-semibold text-red-900 mb-1">Minimum Payments Only (don't do this)</div>
              <div className="flex gap-6 text-sm text-red-700">
                <span>Payoff time: <strong>{months(result.minimumOnlyPayoff.months)}</strong></span>
                <span>Total interest: <strong>${result.minimumOnlyPayoff.totalInterestPaid?.toLocaleString()}</strong></span>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="card p-5 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Recommendation</h3>
            <p className="text-sm text-blue-800">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
