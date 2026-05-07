import { Link } from 'react-router-dom';
import { modules } from '../data/modules';
import { useProgress } from '../hooks/useProgress';

const colorBadge: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  red: 'bg-red-100 text-red-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export default function Modules() {
  const { progress } = useProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Literacy Modules</h1>
        <p className="text-gray-500 mt-1">
          8 comprehensive modules covering everything from budgeting to investing.
          Complete each module and take the quiz to test your knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map((mod, idx) => {
          const completed = progress.completedModules.includes(mod.id);
          const quizScore = progress.quizScores[mod.id];

          return (
            <Link
              key={mod.id}
              to={`/modules/${mod.id}`}
              className="card p-5 hover:shadow-md transition-shadow hover:border-gray-300 flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                {mod.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">Module {idx + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorBadge[mod.color] || 'bg-gray-100 text-gray-600'}`}>
                    {mod.difficulty}
                  </span>
                  {completed && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <div className="font-semibold text-gray-900 mt-0.5">{mod.title}</div>
                <div className="text-sm text-gray-500 mt-0.5 truncate">{mod.description}</div>
              </div>

              <div className="flex-shrink-0 text-right space-y-1">
                <div className="text-sm text-gray-500">{mod.estimatedMinutes} min</div>
                <div className="text-xs text-gray-400">{mod.lessons.length} lessons</div>
                {quizScore !== undefined && (
                  <div className={`text-xs font-medium ${quizScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                    Quiz: {quizScore}%
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 text-gray-300 text-xl">›</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
