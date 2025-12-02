import { useState } from 'react'
import axios from 'axios'

function VideoTable({ videos, keywords, filters, onFiltersChange, onVideoUpdate, onExport }) {
  const [selectedVideo, setSelectedVideo] = useState(null)

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

  const handleStatusChange = async (videoId, status) => {
    try {
      await axios.put(`/api/videos/${videoId}`, { status })
      onVideoUpdate()
    } catch (error) {
      alert('Failed to update video status')
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
        return 'bg-yellow-100 text-yellow-800'
      case 'Reviewed':
        return 'bg-green-100 text-green-800'
      case 'Flagged for Takedown':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Videos ({videos.length})
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Export CSV
            </button>
            <button
              onClick={() => onExport('excel')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <select
              value={filters.keyword}
              onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Flagged for Takedown">Flagged for Takedown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No videos found. Run a search to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-16 w-24 object-cover rounded"
                      />
                      <div className="ml-4 max-w-xs">
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 line-clamp-2"
                        >
                          {video.title}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {video.channel_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(() => {
                      const parsed = parseMatchedKeyword(video.matched_keyword)
                      if (parsed.type === 'song') {
                        return (
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Song:</span>
                              <span className="text-xs text-blue-600">{parsed.song}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Artist:</span>
                              <span className="text-xs text-gray-700">{parsed.artist}</span>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Keyword:</span>
                          <span className="text-xs text-gray-600">{parsed.value}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(video.publish_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <select
                      value={video.status}
                      onChange={(e) => handleStatusChange(video.id, e.target.value)}
                      className="text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Flagged for Takedown">Flag</option>
                    </select>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
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

export default VideoTable
