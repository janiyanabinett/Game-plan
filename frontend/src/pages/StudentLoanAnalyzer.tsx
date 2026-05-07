import { useState } from 'react';
import axios from 'axios';
import { useProgress } from '../hooks/useProgress';

interface LoanPlan {
  name: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  payoffYears: number;
  description: string;
  bestFor: string;
}

interface LoanResult {
  plans: LoanPlan[];
  recommendation: string;
  forgivenessPotential: string;
  tips: string[];
}

export default function StudentLoanAnalyzer() {
  const { recordToolUse } = useProgress();
  const [balance, setBalance] = useState('28000');
  const [rate, setRate] = useState('6.5');
  const [income, setIncome] = useState('42000');
  const [familySize, setFamilySize] = useState('1');
  const [loanType, setLoanType] = useState('federal');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!balance || !rate || !income) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    recordToolUse('loan-analyzer');

    try {
      const { data } = await axios.post<LoanResult>('/api/ai/loans', {
        balance: parseFloat(balance),
        interestRate: parseFloat(rate),
        income: parseFloat(income),
        familySize: parseInt(familySize),
        loanType,
      });
      setResult(data);
    } catch {
      setError('Failed to analyze. Make sure the backend is running with ANTHROPIC_API_KEY set.');
    } finally {
      setLoading(false);
    }
  };

  const planColor = (name: string) => {
    if (name.toLowerCase().includes('standard')) return 'border-blue-200 bg-blue-50';
    if (name.toLowerCase().includes('save') || name.toLowerCase().includes('ibr')) return 'border-green-200 bg-green-50';
    if (name.toLowerCase().includes('graduated')) return 'border-purple-200 bg-purple-50';
    if (name.toLowerCase().includes('pslf')) return 'border-amber-200 bg-amber-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Loan Analyzer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Compare federal repayment plans and get AI-powered guidance on the best strategy for your situation.
        </p>
      </div>

      {/* Input Form */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Loan & Income Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Total Loan Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="input pl-7"
                placeholder="28000"
              />
            </div>
          </div>
          <div>
            <label className="label">Average Interest Rate</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="input pr-8"
                placeholder="6.5"
              />
              <span className="absolute right-3 top-2 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="label">Annual Gross Income</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="input pl-7"
                placeholder="42000"
              />
            </div>
          </div>
          <div>
            <label className="label">Family Size</label>
            <select value={familySize} onChange={(e) => setFamilySize(e.target.value)} className="input">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? '(just you)' : 'people'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Loan Type</label>
            <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="input">
              <option value="federal">Federal Loans</option>
              <option value="private">Private Loans</option>
              <option value="mixed">Mix of Federal & Private</option>
            </select>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-3">{error}</div>}

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4">
          {loading ? '🤖 Analyzing Plans...' : '🤖 Analyze Repayment Plans'}
        </button>
      </div>

      {loading && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3 animate-bounce">🎓</div>
          <div className="text-gray-500 font-medium">Comparing repayment plans for your situation...</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          {/* Repayment Plans */}
          {result.plans?.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Repayment Plan Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.plans.map((plan, i) => (
                  <div key={i} className={`card p-4 border ${planColor(plan.name)}`}>
                    <div className="font-bold text-gray-900 mb-1">{plan.name}</div>
                    <div className="text-xs text-gray-500 mb-3">{plan.description}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly payment:</span>
                        <span className="font-bold text-gray-900">${plan.monthlyPayment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payoff timeline:</span>
                        <span className="font-medium">{plan.payoffYears} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total paid:</span>
                        <span className="font-medium">${plan.totalPaid?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total interest:</span>
                        <span className="font-medium text-red-600">${plan.totalInterest?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs bg-white bg-opacity-70 rounded px-2 py-1 text-gray-600 italic">
                      Best for: {plan.bestFor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="card p-5 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Recommendation</h3>
            <p className="text-sm text-blue-800">{result.recommendation}</p>
          </div>

          {/* Forgiveness */}
          {result.forgivenessPotential && (
            <div className="card p-5 bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🎯 Loan Forgiveness Potential</h3>
              <p className="text-sm text-green-800">{result.forgivenessPotential}</p>
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Action Tips</h3>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 font-bold">{i + 1}.</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg p-3">
            ℹ️ Federal loan information based on 2024–2025 guidelines. Income-driven repayment calculations are estimates. Visit StudentAid.gov or contact your loan servicer for official figures.
          </div>
        </div>
      )}
    </div>
  );
}
