import { useState, useRef } from 'react'
import axios from 'axios'

function SongManager({ songs, onChange }) {
  const [importMode, setImportMode] = useState('search') // 'search', 'paste', 'csv'
  const [artistNameSearch, setArtistNameSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [songName, setSongName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [pasteArtistName, setPasteArtistName] = useState('')
  const [csvArtistName, setCsvArtistName] = useState('')
  const csvFileRef = useRef(null)

  const handleImport = async (e) => {
    e.preventDefault()
    if (importMode === 'paste') return handlePasteImport()
    if (importMode === 'csv') return handleCsvImport()

    if (!artistNameSearch.trim()) return

    setImporting(true)
    setImportProgress('Searching for songs...')
    
    try {
      const previewResponse = await axios.post('/api/songs/search-artist', { 
        artist_name: artistNameSearch.trim()
      })
      const previewData = previewResponse.data
      const allSongs = [...(previewData.main_songs || []), ...(previewData.featured_songs || [])]

      if (allSongs.length === 0) {
        setImportProgress(null)
        alert('No songs found for this artist. Try checking the spelling.')
        return
      }

      setImportProgress(`Found ${allSongs.length} songs. Importing...`)

      const response = await axios.post('/api/songs/import-from-spotify', {
        artist_info: previewData.artist_info,
        selected_songs: allSongs,
        auto_flag: false,
        priority: 'Medium'
      })
      
      setImportProgress(null)
      setArtistNameSearch('')
      
      const { artist, songs_added, songs_skipped } = response.data
      alert(`Imported ${songs_added} songs for ${artist.name}` + (songs_skipped > 0 ? `\n(${songs_skipped} already in database)` : ''))
      onChange()
    } catch (error) {
      setImportProgress(null)
      alert(error.response?.data?.error || 'Could not find songs. Try checking the spelling.')
    } finally {
      setImporting(false)
    }
  }

  const handlePasteImport = async () => {
    if (!pasteText.trim() || !pasteArtistName.trim()) return

    setImporting(true)
    setImportProgress('Parsing songs...')

    try {
      const parseResponse = await axios.post('/api/songs/parse-text', {
        text: pasteText.trim(),
        artist_name: pasteArtistName.trim()
      })
      const allSongs = parseResponse.data.main_songs || []
      if (allSongs.length === 0) { setImportProgress(null); alert('No songs found in the text.'); return }

      setImportProgress(`Parsed ${allSongs.length} songs. Importing...`)
      const response = await axios.post('/api/songs/import-from-spotify', {
        artist_info: parseResponse.data.artist_info,
        selected_songs: allSongs,
        auto_flag: false,
        priority: 'Medium'
      })
      setImportProgress(null); setPasteText(''); setPasteArtistName('')
      const { artist, songs_added, songs_skipped } = response.data
      alert(`Imported ${songs_added} songs for ${artist.name}` + (songs_skipped > 0 ? `\n(${songs_skipped} already in database)` : ''))
      onChange()
    } catch (error) {
      setImportProgress(null)
      alert(error.response?.data?.error || 'Could not parse songs.')
    } finally {
      setImporting(false)
    }
  }

  const handleCsvImport = async () => {
    const fileInput = csvFileRef.current
    if (!fileInput?.files?.[0]) return

    setImporting(true)
    setImportProgress('Reading CSV...')

    try {
      const fd = new FormData()
      fd.append('file', fileInput.files[0])
      if (csvArtistName.trim()) fd.append('artist_name', csvArtistName.trim())

      const parseResponse = await axios.post('/api/songs/parse-csv-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const allSongs = parseResponse.data.main_songs || []
      if (allSongs.length === 0) { setImportProgress(null); alert('No songs found in the CSV.'); return }

      setImportProgress(`Parsed ${allSongs.length} songs. Importing...`)
      const response = await axios.post('/api/songs/import-from-spotify', {
        artist_info: parseResponse.data.artist_info,
        selected_songs: allSongs,
        auto_flag: false,
        priority: 'Medium'
      })
      setImportProgress(null); setCsvArtistName('')
      const { artist, songs_added, songs_skipped } = response.data
      alert(`Imported ${songs_added} songs for ${artist.name}` + (songs_skipped > 0 ? `\n(${songs_skipped} already in database)` : ''))
      onChange()
    } catch (error) {
      setImportProgress(null)
      alert(error.response?.data?.error || 'Could not parse the CSV file.')
    } finally {
      setImporting(false)
    }
  }

  const handleManualAdd = async (e) => {
    e.preventDefault()
    if (!songName.trim() || !artistName.trim()) return
    try {
      await axios.post('/api/songs', { song_name: songName.trim(), artist_name: artistName.trim() })
      setSongName(''); setArtistName(''); onChange()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add song')
    }
  }

  const handleToggle = async (songId, active) => {
    try { await axios.put(`/api/songs/${songId}`, { active: !active }); onChange() }
    catch { alert('Failed to update song') }
  }

  const handleDelete = async (songId) => {
    if (!confirm('Delete this song?')) return
    try { await axios.delete(`/api/songs/${songId}`); onChange() }
    catch { alert('Failed to delete song') }
  }

  const handleClearAll = async () => {
    if (!confirm(`Delete all ${songs.length} songs? This cannot be undone.`)) return
    try {
      const response = await axios.delete('/api/songs/clear')
      onChange(); alert(`Cleared ${response.data.count} songs`)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to clear songs')
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl p-6 border border-gray-800">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Import Songs</h2>
        {songs.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{songs.length} song{songs.length !== 1 ? 's' : ''} in database</p>
        )}
      </div>

      {/* Clean tab bar */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 p-1 rounded-xl">
        {[
          { id: 'search', label: 'Search' },
          { id: 'paste', label: 'Paste' },
          { id: 'csv', label: 'CSV' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setImportMode(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              importMode === tab.id
                ? 'bg-green-600/20 text-green-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleImport} className="mb-4">
        <div className="space-y-3">
          {importMode === 'search' && (
            <input
              type="text"
              value={artistNameSearch}
              onChange={(e) => setArtistNameSearch(e.target.value)}
              placeholder="Type artist name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-white placeholder-gray-500 px-3 py-2.5"
              disabled={importing}
              autoFocus
            />
          )}

          {importMode === 'paste' && (
            <>
              <input
                type="text"
                value={pasteArtistName}
                onChange={(e) => setPasteArtistName(e.target.value)}
                placeholder="Artist name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-white placeholder-gray-500 px-3 py-2"
                disabled={importing}
                autoFocus
              />
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste song list — one per line:\n\nShake It Off\nBlank Space\nLove Story"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-white placeholder-gray-500 px-3 py-2 min-h-[100px] font-mono"
                disabled={importing}
              />
            </>
          )}

          {importMode === 'csv' && (
            <>
              <input
                type="text"
                value={csvArtistName}
                onChange={(e) => setCsvArtistName(e.target.value)}
                placeholder="Artist name (optional)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-white placeholder-gray-500 px-3 py-2"
                disabled={importing}
              />
              <input
                ref={csvFileRef}
                type="file"
                accept=".csv"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-600/30 file:text-green-300 hover:file:bg-green-600/40 file:cursor-pointer"
                disabled={importing}
              />
            </>
          )}
          
          {importProgress && (
            <div className="flex items-center space-x-2 text-sm text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg p-3">
              <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{importProgress}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={importing || (
              importMode === 'search' ? !artistNameSearch.trim() :
              importMode === 'paste' ? (!pasteText.trim() || !pasteArtistName.trim()) :
              !csvFileRef.current?.files?.[0]
            )}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {importing ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Importing...</span>
              </>
            ) : (
              <span>{importMode === 'search' ? 'Import All Songs' : importMode === 'paste' ? 'Import Songs' : 'Upload & Import'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Manual Add */}
      <div className="border-t border-gray-700 pt-4">
        <button type="button" onClick={() => setShowManualAdd(!showManualAdd)}
          className="text-sm text-gray-400 hover:text-gray-300 flex items-center space-x-2 w-full">
          <svg className={`w-4 h-4 transition-transform ${showManualAdd ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Add single song manually</span>
        </button>
        
        {showManualAdd && (
          <form onSubmit={handleManualAdd} className="mt-3 space-y-2">
            <input type="text" value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="Song name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 px-3 py-2" />
            <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Artist name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 px-3 py-2" />
            <button type="submit" disabled={!songName.trim() || !artistName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              Add Song
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2 mt-4">
        {songs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No songs yet.</p>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <input type="checkbox" checked={song.active} onChange={() => handleToggle(song.id, song.active)}
                      className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500" />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${song.active ? 'text-gray-200' : 'text-gray-500'}`}>{song.song_name}</div>
                      <div className={`text-xs ${song.active ? 'text-gray-400' : 'text-gray-600'}`}>by {song.artist_name}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(song.id)} className="text-red-500 hover:text-red-400 text-sm transition-colors ml-2">Delete</button>
                </div>
              ))}
            </div>
            {songs.length > 3 && (
              <button onClick={handleClearAll} className="text-xs text-red-500/60 hover:text-red-400 transition-colors mt-2">
                Clear all {songs.length} songs
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SongManager
