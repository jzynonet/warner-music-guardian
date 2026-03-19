function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'artists', label: 'Artists' },
    { id: 'auto-update', label: 'Auto-Update' },
    { id: 'bulk-import', label: 'Bulk Import' },
    { id: 'auto-flag', label: 'Auto-Flag Rules' },
  ]

  return (
    <div className="glass-panel rounded-xl p-1.5 mb-8 inline-flex flex-wrap gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            py-2 px-5 rounded-lg font-medium text-sm transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-white/10 text-white'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Navigation
