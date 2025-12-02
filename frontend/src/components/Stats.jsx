function Stats({ stats, onFilterClick, activeFilter }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel h-24 animate-pulse rounded-xl"></div>
        ))}
      </div>
    )
  }

  const statCards = [
    { id: 'all', label: 'Total Videos', value: stats.total_videos, color: 'text-white', bg: 'bg-white/5' },
    { id: 'pending', label: 'Pending', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/5' },
    { id: 'reviewed', label: 'Reviewed', value: stats.reviewed, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    { id: 'flagged', label: 'Flagged', value: stats.flagged, color: 'text-red-400', bg: 'bg-red-500/5' },
  ]
  
  const priorityCards = [
    { id: 'critical', label: 'Critical', value: stats.priority_critical || 0, color: 'text-red-400' },
    { id: 'high', label: 'High', value: stats.priority_high || 0, color: 'text-amber-400' },
    { id: 'medium', label: 'Medium', value: stats.priority_medium || 0, color: 'text-blue-400' },
    { id: 'low', label: 'Low', value: stats.priority_low || 0, color: 'text-slate-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Main Status Cards - Clickable for filtering */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const isActive = activeFilter === stat.id || (stat.id === 'all' && !activeFilter)
          return (
            <button 
              key={stat.id}
              onClick={() => onFilterClick && onFilterClick(stat.id === 'all' ? null : stat.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? 'bg-white/[0.08] border-white/20 shadow-glass' 
                  : 'bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                }`}
            >
              <div className="relative z-10">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Secondary Metrics - Compact Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Breakdown */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2">Risk Level</div>
          <div className="flex gap-6 flex-1 justify-end">
            {priorityCards.map((stat) => (
              <div key={stat.id} className="text-right">
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Stats */}
        {stats.auto_flagged !== undefined && (
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Detection</div>
                  <div className="text-sm text-slate-300">
                    <span className="text-white font-bold">{stats.auto_flagged}</span> videos flagged automatically
                  </div>
                </div>
             </div>
             <div className="text-right">
               <div className="text-2xl font-bold text-white">
                 {stats.total_videos > 0 ? Math.round((stats.auto_flagged / stats.total_videos) * 100) : 0}%
               </div>
               <div className="text-[10px] text-slate-500 uppercase">Rate</div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Stats
