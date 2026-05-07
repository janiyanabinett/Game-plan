import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/modules', label: 'Modules', icon: '📚' },
  { to: '/ai-advisor', label: 'AI Advisor', icon: '🤖' },
  { to: '/budget-planner', label: 'Budget Planner', icon: '📊' },
  { to: '/investment-simulator', label: 'Investment Sim', icon: '📈' },
  { to: '/debt-calculator', label: 'Debt Calculator', icon: '⚖️' },
  { to: '/loan-analyzer', label: 'Loan Analyzer', icon: '🎓' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-gray-700">
        <div className="text-xl font-bold text-white">FinLit AI</div>
        <div className="text-xs text-gray-400 mt-0.5">College Financial Program</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Powered by Claude AI
        </div>
      </div>
    </aside>
  );
}
