import { useState, useEffect } from 'react'
import axios from 'axios'

function AutoFlagRules({ onRulesChange }) {
  const [rules, setRules] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    action: 'flag',
    title_contains: '',
    channel_contains: '',
    keyword_match: ''
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const response = await axios.get('/api/auto-flag-rules')
      console.log('Loaded rules:', response.data)
      setRules(response.data)
    } catch (error) {
      console.error('Error loading rules:', error)
      if (error.response?.status === 404) {
        console.log('Auto-flag rules endpoint not found - backend may need restart')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const conditions = {}
      if (formData.title_contains) conditions.title_contains = formData.title_contains
      if (formData.channel_contains) conditions.channel_name_contains = formData.channel_contains
      if (formData.keyword_match) conditions.keyword_exact_match = formData.keyword_match

      if (Object.keys(conditions).length === 0) {
        alert('Please add at least one condition')
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        conditions: conditions,
        action: formData.action
      }

      console.log('Creating rule with payload:', payload)
      const response = await axios.post('/api/auto-flag-rules', payload)
      console.log('Rule created:', response.data)

      alert(`✅ Rule "${formData.name}" created successfully!`)

      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        action: 'flag',
        title_contains: '',
        channel_contains: '',
        keyword_match: ''
      })
      await loadRules()
      if (onRulesChange) onRulesChange()
    } catch (error) {
      console.error('Error creating rule:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create rule'
      alert(`❌ Error: ${errorMsg}\n\nCheck console for details. Backend may need restart.`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (rule) => {
    try {
      console.log(`Toggling rule ${rule.id} to ${!rule.active}`)
      await axios.put(`/api/auto-flag-rules/${rule.id}`, {
        active: !rule.active
      })
      await loadRules()
      if (onRulesChange) onRulesChange()
      alert(`✅ Rule ${rule.active ? 'disabled' : 'enabled'}`)
    } catch (error) {
      console.error('Error toggling rule:', error)
      alert(`❌ Failed to update rule: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleDelete = async (ruleId) => {
    if (!confirm('Delete this auto-flag rule?')) return

    try {
      console.log(`Deleting rule ${ruleId}`)
      await axios.delete(`/api/auto-flag-rules/${ruleId}`)
      await loadRules()
      if (onRulesChange) onRulesChange()
      alert('✅ Rule deleted successfully')
    } catch (error) {
      console.error('Error deleting rule:', error)
      alert(`❌ Failed to delete rule: ${error.response?.data?.error || error.message}`)
    }
  }

  const getActionBadge = (action) => {
    const badges = {
      'flag': { bg: 'bg-red-900', text: 'text-red-300', border: 'border-red-700', label: '🚩 Auto-Flag' },
      'high_priority': { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700', label: '🟠 High Priority' },
      'critical': { bg: 'bg-red-900', text: 'text-red-300', border: 'border-red-700', label: '🔴 Critical + Flag' }
    }
    const badge = badges[action] || badges['flag']
    return (
      <span className={`px-2 py-1 text-xs rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="glass-panel rounded-xl shadow-2xl p-6 border border-white/5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Auto-Flag Rules
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Create custom rules to flag videos with specific patterns
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Custom Rule'}
        </button>
      </div>

      {/* AI Auto-Detection Banner */}
      <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              AI Smart Detection: Always Active
            </h3>
            <p className="text-sm text-blue-300 mb-3">
              Every video found in searches is automatically analyzed by AI to detect unauthorized use of your music. No setup required!
            </p>
            <div className="bg-black/30 border border-white/5 rounded-lg p-3">
              <p className="text-sm font-semibold text-white mb-2">Automatically Detects:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>✓ Full album uploads</div>
                <div>✓ Download links (MP3/FLAC)</div>
                <div>✓ Bootleg recordings</div>
                <div>✓ Pirate channels</div>
                <div>✓ Leaked/unreleased content</div>
                <div>✓ High quality rips (320kbps)</div>
                <div>✓ Suspicious channel patterns</div>
                <div>✓ Unofficial music archives</div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-sm font-semibold text-white mb-1">Automatically Excludes:</p>
                <p className="text-xs text-slate-400">
                  VEVO channels, official artist channels, and legitimate record labels
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-2">Custom Rules (Optional)</h3>
        <p className="text-sm text-slate-400 mb-3">
          AI smart detection is always active. You can optionally add custom rules for specific patterns you want to catch.
        </p>
        
        <div className="bg-black/20 border border-white/5 rounded p-3 mb-3">
          <p className="text-sm font-semibold text-white mb-2">How It Works:</p>
          <ol className="text-sm text-slate-400 space-y-2">
            <li><strong className="text-white">1. AI Analyzes Every Video</strong> - Automatically checks all search results</li>
            <li><strong className="text-white">2. Custom Rules Applied</strong> - Your optional rules are checked next</li>
            <li><strong className="text-white">3. Highest Priority Wins</strong> - If AI says "High" and rule says "Critical", video gets "Critical"</li>
          </ol>
        </div>
        
        <div className="text-sm text-slate-400 space-y-1">
          <p className="text-xs font-semibold text-white mb-1">Actions:</p>
          <p>🚩 <strong className="text-white">Flag:</strong> Mark video as "Flagged for Takedown"</p>
          <p>🟠 <strong className="text-white">High Priority:</strong> Mark as High priority (but not flagged)</p>
          <p>🔴 <strong className="text-white">Critical:</strong> Mark as Critical + Flag + Send email alert</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs font-semibold text-white mb-2">Example Custom Rules:</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <strong className="text-slate-300">Specific Channel Block:</strong> Channel contains "known-pirate-channel" → Critical</li>
            <li>• <strong className="text-slate-300">Artist Name + Download:</strong> Title contains "[Your Artist] download" → Flag</li>
            <li>• <strong className="text-slate-300">Protect Official Videos:</strong> Exact keyword match "[Your Artist] Official" → High Priority</li>
          </ul>
          <p className="text-xs text-slate-500 mt-2 italic">
            Note: AI already detects most piracy patterns automatically. Custom rules are for specific edge cases.
          </p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white/[0.03] rounded-lg border border-white/10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Unauthorized Full Albums"
                className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Auto-flag videos with unauthorized music uploads"
                className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
              />
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="font-medium text-white mb-3">Conditions (at least one required)</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Video Title Contains
                  </label>
                  <input
                    type="text"
                    value={formData.title_contains}
                    onChange={(e) => setFormData({ ...formData, title_contains: e.target.value })}
                    placeholder="e.g., full album, live concert, MP3 download"
                    className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Case-insensitive partial match</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Channel Name Contains
                  </label>
                  <input
                    type="text"
                    value={formData.channel_contains}
                    onChange={(e) => setFormData({ ...formData, channel_contains: e.target.value })}
                    placeholder="e.g., bootleg, pirate, free music"
                    className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Case-insensitive partial match</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Exact Keyword Match
                  </label>
                  <input
                    type="text"
                    value={formData.keyword_match}
                    onChange={(e) => setFormData({ ...formData, keyword_match: e.target.value })}
                    placeholder="e.g., [Artist Name] Official Music"
                    className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Must match this keyword exactly</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Action *
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white px-3 py-2"
              >
                <option value="flag">Auto-Flag for Takedown</option>
                <option value="high_priority">Mark as High Priority</option>
                <option value="critical">Mark as Critical + Flag + Alert</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Rule'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    name: '',
                    description: '',
                    action: 'flag',
                    title_contains: '',
                    channel_contains: '',
                    keyword_match: ''
                  })
                }}
                className="px-4 py-2 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No auto-flag rules yet.</p>
            <p className="text-sm text-slate-400">
              Create rules to automatically handle videos matching specific conditions.
            </p>
          </div>
        ) : (
          rules.map((rule) => {
            const conditions = JSON.parse(rule.conditions)
            return (
              <div
                key={rule.id}
                className={`border rounded-lg p-4 ${rule.active ? 'border-white/10 bg-white/[0.03]' : 'border-white/5 bg-transparent opacity-60'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {rule.name}
                      </h3>
                      {getActionBadge(rule.action)}
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          rule.active
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {rule.description && (
                      <p className="text-sm text-slate-400 mb-3">
                        {rule.description}
                      </p>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">Conditions:</p>
                      <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                        {conditions.title_contains && (
                          <li>Title contains: <code className="bg-black/30 px-2 py-0.5 rounded text-slate-300 border border-white/5">{conditions.title_contains}</code></li>
                        )}
                        {conditions.channel_name_contains && (
                          <li>Channel contains: <code className="bg-black/30 px-2 py-0.5 rounded text-slate-300 border border-white/5">{conditions.channel_name_contains}</code></li>
                        )}
                        {conditions.keyword_exact_match && (
                          <li>Exact keyword: <code className="bg-black/30 px-2 py-0.5 rounded text-slate-300 border border-white/5">{conditions.keyword_exact_match}</code></li>
                        )}
                      </ul>
                    </div>

                    <p className="text-xs text-slate-600 mt-3">
                      Created: {new Date(rule.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`px-3 py-1 text-sm rounded border transition-colors ${
                        rule.active
                          ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                      }`}
                    >
                      {rule.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="px-3 py-1 text-sm bg-red-500/10 text-red-300 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>


    </div>
  )
}

export default AutoFlagRules
