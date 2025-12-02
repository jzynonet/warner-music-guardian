import { useState, useEffect } from 'react'
import axios from 'axios'

function AutoUpdateManager({ apiConfigured }) {
  const [artists, setArtists] = useState([])
  const [updateStatus, setUpdateStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [runningUpdate, setRunningUpdate] = useState(null)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    frequency: 'weekly',
    source: 'spotify'
  })

  useEffect(() => {
    loadArtists()
    loadStatus()
  }, [])

  const loadArtists = async () => {
    try {
      const response = await axios.get('/api/artists')
      setArtists(response.data)
    } catch (error) {
      console.error('Error loading artists:', error)
    }
  }

  const loadStatus = async () => {
    try {
      const response = await axios.get('/api/auto-update/status')
      setUpdateStatus(response.data)
    } catch (error) {
      console.error('Error loading auto-update status:', error)
    }
  }

  const handleEnableAutoUpdate = async (artistId) => {
    setLoading(true)
    try {
      await axios.post(`/api/auto-update/enable/${artistId}`, config)
      await loadStatus()
      setShowConfig(false)
      setSelectedArtist(null)
      alert(`Auto-update enabled! Songs will be checked ${config.frequency} via ${config.source}`)
    } catch (error) {
      alert(`Failed to enable auto-update: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableAutoUpdate = async (artistId) => {
    setLoading(true)
    try {
      await axios.post(`/api/auto-update/disable/${artistId}`)
      await loadStatus()
      alert('Auto-update disabled')
    } catch (error) {
      alert(`Failed to disable auto-update: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRunUpdate = async (artistId) => {
    setRunningUpdate(artistId)
    try {
      const response = await axios.post(`/api/auto-update/run/${artistId}`)
      const result = response.data
      
      if (result.success) {
        alert(`✅ Update Complete!\n\nArtist: ${result.artist}\nNew Songs Added: ${result.new_songs}\nTotal Songs: ${result.total_songs}\nSource: ${result.source}`)
      } else {
        alert(`❌ Update Failed: ${result.error}`)
      }
      
      await loadStatus()
    } catch (error) {
      alert(`Failed to run update: ${error.response?.data?.error || error.message}`)
    } finally {
      setRunningUpdate(null)
    }
  }

  const handleRunAllUpdates = async () => {
    if (!confirm('Run updates for all enabled artists? This may take a while.')) return
    
    setLoading(true)
    try {
      const response = await axios.post('/api/auto-update/run-all')
      const results = response.data.results
      
      const summary = results.map(r => 
        r.success 
          ? `✅ ${r.artist}: +${r.new_songs} songs` 
          : `❌ ${r.artist || 'Unknown'}: ${r.error}`
      ).join('\n')
      
      alert(`Batch Update Complete!\n\n${summary}`)
      await loadStatus()
    } catch (error) {
      alert(`Failed to run batch update: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openConfigModal = (artistId) => {
    setSelectedArtist(artistId)
    setShowConfig(true)
    setConfig({ frequency: 'weekly', source: 'spotify' })
  }

  const getArtistConfig = (artistId) => {
    if (!updateStatus?.artists) return null
    return updateStatus.artists.find(a => a.artist_id === artistId)
  }

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId)
    return artist?.name || 'Unknown'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/5">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
             <span className="text-xl">🔄</span>
          </div>
          <div>
             <h2 className="text-xl font-bold text-white leading-none">
              Automatic Song Updates
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Auto-fetch new songs from Spotify/MusicBrainz
            </p>
          </div>
        </div>
        
        {updateStatus && updateStatus.enabled > 0 && (
          <button
            onClick={handleRunAllUpdates}
            disabled={loading || !apiConfigured}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Update All</span>
          </button>
        )}
      </div>

      {updateStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-3xl font-bold text-white tracking-tight">{updateStatus.total_artists}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Total Artists</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-3xl font-bold text-indigo-400 tracking-tight">{updateStatus.enabled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Auto-Update Enabled</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-3xl font-bold text-slate-400 tracking-tight">{updateStatus.disabled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Disabled</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-3xl font-bold text-amber-400 tracking-tight">{updateStatus.needs_update}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Need Update</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {artists.length === 0 ? (
           <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
             <div className="text-4xl mb-3 opacity-20">🔄</div>
            <p className="text-slate-500 font-medium">
              No artists found. Add artists first to enable auto-updates.
            </p>
          </div>
        ) : (
          artists.map((artist) => {
            const artistConfig = getArtistConfig(artist.id)
            const isEnabled = artistConfig?.enabled
            const needsUpdate = artistConfig?.needs_update
            
            return (
              <div
                key={artist.id}
                className={`border rounded-xl p-5 transition-all ${
                  isEnabled
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-white/5 bg-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {artist.name}
                      </h3>
                      
                      {isEnabled && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                          Auto-Update ON
                        </span>
                      )}
                      
                      {needsUpdate && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider animate-pulse">
                          Update Due
                        </span>
                      )}
                    </div>

                    {artistConfig && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-black/20 rounded p-2 border border-white/5">
                          <span className="block text-xs text-slate-500 uppercase">Frequency</span>
                          <span className="font-medium text-slate-300 capitalize">{artistConfig.frequency}</span>
                        </div>
                        <div className="bg-black/20 rounded p-2 border border-white/5">
                          <span className="block text-xs text-slate-500 uppercase">Source</span>
                          <span className="font-medium text-slate-300 capitalize">{artistConfig.source}</span>
                        </div>
                        <div className="bg-black/20 rounded p-2 border border-white/5">
                          <span className="block text-xs text-slate-500 uppercase">Last Check</span>
                          <span className="font-medium text-slate-300">{formatDate(artistConfig.last_check)}</span>
                        </div>
                        {artistConfig.next_check && (
                           <div className="bg-black/20 rounded p-2 border border-white/5">
                            <span className="block text-xs text-slate-500 uppercase">Next Check</span>
                            <span className="font-medium text-slate-300">{formatDate(artistConfig.next_check)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    {isEnabled ? (
                      <>
                        <button
                          onClick={() => handleRunUpdate(artist.id)}
                          disabled={runningUpdate === artist.id || !apiConfigured}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 min-w-[100px]"
                        >
                          {runningUpdate === artist.id ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Running</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Update Now</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDisableAutoUpdate(artist.id)}
                          disabled={loading}
                          className="px-3 py-1.5 text-xs font-medium bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                          Disable
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openConfigModal(artist.id)}
                        disabled={loading || !apiConfigured}
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors border border-white/10"
                      >
                        Enable Auto-Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {!apiConfigured && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-500/90">
            API not configured. Configure YouTube API to enable auto-updates.
          </p>
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl bg-[#0A0A0A]">
            <h3 className="text-xl font-bold text-white mb-6">
              Configure Auto-Update
            </h3>
            <p className="text-sm text-slate-400 mb-6 -mt-4">
                For <span className="text-white font-medium">{getArtistName(selectedArtist)}</span>
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Update Frequency
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-white/20 text-white px-3 py-2.5"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Music Source
                </label>
                <select
                  value={config.source}
                  onChange={(e) => setConfig({ ...config, source: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-white/20 text-white px-3 py-2.5"
                >
                  <option value="spotify">Spotify</option>
                  <option value="musicbrainz">MusicBrainz</option>
                </select>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  ℹ️ New songs will be automatically added as keywords ({config.frequency}) from {config.source}.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleEnableAutoUpdate(selectedArtist)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors font-bold"
                >
                  {loading ? 'Enabling...' : 'Enable'}
                </button>
                <button
                  onClick={() => {
                    setShowConfig(false)
                    setSelectedArtist(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-transparent text-slate-300 rounded-lg hover:bg-white/5 transition-colors font-medium border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutoUpdateManager
