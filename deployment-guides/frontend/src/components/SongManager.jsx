import { useState } from 'react'
import axios from 'axios'

function SongManager({ songs, onChange }) {
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [songName, setSongName] = useState('')
  const [artistName, setArtistName] = useState('')

  const handleSpotifyImport = async (e) => {
    e.preventDefault()
    if (!spotifyUrl.trim()) return

    setImporting(true)
    setImportProgress('Fetching artist from Spotify...')
    
    try {
      const response = await axios.post('/api/songs/import-from-spotify', { 
        spotify_url: spotifyUrl.trim(),
        auto_flag: false,
        priority: 'Medium'
      })
      
      setImportProgress(null)
      setSpotifyUrl('')
      
      const { artist, songs_added, total_songs, albums } = response.data
      
      alert(
        `✅ Successfully imported!\n\n` +
        `Artist: ${artist.name}\n` +
        `Songs added: ${songs_added}\n` +
        `Total songs: ${total_songs}\n` +
        `Albums: ${albums}\n` +
        `Followers: ${artist.followers?.toLocaleString() || 'N/A'}`
      )
      
      onChange()
    } catch (error) {
      setImportProgress(null)
      const errorMsg = error.response?.data?.error || 'Failed to import from Spotify'
      alert(`❌ Import failed:\n\n${errorMsg}`)
    } finally {
      setImporting(false)
    }
  }

  const handleManualAdd = async (e) => {
    e.preventDefault()
    if (!songName.trim() || !artistName.trim()) return

    try {
      await axios.post('/api/songs', { 
        song_name: songName.trim(),
        artist_name: artistName.trim()
      })
      setSongName('')
      setArtistName('')
      onChange()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add song')
    }
  }

  const handleToggle = async (songId, active) => {
    try {
      await axios.put(`/api/songs/${songId}`, { active: !active })
      onChange()
    } catch (error) {
      alert('Failed to update song')
    }
  }

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return

    try {
      await axios.delete(`/api/songs/${songId}`)
      onChange()
    } catch (error) {
      alert('Failed to delete song')
    }
  }

  const handleClearAll = async () => {
    const confirmMsg = `⚠️ DELETE ALL SONGS?\n\n` +
                      `This will delete all ${songs.length} song${songs.length !== 1 ? 's' : ''} from the database.\n\n` +
                      `This action CANNOT be undone!\n\n` +
                      `Are you sure you want to continue?`
    
    if (!confirm(confirmMsg)) return

    try {
      const response = await axios.delete('/api/songs/clear')
      onChange()
      alert(`✅ Successfully cleared ${response.data.count} song${response.data.count !== 1 ? 's' : ''}`)
    } catch (error) {
      alert(`❌ Failed to clear songs:\n\n${error.response?.data?.error || error.message}`)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl p-6 border border-gray-800">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          🎵 Add Artist from Spotify
        </h2>
        {songs.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {songs.length} song{songs.length !== 1 ? 's' : ''} in database
          </p>
        )}
      </div>

      {/* Spotify Import Form (Primary) */}
      <form onSubmit={handleSpotifyImport} className="mb-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paste Spotify Artist Link
            </label>
            <input
              type="text"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm text-white placeholder-gray-500 px-3 py-2"
              disabled={importing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get the link by clicking "Share" → "Copy link to artist" on Spotify
            </p>
          </div>
          
          {importProgress && (
            <div className="flex items-center space-x-2 text-sm text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg p-3">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{importProgress}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={importing || !spotifyUrl.trim()}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {importing ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Importing from Spotify...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Import All Songs from Spotify</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Manual Add Toggle */}
      <div className="border-t border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => setShowManualAdd(!showManualAdd)}
          className="text-sm text-gray-400 hover:text-gray-300 flex items-center space-x-2 w-full"
        >
          <svg className={`w-4 h-4 transition-transform ${showManualAdd ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Or add songs manually (one by one)</span>
        </button>
        
        {showManualAdd && (
          <form onSubmit={handleManualAdd} className="mt-3">
            <div className="space-y-2">
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Song name (e.g., Shake It Off)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500 px-3 py-2"
              />
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name (e.g., Taylor Swift)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500 px-3 py-2"
              />
              <button
                type="submit"
                disabled={!songName.trim() || !artistName.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Add Single Song
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {songs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No songs yet. Add your first song above.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={song.active}
                    onChange={() => handleToggle(song.id, song.active)}
                    className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${song.active ? 'text-gray-200' : 'text-gray-500'}`}>
                      {song.song_name}
                    </div>
                    <div className={`text-xs ${song.active ? 'text-gray-400' : 'text-gray-600'}`}>
                      by {song.artist_name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="text-red-500 hover:text-red-400 text-sm transition-colors ml-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SongManager
