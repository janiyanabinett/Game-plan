import { NavLink } from 'react-router-dom';

const navGroups = [
  {
    label: 'Command Center',
    items: [
      { to: '/', label: 'Dashboard', icon: '⬡' },
      { to: '/agent-lab', label: 'Agent Lab', icon: '◈' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/leads', label: 'Lead Center', icon: '◎' },
      { to: '/sales', label: 'Sales Pipeline', icon: '◇' },
      { to: '/marketing', label: 'Marketing Hub', icon: '◈' },
    ],
  },
  {
    label: 'Listings',
    items: [
      { to: '/properties', label: 'Property Search', icon: '⊡' },
      { to: '/media', label: 'Media Studio', icon: '▣' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { to: '/comms', label: 'Auto-Respond', icon: '◉' },
      { to: '/letters', label: 'Letter Writer', icon: '▤' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#060b16] border-r border-[#1e2d4a] flex flex-col z-30">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1e2d4a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center text-[#0a0e1a] font-bold text-sm">P</div>
          <div>
            <div className="text-sm font-bold text-[#f0f4ff] tracking-tight">PropAI</div>
            <div className="text-[10px] text-[#8899bb] tracking-widest uppercase">Command Center</div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-5 py-2.5 border-b border-[#1e2d4a] flex items-center gap-2">
        <span className="agent-pulse inline-block" />
        <span className="text-xs text-[#10b981]">10 Agents Active</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-[#4a5e7a] uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-[#1e2d4a] text-[#f0f4ff] font-medium border-l-2 border-[#c9a84c]'
                        : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#141d35]'
                    }`
                  }
                >
                  <span className="text-base opacity-70">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1e2d4a]">
        <NavLink to="/crm" className={({ isActive }) => `flex items-center gap-2 text-xs ${isActive ? 'text-[#c9a84c]' : 'text-[#4a5e7a] hover:text-[#8899bb]'} transition-colors`}>
          <span>⊞</span> CRM
        </NavLink>
      </div>
    </aside>
  );
}
