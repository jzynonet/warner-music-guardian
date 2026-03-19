import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import SongSelectionModal from './SongSelectionModal'

function ArtistManager({ onArtistChange }) {
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [loading, setLoading] = useState(false)
  const [artistNameSearch, setArtistNameSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [showSongSelection, setShowSongSelection] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [importMode, setImportMode] = useState('search') // 'search', 'paste', 'csv'
  const [pasteText, setPasteText] = useState('')
  const [pasteArtistName, setPasteArtistName] = useState('')
  const [csvArtistName, setCsvArtistName] = useState('')
  const csvFileRef = useRef(null)
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

  const handleImportPreview = async (e) => {
    e.preventDefault()
    
    if (importMode === 'paste') return handlePasteImport()
    if (importMode === 'csv') return handleCsvImport()

    if (!artistNameSearch.trim()) return

    setImporting(true)
    setImportProgress('Searching for songs...')
    
    try {
      // Just search by name — backend handles source fallback automatically
      const response = await axios.post('/api/songs/search-artist', { 
        artist_name: artistNameSearch.trim()
      })
      
      setImportProgress(null)
      setPreviewData(response.data)
      setShowSongSelection(true)
    } catch (error) {
      setImportProgress(null)
      const errorMsg = error.response?.data?.error || 'Could not find songs for this artist'
      alert(`Could not find songs.\n\n${errorMsg}\n\nTry checking the spelling or use "Paste Songs" to add them manually.`)
    } finally {
      setImporting(false)
    }
  }

  const handlePasteImport = async () => {
    if (!pasteText.trim() || !pasteArtistName.trim()) return

    setImporting(true)
    setImportProgress('Parsing songs...')

    try {
      const response = await axios.post('/api/songs/parse-text', {
        text: pasteText.trim(),
        artist_name: pasteArtistName.trim()
      })
      setImportProgress(null)
      setPreviewData(response.data)
      setShowSongSelection(true)
    } catch (error) {
      setImportProgress(null)
      alert(error.response?.data?.error || 'Could not parse songs from the text.')
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

      const response = await axios.post('/api/songs/parse-csv-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportProgress(null)
      setPreviewData(response.data)
      setShowSongSelection(true)
    } catch (error) {
      setImportProgress(null)
      alert(error.response?.data?.error || 'Could not parse the CSV file.')
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
      setShowImport(false)
      setArtistNameSearch('')
      setPasteText('')
      setPasteArtistName('')
      setCsvArtistName('')
      setPreviewData(null)
      
      alert(
        `Imported ${songs_added} songs for ${artist.name}` +
        (songs_skipped > 0 ? `\n(${songs_skipped} already in database)` : '')
      )
      
      await loadArtists()
      if (onArtistChange) onArtistChange()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to import songs')
    }
  }

  const resetImport = () => {
    setShowImport(false)
    setArtistNameSearch('')
    setPasteText('')
    setPasteArtistName('')
    setCsvArtistName('')
    setImportMode('search')
  }

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-semibold text-white">
          Artist Management
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => { showImport ? resetImport() : (setShowImport(true), setShowForm(false)) }}
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showImport ? 'Cancel Import' : 'Import Artist & Songs'}</span>
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setShowImport(false)
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
        source={previewData?.source}
      />

      {showImport && (
        <form onSubmit={handleImportPreview} className="mb-8 p-6 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm relative z-10">
          {/* Clean tab bar — no badges, no explanations */}
          <div className="flex gap-1 mb-5 bg-black/20 p-1 rounded-xl">
            {[
              { id: 'search', label: 'Search Artist' },
              { id: 'paste', label: 'Paste Songs' },
              { id: 'csv', label: 'CSV Upload' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setImportMode(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  importMode === tab.id
                    ? 'bg-emerald-600/30 text-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            {/* Search mode — single field */}
            {importMode === 'search' && (
              <input
                type="text"
                value={artistNameSearch}
                onChange={(e) => setArtistNameSearch(e.target.value)}
                placeholder="Type artist name, e.g. Drake, Beyoncé, Taylor Swift..."
                className="w-full bg-black/30 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 px-4 py-3.5 backdrop-blur-sm text-lg"
                disabled={importing}
                required={importMode === 'search'}
                autoFocus
              />
            )}

            {/* Paste mode */}
            {importMode === 'paste' && (
              <>
                <input
                  type="text"
                  value={pasteArtistName}
                  onChange={(e) => setPasteArtistName(e.target.value)}
                  placeholder="Artist name"
                  className="w-full bg-black/30 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 px-4 py-3 backdrop-blur-sm"
                  disabled={importing}
                  required={importMode === 'paste'}
                  autoFocus
                />
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"Paste song list here — one song per line:\n\nShake It Off\nBlank Space\nLove Story\nAnti-Hero"}
                  className="w-full bg-black/30 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 px-4 py-3 backdrop-blur-sm min-h-[140px] font-mono text-sm"
                  disabled={importing}
                  required={importMode === 'paste'}
                />
              </>
            )}

            {/* CSV mode */}
            {importMode === 'csv' && (
              <>
                <input
                  type="text"
                  value={csvArtistName}
                  onChange={(e) => setCsvArtistName(e.target.value)}
                  placeholder="Artist name (optional if included in CSV)"
                  className="w-full bg-black/30 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 px-4 py-3 backdrop-blur-sm"
                  disabled={importing}
                />
                <input
                  ref={csvFileRef}
                  type="file"
                  accept=".csv"
                  className="w-full bg-black/30 border border-emerald-500/30 rounded-xl text-white px-4 py-3 backdrop-blur-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-600/30 file:text-emerald-300 hover:file:bg-emerald-600/40 file:cursor-pointer"
                  disabled={importing}
                  required={importMode === 'csv'}
                />
              </>
            )}

            {importProgress && (
              <div className="flex items-center space-x-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
                <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">{importProgress}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={importing || (
                  importMode === 'search' ? !artistNameSearch.trim() :
                  importMode === 'paste' ? (!pasteText.trim() || !pasteArtistName.trim()) :
                  !csvFileRef.current?.files?.[0]
                )}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {importing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>
                    {importMode === 'search' ? 'Find Songs' :
                     importMode === 'paste' ? 'Preview Songs' :
                     'Upload & Preview'}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={resetImport}
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
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Artist Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Contact Person</label>
              <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Notes</label>
              <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 text-white px-4 py-3" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-indigo-500/30">
              {loading ? 'Saving...' : (selectedArtist ? 'Update Artist' : 'Add Artist')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setSelectedArtist(null); setFormData({ name: '', email: '', contact_person: '', notes: '' }) }}
              className="px-6 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors font-bold border border-white/10">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 relative z-10">
        {artists.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <p className="text-slate-500 text-sm">No artists yet. Import or add your first artist above.</p>
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
                      <div className="text-sm font-medium text-white">{artist.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide ${
                        artist.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>{artist.active ? 'Active' : 'Inactive'}</span>
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
                        <button onClick={() => handleViewStats(artist.id)} className="text-xs text-slate-500 hover:text-blue-400 transition-colors" title="View Stats">Stats</button>
                        <button onClick={() => handleEdit(artist)} className="text-xs text-slate-500 hover:text-white transition-colors" title="Edit">Edit</button>
                        <button onClick={() => handleToggleActive(artist)}
                          className={`text-xs transition-colors ${artist.active ? 'text-slate-500 hover:text-amber-400' : 'text-slate-500 hover:text-emerald-400'}`}
                          title={artist.active ? 'Deactivate' : 'Activate'}>{artist.active ? 'Pause' : 'Activate'}</button>
                        <button onClick={() => handleDelete(artist.id)} className="text-xs text-slate-500 hover:text-red-400 transition-colors" title="Delete">Delete</button>
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
