import { useState } from 'react'

function SearchControl({ songs, onSearch, loading, apiConfigured }) {
  const [selectedSongs, setSelectedSongs] = useState([])
  const [searchAll, setSearchAll] = useState(true)

  const handleSearch = () => {
    if (searchAll) {
      onSearch([])
    } else {
      onSearch(selectedSongs)
    }
  }

  const activeSongs = songs.filter(s => s.active)

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
        <div className="p-2 bg-neon-blue/10 rounded-lg border border-neon-blue/20 shadow-neon-blue">
            <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <span className="tracking-wide">Search YouTube</span>
      </h2>
      
      <div className="space-y-6 relative z-10">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={searchAll}
              onChange={(e) => setSearchAll(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors font-medium">
              Search all active songs ({activeSongs.length})
            </span>
          </label>
        </div>

        {!searchAll && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Select songs
            </label>
            <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl p-2 space-y-1 bg-black/20 backdrop-blur-sm scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {activeSongs.map((song) => {
                const isSelected = selectedSongs.some(s => s.id === song.id)
                
                return (
                  <label key={song.id} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5 border border-transparent'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSongs([...selectedSongs, song])
                        } else {
                          setSelectedSongs(selectedSongs.filter(s => s.id !== song.id))
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{song.song_name}</div>
                      <div className="text-xs text-slate-500 truncate">by {song.artist_name}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}



        <button
          onClick={handleSearch}
          disabled={loading || !apiConfigured || activeSongs.length === 0}
          className="w-full bg-gradient-to-r from-neon-blue to-indigo-600 hover:from-neon-blue/90 hover:to-indigo-500 text-white py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue/50 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wide transition-all shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search {searchAll ? `All ${activeSongs.length} Songs` : `${selectedSongs.length} Selected`}</span>
            </>
          )}
        </button>

        {!apiConfigured && (
          <div className="flex items-start gap-3 p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-500/90">
              YouTube API not configured
            </p>
          </div>
        )}

        {activeSongs.length === 0 && (
          <div className="flex items-start gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg">
             <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-400">
              No active songs. Import an artist below.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchControl
