import { useState, useEffect } from 'react'
import axios from 'axios'

function VideoTableEnhanced({ videos, keywords, artists, filters, onFiltersChange, onVideoUpdate, onExport, onClearResults, onViewVideo }) {
  const [selectedVideos, setSelectedVideos] = useState([])
  const [showBatchMenu, setShowBatchMenu] = useState(false)

  // Parse matched_keyword to determine if it's a song-artist format or just a keyword
  const parseMatchedKeyword = (matchedKeyword) => {
    if (!matchedKeyword) return { type: 'keyword', value: '' }
    
    // Check if it contains " - " which indicates song-artist format
    if (matchedKeyword.includes(' - ')) {
      const parts = matchedKeyword.split(' - ')
      if (parts.length === 2) {
        return {
          type: 'song',
          song: parts[0].trim(),
          artist: parts[1].trim()
        }
      }
    }
    
    // Otherwise it's a regular keyword
    return {
      type: 'keyword',
      value: matchedKeyword
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVideos(videos.map(v => v.id))
    } else {
      setSelectedVideos([])
    }
  }

  const handleSelectVideo = (videoId) => {
    if (selectedVideos.includes(videoId)) {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId))
    } else {
      setSelectedVideos([...selectedVideos, videoId])
    }
  }

  const handleBatchAction = async (action, value) => {
    if (selectedVideos.length === 0) {
      alert('No videos selected')
      return
    }

    if (!confirm(`Apply this action to ${selectedVideos.length} videos?`)) {
      return
    }

    try {
      const payload = { video_ids: selectedVideos }
      if (action === 'status') payload.status = value
      if (action === 'priority') payload.priority = value

      await axios.post('/api/videos/batch-update', payload)
      
      setSelectedVideos([])
      setShowBatchMenu(false)
      onVideoUpdate()
      alert(`${selectedVideos.length} videos updated successfully`)
    } catch (error) {
      alert('Batch update failed: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedVideos.length === 0) {
      alert('No videos selected')
      return
    }

    if (!confirm(`DELETE ${selectedVideos.length} videos? This cannot be undone!`)) {
      return
    }

    try {
      await axios.post('/api/videos/batch-delete', { video_ids: selectedVideos })
      
      setSelectedVideos([])
      onVideoUpdate()
      alert(`${selectedVideos.length} videos deleted`)
    } catch (error) {
      alert('Batch delete failed')
    }
  }

  const handleStatusChange = async (videoId, status) => {
    try {
      await axios.put(`/api/videos/${videoId}`, { status })
      onVideoUpdate()
    } catch (error) {
      alert('Failed to update video status')
    }
  }

  const handlePriorityChange = async (videoId, priority) => {
    try {
      await axios.put(`/api/videos/${videoId}`, { priority })
      onVideoUpdate()
    } catch (error) {
      alert('Failed to update video priority')
    }
  }

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await axios.delete(`/api/videos/${videoId}`)
      onVideoUpdate()
    } catch (error) {
      alert('Failed to delete video')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-900/20'
      case 'Reviewed':
        return 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-sm shadow-neon-green/20'
      case 'Flagged for Takedown':
        return 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-900/20'
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'Medium':
        return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30'
      case 'Low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700'
    }
  }

  return (
    <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Videos <span className="text-slate-400 font-normal ml-2 text-base">({videos.length})</span>
            </h2>
            {selectedVideos.length > 0 && (
              <p className="text-sm text-neon-blue mt-1 font-medium animate-pulse">
                {selectedVideos.length} selected
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {selectedVideos.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBatchMenu(!showBatchMenu)}
                  className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-sm font-bold rounded-xl hover:bg-neon-blue/30 transition-all shadow-neon-blue"
                >
                  Batch Actions ({selectedVideos.length})
                </button>
                
                {showBatchMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-xl z-50 overflow-hidden border border-white/10">
                    <div className="p-2 backdrop-blur-xl bg-slate-900/90">
                      <div className="mb-2">
                        <p className="text-xs font-bold text-slate-400 mb-2 px-2 uppercase tracking-wider">Update Status</p>
                        <div className="space-y-1">
                          <button onClick={() => handleBatchAction('status', 'Reviewed')} className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all font-medium">
                            Mark as Reviewed
                          </button>
                          <button onClick={() => handleBatchAction('status', 'Flagged for Takedown')} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-medium">
                            Flag for Takedown
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2 border-t border-white/10 pt-2">
                        <p className="text-xs font-bold text-slate-400 mb-2 px-2 uppercase tracking-wider">Update Priority</p>
                        <div className="space-y-1">
                          <button onClick={() => handleBatchAction('priority', 'Critical')} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                            🔴 Critical
                          </button>
                          <button onClick={() => handleBatchAction('priority', 'High')} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all">
                            🟠 High
                          </button>
                          <button onClick={() => handleBatchAction('priority', 'Medium')} className="w-full text-left px-3 py-2 text-sm text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-all">
                            🔵 Medium
                          </button>
                          <button onClick={() => handleBatchAction('priority', 'Low')} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-white/5 rounded-lg transition-all">
                            ⚪ Low
                          </button>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-2">
                        <button onClick={handleBatchDelete} className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 rounded-lg text-red-400 font-medium transition-colors">
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => onExport('csv')}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:text-white"
            >
              Export CSV
            </button>
            <button
              onClick={() => onExport('excel')}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:text-white"
            >
              Export Excel
            </button>
            {videos.length > 0 && onClearResults && (
              <button
                onClick={onClearResults}
                className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all shadow-neon-orange"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Artist
            </label>
            <select
              value={filters.artist_id || ''}
              onChange={(e) => onFiltersChange({ ...filters, artist_id: e.target.value })}
              className="block w-full bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 backdrop-blur-sm"
            >
              <option value="">All artists</option>
              {artists && artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Keyword
            </label>
            <select
              value={filters.keyword}
              onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
              className="block w-full bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 backdrop-blur-sm"
            >
              <option value="">All keywords</option>
              {keywords.map((k) => (
                <option key={k.id} value={k.keyword}>
                  {k.keyword}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="block w-full bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 backdrop-blur-sm"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Flagged for Takedown">Flagged for Takedown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
              className="block w-full bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 backdrop-blur-sm"
            >
              <option value="">All priorities</option>
              <option value="Critical">🔴 Critical</option>
              <option value="High">🟠 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Auto-Flagged
            </label>
            <select
              value={filters.auto_flagged !== undefined ? filters.auto_flagged : ''}
              onChange={(e) => onFiltersChange({ ...filters, auto_flagged: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
              className="block w-full bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 backdrop-blur-sm"
            >
              <option value="">All videos</option>
              <option value="true">Auto-flagged only</option>
              <option value="false">Manual only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {videos.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="mb-4 text-4xl opacity-20">🔍</div>
            <p className="text-lg font-medium">No videos found</p>
            <p className="text-sm opacity-60 mt-1">Adjust filters or run a search to get started.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left w-4">
                  <input
                    type="checkbox"
                    checked={selectedVideos.length === videos.length && videos.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Match Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {videos.map((video) => (
                <tr key={video.id} className={`group hover:bg-white/5 transition-all duration-200 ${video.priority === 'Critical' ? 'bg-red-500/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                      className="rounded border-slate-600 bg-slate-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="relative group-hover:scale-105 transition-transform duration-300 shrink-0">
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="h-16 w-28 object-cover rounded-lg shadow-lg border border-white/10 relative z-10"
                          />
                      </div>
                      <div className="max-w-xs">
                        <button
                          onClick={() => onViewVideo && onViewVideo(video)}
                          className="text-sm font-bold text-slate-200 hover:text-white hover:underline text-left line-clamp-2 transition-colors mb-1.5"
                        >
                          {video.title}
                        </button>
                        <div className="flex flex-wrap gap-2">
                          {video.auto_flagged && (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-neon-yellow/10 text-neon-yellow rounded border border-neon-yellow/20 shadow-neon-yellow"
                              title={video.ai_reason || 'Automatically detected by AI'}
                            >
                              🤖 AI Flagged
                              {video.ai_risk_score > 0 && (
                                <span className="opacity-75 ml-1 border-l border-neon-yellow/30 pl-1">
                                  {video.ai_risk_score}
                                </span>
                              )}
                            </span>
                          )}
                          {video.ai_risk_level && video.ai_risk_level !== 'low' && !video.auto_flagged && (
                            <span 
                              className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                video.ai_risk_level === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                video.ai_risk_level === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                              title={video.ai_reason || `AI Risk: ${video.ai_risk_level}`}
                            >
                              ⚠️ Risk: {video.ai_risk_level} ({video.ai_risk_score})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                    {video.channel_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(() => {
                      const parsed = parseMatchedKeyword(video.matched_keyword)
                      if (parsed.type === 'song') {
                        return (
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Song</span>
                              <span className="text-xs font-bold text-white">{parsed.song}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Artist</span>
                              <span className="text-xs text-slate-400">{parsed.artist}</span>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keyword</span>
                          <span className="text-xs font-bold text-white">{parsed.value}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={video.priority || 'Medium'}
                      onChange={(e) => handlePriorityChange(video.id, e.target.value)}
                      className={`text-xs font-bold rounded-lg border border-transparent focus:ring-2 focus:ring-neon-blue/50 px-2.5 py-1.5 transition-all ${getPriorityColor(video.priority)}`}
                    >
                      <option value="Critical">🔴 Critical</option>
                      <option value="High">🟠 High</option>
                      <option value="Medium">🔵 Medium</option>
                      <option value="Low">⚪ Low</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1.5 inline-flex text-xs font-bold rounded-lg border ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs space-x-3">
                    <button
                      onClick={() => onViewVideo && onViewVideo(video)}
                      className="text-slate-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wider border border-white/10 px-2 py-1.5 rounded-lg hover:bg-white/5"
                    >
                      View
                    </button>
                    <select
                      value={video.status}
                      onChange={(e) => handleStatusChange(video.id, e.target.value)}
                      className="text-xs bg-slate-900/80 border border-white/10 text-slate-300 rounded-lg focus:ring-2 focus:ring-neon-blue/50 px-2 py-1.5"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Flagged for Takedown">Flag</option>
                    </select>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-slate-500 hover:text-red-400 text-xs font-bold transition-colors uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default VideoTableEnhanced
