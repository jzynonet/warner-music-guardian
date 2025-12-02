import { useState, useEffect } from 'react'

function SongSelectionModal({ isOpen, onClose, artistInfo, mainSongs, featuredSongs, onImport }) {
  const [selectedSongs, setSelectedSongs] = useState([])
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Helper to get song name (handles both string and object formats)
  const getSongName = (song) => {
    if (!song) return ''
    return typeof song === 'string' ? song : song.name || song.song_name || ''
  }

  useEffect(() => {
    if (isOpen && mainSongs) {
      // Pre-select all main artist songs by default
      setSelectedSongs([...mainSongs])
    }
  }, [isOpen, mainSongs])

  if (!isOpen) return null

  const handleToggleAll = (songs, checked) => {
    if (checked) {
      // Add songs that aren't already selected (compare by name)
      const newSongs = songs.filter(song => {
        const songName = getSongName(song)
        return !selectedSongs.some(s => getSongName(s) === songName)
      })
      setSelectedSongs([...selectedSongs, ...newSongs])
    } else {
      // Remove all songs from this list (compare by name)
      const songNames = songs.map(s => getSongName(s))
      setSelectedSongs(selectedSongs.filter(s => !songNames.includes(getSongName(s))))
    }
  }

  const handleToggleSong = (song) => {
    // Check if song is already selected using name comparison
    const songName = getSongName(song)
    const existingIndex = selectedSongs.findIndex(s => getSongName(s) === songName)
    
    if (existingIndex !== -1) {
      // Remove the song
      setSelectedSongs(selectedSongs.filter((s, i) => i !== existingIndex))
    } else {
      // Add the song
      setSelectedSongs([...selectedSongs, song])
    }
  }

  const handleImport = async () => {
    if (selectedSongs.length === 0) {
      alert('Please select at least one song to import')
      return
    }

    setImporting(true)
    await onImport(selectedSongs)
    setImporting(false)
  }

  const filteredMainSongs = mainSongs.filter(song => 
    getSongName(song).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFeaturedSongs = featuredSongs.filter(song => 
    getSongName(song).toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper to compare songs (handles both string and object formats)
  const isSongSelected = (song) => {
    return selectedSongs.some(selected => {
      const selectedName = getSongName(selected)
      const songName = getSongName(song)
      return selectedName === songName
    })
  }

  const allMainSelected = mainSongs.every(s => isSongSelected(s))
  const allFeaturedSelected = featuredSongs.every(s => isSongSelected(s))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">🎵</span> Select Songs to Import
              </h2>
              <div className="space-y-1 pl-1">
                <p className="text-slate-400 font-medium">
                  Artist: <span className="text-neon-blue font-bold">{artistInfo?.name}</span>
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  {mainSongs.length} main songs • {featuredSongs.length} featured songs
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={importing}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-50 p-2 hover:bg-white/10 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs..."
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Song Lists */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Main Artist Songs */}
          <div>
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900/95 py-3 z-10 backdrop-blur-md rounded-lg px-2 -mx-2 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <div className="p-1.5 bg-neon-green/10 rounded-lg border border-neon-green/20">
                    <svg className="w-4 h-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span>Main Artist Songs ({filteredMainSongs.length})</span>
              </h3>
              <label className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={allMainSelected}
                  onChange={(e) => handleToggleAll(mainSongs, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                />
                <span className="text-slate-300 font-medium">Select All</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMainSongs.map((song, index) => (
                <label
                  key={`main-${index}`}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border transition-all ${isSongSelected(song) ? 'bg-neon-blue/10 border-neon-blue/30' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSongSelected(song)}
                    onChange={() => handleToggleSong(song)}
                    className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                  />
                  <span className={`text-sm font-medium flex-1 ${isSongSelected(song) ? 'text-white' : 'text-slate-400'}`}>{getSongName(song)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured Songs */}
          {featuredSongs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900/95 py-3 z-10 backdrop-blur-md rounded-lg px-2 -mx-2 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </div>
                  <span>Featured Songs ({filteredFeaturedSongs.length})</span>
                </h3>
                <label className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={allFeaturedSelected}
                    onChange={(e) => handleToggleAll(featuredSongs, e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-300 font-medium">Select All</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFeaturedSongs.map((song, index) => (
                  <label
                    key={`featured-${index}`}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border transition-all ${isSongSelected(song) ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSongSelected(song)}
                      onChange={() => handleToggleSong(song)}
                      className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                    />
                    <span className={`text-sm font-medium flex-1 ${isSongSelected(song) ? 'text-white' : 'text-slate-400'}`}>{getSongName(song)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl relative z-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400 font-medium">
              <span className="text-white font-bold text-lg">{selectedSongs.length}</span> songs selected
            </p>
            {selectedSongs.length < (mainSongs.length + featuredSongs.length) && (
              <button
                type="button"
                onClick={() => setSelectedSongs([...mainSongs, ...featuredSongs])}
                className="text-sm text-neon-blue hover:text-neon-blue/80 font-bold hover:underline transition-all"
              >
                Select All ({mainSongs.length + featuredSongs.length})
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleImport}
              disabled={importing || selectedSongs.length === 0}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-neon-green hover:from-emerald-500 hover:to-neon-green/90 text-white rounded-xl disabled:opacity-50 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg shadow-neon-green/20"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Importing {selectedSongs.length} songs...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Import {selectedSongs.length} Selected Songs</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={importing}
              className="px-6 py-3.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 font-bold border border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SongSelectionModal
