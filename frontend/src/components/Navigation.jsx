function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'artists', label: 'Artists', icon: '👥' },
    { id: 'auto-update', label: 'Auto-Update', icon: '🔄' },
    { id: 'bulk-import', label: 'Bulk Import', icon: '📥' },
    { id: 'auto-flag', label: 'Auto-Flag Rules', icon: '🚩' },
  ]

  return (
    <div className="glass-panel rounded-2xl p-2 mb-8 inline-flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            group flex items-center py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300
            ${activeTab === tab.id
              ? 'bg-neon-blue/10 text-neon-blue shadow-neon-blue border border-neon-blue/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }
          `}
        >
          <span className={`mr-2 text-lg ${activeTab === tab.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0'} transition-all`}>
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Navigation
