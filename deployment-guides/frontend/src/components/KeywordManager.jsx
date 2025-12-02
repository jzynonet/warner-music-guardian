import { useState } from 'react'
import axios from 'axios'

function KeywordManager({ keywords, onChange }) {
  const [newKeyword, setNewKeyword] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newKeyword.trim()) return

    setAdding(true)
    try {
      await axios.post('/api/keywords', { keyword: newKeyword.trim() })
      setNewKeyword('')
      onChange()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add keyword')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (keywordId, active) => {
    try {
      await axios.put(`/api/keywords/${keywordId}`, { active: !active })
      onChange()
    } catch (error) {
      alert('Failed to update keyword')
    }
  }

  const handleDelete = async (keywordId) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return

    try {
      await axios.delete(`/api/keywords/${keywordId}`)
      onChange()
    } catch (error) {
      alert('Failed to delete keyword')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL keywords? This action cannot be undone.')) return

    try {
      await axios.delete('/api/keywords/clear')
      onChange()
      alert('All keywords have been cleared')
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to clear keywords')
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Keyword Management
        </h2>
        {keywords.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add new keyword..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500 px-3 py-2"
          />
          <button
            type="submit"
            disabled={adding || !newKeyword.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {keywords.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No keywords yet. Add your first keyword above.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={keyword.active}
                    onChange={() => handleToggle(keyword.id, keyword.active)}
                    className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${keyword.active ? 'text-gray-200' : 'text-gray-500'}`}>
                    {keyword.keyword}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(keyword.id)}
                  className="text-red-500 hover:text-red-400 text-sm transition-colors"
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

export default KeywordManager
