import { useState, useEffect } from 'react'
import axios from 'axios'
import Stats from './Stats'
import SearchControl from './SearchControl'
import VideoTableEnhanced from './VideoTableEnhanced'
import ScheduleManager from './ScheduleManager'
import ArtistManager from './ArtistManager'
import BulkImport from './BulkImport'
import AutoFlagRules from './AutoFlagRules'
import AutoUpdateManager from './AutoUpdateManager'
import Navigation from './Navigation'
import VideoDetailsModal from './VideoDetailsModal'
import Toast from './Toast'
import ConfirmDialog from './ConfirmDialog'
import { useNotification } from '../hooks/useNotification'

function DashboardEnhanced({ apiConfigured }) {
  const { notification, confirmDialog, showSuccess, showError, hideNotification, showConfirm } = useNotification()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [songs, setSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [activeStatFilter, setActiveStatFilter] = useState(null) // 'pending', 'reviewed', 'flagged' or null
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    priority: '',
    artist_id: '',
    auto_flagged: undefined,
    date_from: '',
    date_to: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadVideos()
  }, [filters, activeStatFilter]) // Reload when filters or stat filter changes

  const loadData = async () => {
    try {
      const [statsRes, songsRes, videosRes, artistsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/songs'),
        axios.get('/api/videos'),
        axios.get('/api/artists').catch(() => ({ data: [] }))
      ])
      
      setStats(statsRes.data)
      setSongs(songsRes.data)
      setVideos(videosRes.data)
      setArtists(artistsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadVideos = async () => {
    try {
      const params = new URLSearchParams()
      
      // Handle manual filters
      if (filters.keyword) params.append('keyword', filters.keyword)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.artist_id) params.append('artist_id', filters.artist_id)
      if (filters.auto_flagged !== undefined) params.append('auto_flagged', filters.auto_flagged)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)

      // Handle Status Filter (Stat Cards take precedence or merge? Let's make them override status filter)
      if (activeStatFilter) {
        // Map stat card IDs to API status values if needed
        let statusValue = ''
        if (activeStatFilter === 'pending') statusValue = 'Pending'
        if (activeStatFilter === 'reviewed') statusValue = 'Reviewed'
        if (activeStatFilter === 'flagged') statusValue = 'Flagged for Takedown'
        
        if (statusValue) params.append('status', statusValue)
      } else if (filters.status) {
        params.append('status', filters.status)
      }

      const response = await axios.get(`/api/videos?${params.toString()}`)
      setVideos(response.data)
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  const handleStatClick = (filterId) => {
    // If clicking 'all' or the same filter again, clear it
    if (!filterId || filterId === 'all' || filterId === activeStatFilter) {
      setActiveStatFilter(null)
    } else {
      setActiveStatFilter(filterId)
    }
  }

  const handleSearch = async (selectedSongs) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/search/songs', { 
        songs: selectedSongs
      })
      
      const result = response.data
      let message = `✅ Search complete!\n\n`
      message += `Total found: ${result.total_found}\n`
      message += `New videos: ${result.total_new}\n\n`
      
      if (result.songs) {
        result.songs.forEach(s => {
          if (s.error) {
            message += `❌ ${s.song_name} - ${s.artist_name}: ${s.error}\n`
          } else {
            message += `✓ ${s.song_name} - ${s.artist_name}: ${s.found} found, ${s.new} new\n`
          }
        })
      }
      
      showSuccess(message)
      await loadData()
      setLoading(false)
    } catch (error) {
      showError(`Search failed: ${error.response?.data?.error || error.message}`)
      setLoading(false)
    }
  }

  const handleArtistChange = async () => {
    await loadData()
  }

  const handleRulesChange = async () => {
    // Reload data when rules change
    await loadData()
  }

  const handleVideoUpdate = async () => {
    await loadData()
  }

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams()
      if (filters.keyword) params.append('keyword', filters.keyword)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.artist_id) params.append('artist_id', filters.artist_id)

      const response = await axios.get(`/api/export/${format}?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ugc_videos_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      showError(`Export failed: ${error.message}`)
    }
  }

  const handleClearAllSongs = async () => {
    const confirmMsg = `⚠️ DELETE ALL SONGS?\n\n` +
                      `This will delete all ${songs.length} song${songs.length !== 1 ? 's' : ''} from the database.\n\n` +
                      `Videos already found will remain.\n` +
                      `This action CANNOT be undone!\n\n` +
                      `Are you sure you want to continue?`
    
    if (!await showConfirm(confirmMsg, 'danger')) return

    try {
      const response = await axios.delete('/api/songs/clear')
      
      showSuccess(`Successfully cleared ${response.data.count} song${response.data.count !== 1 ? 's' : ''}`)
      await loadData()
    } catch (error) {
      showError(`Failed to clear songs:\n\n${error.response?.data?.error || error.message}`)
    }
  }

  const handleClearAll = async () => {
    const confirmed = await showConfirm(
      `⚠️ WARNING: This will delete ALL ${stats?.total_videos || 0} videos from the database!\n\n` +
      'Your keywords, artists, and auto-flag rules will be kept.\n\n' +
      'This action cannot be undone.\n\n' +
      'Are you sure you want to continue?',
      'danger'
    )

    if (!confirmed) return

    // Second confirmation for safety
    const doubleCheck = await showConfirm(
      '🛑 FINAL CONFIRMATION\n\n' +
      'This is your last chance to cancel.\n\n' +
      'Click OK to permanently delete all videos.',
      'danger'
    )

    if (!doubleCheck) return

    setLoading(true)
    try {
      const response = await axios.post('/api/videos/clear-all')
      
      showSuccess(
        `Success!\n\n` +
        `${response.data.deleted} videos deleted.\n\n` +
        'Database cleared. Ready for fresh searches!'
      )
      
      await loadData()
      setLoading(false)
    } catch (error) {
      showError(`Clear failed: ${error.response?.data?.error || error.message}`)
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            
            {/* Stats displayed at the very top, independent of other content */}
            <Stats 
              stats={stats} 
              onFilterClick={handleStatClick}
              activeFilter={activeStatFilter}
            />

            <div>
              <div className="flex items-center justify-between mb-6 pl-1">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Search & Schedule
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage your search operations and automation
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {songs.length > 0 && (
                    <button
                      onClick={handleClearAllSongs}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-sm font-medium rounded-xl border border-amber-500/20 hover:border-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear Songs</span>
                    </button>
                  )}
                  {stats?.total_videos > 0 && (
                    <button
                      onClick={handleClearAll}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 text-sm font-medium rounded-xl border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-neon-orange"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear Database</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SearchControl
                  songs={songs}
                  onSearch={handleSearch}
                  loading={loading}
                  apiConfigured={apiConfigured}
                />
                
                <ScheduleManager apiConfigured={apiConfigured} />
              </div>
            </div>
            
            
            <div className="glass-panel p-6 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Artist Management</h3>
                    <p className="text-sm text-slate-400">
                      {artists.length} active artist{artists.length !== 1 ? 's' : ''} monitored
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('artists')}
                  className="px-4 py-2 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium border border-white/10"
                >
                  Manage Artists →
                </button>
              </div>
            </div>
            
            <VideoTableEnhanced
              videos={videos}
              keywords={[]}
              artists={artists}
              filters={filters}
              onFiltersChange={setFilters}
              onVideoUpdate={handleVideoUpdate}
              onExport={handleExport}
              onClearResults={handleClearAll}
              onViewVideo={setSelectedVideo}
            />
          </div>
        )
      
      case 'artists':
        return (
          <ArtistManager onArtistChange={handleArtistChange} />
        )
      
      case 'auto-update':
        return (
          <AutoUpdateManager apiConfigured={apiConfigured} />
        )
      
      case 'bulk-import':
        return (
          <BulkImport onImportComplete={handleArtistChange} />
        )
      
      case 'auto-flag':
        return (
          <AutoFlagRules onRulesChange={handleRulesChange} />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      
      {selectedVideo && (
        <VideoDetailsModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onUpdate={handleVideoUpdate}
        />
      )}
      
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}
    </div>
  )
}

export default DashboardEnhanced
