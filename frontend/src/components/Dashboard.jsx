import { useState, useEffect } from 'react'
import axios from 'axios'
import Stats from './Stats'
import SearchControl from './SearchControl'
import VideoTable from './VideoTable'
import ScheduleManager from './ScheduleManager'
import ArtistManager from './ArtistManager'

function Dashboard({ apiConfigured }) {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [songs, setSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    date_from: '',
    date_to: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadVideos()
  }, [filters])

  const loadData = async () => {
    try {
      const [statsRes, songsRes, videosRes, artistsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/songs'),
        axios.get('/api/videos'),
        axios.get('/api/artists')
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
      if (filters.keyword) params.append('keyword', filters.keyword)
      if (filters.status) params.append('status', filters.status)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)

      const response = await axios.get(`/api/videos?${params.toString()}`)
      setVideos(response.data)
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  const handleSearch = async (selectedSongs) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/search/songs', { 
        songs: selectedSongs
      })
      
      const totalFound = response.data.total_found
      const totalNew = response.data.total_new
      alert(`✅ Search complete!\n\nTotal videos found: ${totalFound}\nNew videos: ${totalNew}`)
      
      await loadData()
    } catch (error) {
      alert(`❌ Search failed:\n\n${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleArtistChange = async () => {
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
      alert(`Export failed: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-800/30">
        <h1 className="text-2xl font-bold text-white mb-2">
          🎵 YouTube Music Copyright Monitor
        </h1>
        <p className="text-gray-400">
          Import artists from Spotify → Search YouTube → Find unauthorized uploads
        </p>
      </div>

      <Stats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchControl
          songs={songs}
          onSearch={handleSearch}
          loading={loading}
          apiConfigured={apiConfigured}
        />
        
        <ScheduleManager apiConfigured={apiConfigured} />
      </div>
      
      <ArtistManager onArtistChange={handleArtistChange} />
      
      <VideoTable
        videos={videos}
        keywords={[]}
        filters={filters}
        onFiltersChange={setFilters}
        onVideoUpdate={handleVideoUpdate}
        onExport={handleExport}
      />
    </div>
  )
}

export default Dashboard
