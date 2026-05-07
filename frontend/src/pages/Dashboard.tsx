import { Link } from 'react-router-dom';
import { modules } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  red: 'bg-red-50 border-red-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  orange: 'bg-orange-50 border-orange-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  indigo: 'bg-indigo-50 border-indigo-200',
};

const tools = [
  { to: '/ai-advisor', icon: '🤖', title: 'AI Financial Advisor', desc: 'Chat with your personal finance AI coach' },
  { to: '/budget-planner', icon: '📊', title: 'Budget Analyzer', desc: 'Get AI-powered budget recommendations' },
  { to: '/investment-simulator', icon: '📈', title: 'Investment Simulator', desc: 'Model your portfolio growth' },
  { to: '/debt-calculator', icon: '⚖️', title: 'Debt Optimizer', desc: 'AI-optimized payoff strategy' },
  { to: '/loan-analyzer', icon: '🎓', title: 'Loan Analyzer', desc: 'Compare student loan repayment plans' },
];

export default function Dashboard() {
  const { progress } = useProgress();
  const completedCount = progress.completedModules.length;
  const totalModules = modules.length;
  const overallPct = Math.round((completedCount / totalModules) * 100);

  const avgQuizScore =
    Object.values(progress.quizScores).length > 0
      ? Math.round(
          Object.values(progress.quizScores).reduce((a, b) => a + b, 0) /
            Object.values(progress.quizScores).length
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to FinLit AI</h1>
        <p className="text-gray-500 mt-1">
          Your AI-powered college financial literacy program. Learn, practice, and get personalized guidance.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Modules Completed', value: `${completedCount}/${totalModules}`, icon: '📚' },
          { label: 'Overall Progress', value: `${overallPct}%`, icon: '🎯' },
          { label: 'Avg Quiz Score', value: avgQuizScore > 0 ? `${avgQuizScore}%` : '—', icon: '✅' },
          { label: 'AI Tools Used', value: `${progress.toolsUsed.length}/5`, icon: '🤖' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Program Progress</h2>
          <span className="text-sm text-gray-500">{completedCount} of {totalModules} modules</span>
        </div>
        <ProgressBar value={completedCount} max={totalModules} color="bg-blue-500" showLabel />
        <p className="text-xs text-gray-400 mt-2">
          Complete all 8 modules and quizzes to master college-level financial literacy.
        </p>
      </div>

      {/* Module Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Learning Modules</h2>
          <Link to="/modules" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.slice(0, 4).map((mod) => {
            const completed = progress.completedModules.includes(mod.id);
            const quizScore = progress.quizScores[mod.id];
            return (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className={`card p-4 border hover:shadow-md transition-shadow ${colorMap[mod.color] || 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mod.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{mod.title}</div>
                      <div className="text-xs text-gray-500">{mod.estimatedMinutes} min · {mod.difficulty}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Done
                      </span>
                    )}
                    {quizScore !== undefined && (
                      <span className="text-xs text-gray-500">{quizScore}% quiz</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Tools */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="card p-4 hover:shadow-md transition-shadow hover:border-blue-200 group"
            >
              <div className="text-2xl mb-2">{tool.icon}</div>
              <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                {tool.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
