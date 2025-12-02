import { useState } from 'react'
import axios from 'axios'

function ScheduleManager({ apiConfigured }) {
  const [enabled, setEnabled] = useState(false)
  const [intervalHours, setIntervalHours] = useState(24)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.post('/api/schedule', {
        enabled,
        interval_hours: intervalHours
      })
      alert(enabled ? `Automatic search scheduled every ${intervalHours} hours` : 'Automatic search disabled')
    } catch (error) {
      alert(`Failed to update schedule: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
        <div className="p-2 bg-neon-green/10 rounded-lg border border-neon-green/20 shadow-neon-green/20">
            <span className="text-xl">⏰</span>
        </div>
        <span className="tracking-wide">Auto-Schedule</span>
      </h2>
      
      <div className="space-y-6 relative z-10">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={!apiConfigured}
              className="rounded border-slate-600 bg-slate-800 text-neon-green focus:ring-neon-green focus:ring-offset-0"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
              Enable automatic searches
            </span>
          </label>
        </div>

        {enabled && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Interval (hours)
            </label>
            <div className="relative">
                <input
                type="number"
                min="1"
                max="168"
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value))}
                className="block w-full bg-slate-900/50 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 text-white px-3 py-2.5 backdrop-blur-sm"
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm font-medium">hrs</span>
                </div>
            </div>
            <p className="mt-2 text-xs text-neon-green/80 font-medium">
              Search will run every {intervalHours} hours
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !apiConfigured}
          className="w-full bg-gradient-to-r from-emerald-600 to-neon-green hover:from-emerald-500 hover:to-neon-green/90 text-white py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green/50 disabled:opacity-50 font-bold tracking-wide transition-all shadow-lg shadow-neon-green/20 hover:shadow-neon-green/40 transform hover:-translate-y-0.5"
        >
          {loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  )
}

export default ScheduleManager
