import { useEffect, useState } from 'react'
import axios from 'axios'

function VideoDetailsModal({ video, onClose, onUpdate }) {
  const [status, setStatus] = useState(video?.status || '')
  const [priority, setPriority] = useState(video?.priority || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (video) {
      setStatus(video.status)
      setPriority(video.priority)
    }
  }, [video])

  if (!video) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.put(`/api/videos/${video.id}`, { status, priority })
      onUpdate && onUpdate()
      onClose()
    } catch (error) {
      alert('Failed to update video')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video?')) return
    setLoading(true)
    try {
      await axios.delete(`/api/videos/${video.id}`)
      onUpdate && onUpdate()
      onClose()
    } catch (error) {
      alert('Failed to delete video')
    } finally {
      setLoading(false)
    }
  }

  // Extract YouTube ID if possible, though we might just use the embed URL if available
  const getEmbedUrl = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const id = (match && match[2].length === 11) ? match[2] : null
    return id ? `https://www.youtube.com/embed/${id}` : url
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white truncate pr-4">
            {video.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 h-full">
            
            {/* Video Player Section */}
            <div className="lg:col-span-2 bg-black flex items-center justify-center min-h-[300px] lg:h-full">
              <iframe
                src={getEmbedUrl(video.video_url)}
                title={video.title}
                className="w-full h-full aspect-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Details Sidebar */}
            <div className="p-6 space-y-6 bg-white/[0.01]">
              
              {/* Channel Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Channel</h4>
                <div className="text-white font-medium">{video.channel_name}</div>
                <div className="text-xs text-slate-500 mt-1">ID: {video.video_id}</div>
              </div>

              {/* Match Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Match Source</h4>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-sm text-white font-medium break-all">
                    {video.matched_keyword}
                  </div>
                </div>
              </div>

              {/* AI Risk */}
              {video.ai_risk_level && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Risk Assessment</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                        video.ai_risk_level === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        video.ai_risk_level === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {video.ai_risk_level}
                    </span>
                    <span className="text-xs text-slate-400">Score: {video.ai_risk_score}</span>
                  </div>
                  {video.ai_reason && (
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                      "{video.ai_reason}"
                    </p>
                  )}
                </div>
              )}

              <hr className="border-white/5" />

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-white/30 focus:ring-0"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Flagged for Takedown">Flagged for Takedown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          priority === p 
                            ? 'bg-white/10 border-white text-white' 
                            : 'bg-transparent border-white/5 text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Delete Video
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-xs font-bold text-black bg-white hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default VideoDetailsModal
