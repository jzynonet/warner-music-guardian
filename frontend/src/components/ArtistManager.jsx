import { useState, useEffect } from 'react'
import axios from 'axios'
import SongSelectionModal from './SongSelectionModal'

function ArtistManager({ onArtistChange }) {
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showSpotifyImport, setShowSpotifyImport] = useState(false)
  const [loading, setLoading] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [showSongSelection, setShowSongSelection] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_person: '',
    notes: ''
  })

  useEffect(() => {
    loadArtists()
  }, [])

  const loadArtists = async () => {
    try {
      const response = await axios.get('/api/artists')
      setArtists(response.data)
    } catch (error) {
      console.error('Error loading artists:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (selectedArtist) {
        await axios.put(`/api/artists/${selectedArtist.id}`, formData)
      } else {
        await axios.post('/api/artists', formData)
      }
      
      setShowForm(false)
      setFormData({ name: '', email: '', contact_person: '', notes: '' })
      setSelectedArtist(null)
      await loadArtists()
      if (onArtistChange) onArtistChange()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save artist')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artist) => {
    setSelectedArtist(artist)
    setFormData({
      name: artist.name,
      email: artist.email || '',
      contact_person: artist.contact_person || '',
      notes: artist.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (artistId) => {
    if (!confirm('Delete this artist? This will not delete their videos/keywords.')) return

    try {
      await axios.delete(`/api/artists/${artistId}`)
      await loadArtists()
      if (onArtistChange) onArtistChange()
    } catch (error) {
      alert('Failed to delete artist')
    }
  }

  const handleToggleActive = async (artist) => {
    try {
      await axios.put(`/api/artists/${artist.id}`, { active: !artist.active })
      await loadArtists()
      if (onArtistChange) onArtistChange()
    } catch (error) {
      alert('Failed to update artist')
    }
  }

  const handleViewStats = async (artistId) => {
    try {
      const response = await axios.get(`/api/stats?artist_id=${artistId}`)
      const stats = response.data
      
      alert(`Artist Statistics:\n\nTotal Videos: ${stats.total_videos}\nPending: ${stats.pending}\nReviewed: ${stats.reviewed}\nFlagged: ${stats.flagged}\n\nCritical: ${stats.priority_critical}\nHigh: ${stats.priority_high}\nMedium: ${stats.priority_medium}\nLow: ${stats.priority_low}`)
    } catch (error) {
      alert('Failed to load stats')
    }
  }

  const handleSpotifyPreview = async (e) => {
    e.preventDefault()
    if (!spotifyUrl.trim()) return

    setImporting(true)
    setImportProgress('Fetching songs from Spotify...')
    
    try {
      const response = await axios.post('/api/songs/preview-from-spotify', { 
        spotify_url: spotifyUrl.trim()
      })
      
      setImportProgress(null)
      setPreviewData(response.data)
      setShowSongSelection(true)
      
    } catch (error) {
      setImportProgress(null)
      const errorMsg = error.response?.data?.error || 'Failed to fetch from Spotify'
      alert(`❌ Failed to fetch songs:\n\n${errorMsg}`)
    } finally {
      setImporting(false)
    }
  }

  const handleImportSelectedSongs = async (selectedSongs) => {
    try {
      const response = await axios.post('/api/songs/import-from-spotify', {
        artist_info: previewData.artist_info,
        selected_songs: selectedSongs,
        auto_flag: false,
        priority: 'Medium'
      })
      
      const { artist, songs_added, songs_skipped } = response.data
      
      setShowSongSelection(false)
      setShowSpotifyImport(false)
      setSpotifyUrl('')
      setPreviewData(null)
      
      alert(
        `✅ Successfully imported!\n\n` +
        `Artist: ${artist.name}\n` +
        `Songs added: ${songs_added}\n` +
        `Songs skipped: ${songs_skipped} (already in database)\n\n` +
        `Ready to search on YouTube!`
      )
      
      await loadArtists()
      if (onArtistChange) onArtistChange()
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to import songs'
      alert(`❌ Import failed:\n\n${errorMsg}`)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-neon-yellow/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-yellow/10 rounded-lg border border-neon-yellow/20 shadow-neon-yellow">
             <span className="text-xl">🎵</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Artist Management
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSpotifyImport(!showSpotifyImport)
              setShowForm(false)
              setSpotifyUrl('')
            }}
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>{showSpotifyImport ? 'Cancel Import' : 'Import from Spotify'}</span>
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setShowSpotifyImport(false)
              setSelectedArtist(null)
              setFormData({ name: '', email: '', contact_person: '', notes: '' })
            }}
            className="px-4 py-2 bg-white/5 text-slate-200 rounded-xl hover:bg-white/10 border border-white/10 transition-colors font-bold"
          >
            {showForm ? 'Cancel' : '+ Add Manually'}
          </button>
        </div>
      </div>

      <SongSelectionModal
        isOpen={showSongSelection}
        onClose={() => setShowSongSelection(false)}
        artistInfo={previewData?.artist_info}
        mainSongs={previewData?.main_songs || []}
        featuredSongs={previewData?.featured_songs || []}
        onImport={handleImportSelectedSongs}
      />

      {showSpotifyImport && (
        <form onSubmit={handleSpotifyPreview} className="mb-8 p-6 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm relative z-10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Import Artist from Spotify</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Paste Spotify Artist Link
              </label>
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
                className="w-full bg-black/30 border border-emerald-500/30 rounded-xl shadow-inner focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 px-4 py-3 backdrop-blur-sm"
                disabled={importing}
                required
              />
              <p className="text-xs text-emerald-500/70 mt-2 font-medium">
                💡 Open Spotify → Find artist → Click "..." → Share → Copy link to artist
              </p>
            </div>

            {importProgress && (
              <div className="flex items-center space-x-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">{importProgress}</span>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-emerald-400/90">
                This will automatically create the artist entry and import all their songs from Spotify
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={importing || !spotifyUrl.trim()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import Artist & Songs</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSpotifyImport(false)}
                disabled={importing}
                className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 font-bold border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 glass-panel rounded-xl border border-white/10 relative z-10">
          <h3 className="text-lg font-bold text-white mb-6">
            {selectedArtist ? 'Edit Artist' : 'Add New Artist'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Artist Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-indigo-500/30"
            >
              {loading ? 'Saving...' : (selectedArtist ? 'Update Artist' : 'Add Artist')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setSelectedArtist(null)
                setFormData({ name: '', email: '', contact_person: '', notes: '' })
              }}
              className="px-6 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors font-bold border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 relative z-10">
        {artists.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
             <div className="text-4xl mb-3 opacity-20 grayscale">🎵</div>
            <p className="text-slate-400 font-medium">
              No artists yet. Add your first artist above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {artists.map((artist) => (
                  <tr key={artist.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-lg mr-3">
                          🎵
                        </div>
                        <div className="text-sm font-bold text-white">{artist.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide ${
                        artist.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {artist.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      <div>{artist.contact_person || '-'}</div>
                      <div className="text-xs opacity-60">{artist.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {new Date(artist.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewStats(artist.id)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Stats"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleEdit(artist)}
                          className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(artist)}
                          className={`p-1.5 rounded-lg transition-colors ${artist.active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={artist.active ? 'Deactivate' : 'Activate'}
                        >
                          {artist.active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistManager
