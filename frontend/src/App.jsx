import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import DashboardEnhanced from './components/DashboardEnhanced'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

axios.defaults.baseURL = API_URL

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiConfigured, setApiConfigured] = useState(false)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await axios.get('/api/health')
      setApiConfigured(response.data.api_configured)
      
      // Check if already authenticated
      const auth = localStorage.getItem('authenticated')
      if (auth === 'true') {
        setAuthenticated(true)
      }
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (password) => {
    try {
      const response = await axios.post('/api/auth/login', { password })
      if (response.data.success) {
        setAuthenticated(true)
        localStorage.setItem('authenticated', 'true')
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    localStorage.removeItem('authenticated')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-neon-yellow border-t-transparent shadow-glow"></div>
          <div className="mt-6 text-sm font-medium text-neon-blue tracking-widest uppercase">Loading System</div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen font-sans text-slate-200 bg-[#050505] selection:bg-white/20 selection:text-white">
      {/* Subtle Ambient Background - No Blobs */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
      
      <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 p-1">
                  <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-white tracking-tight">
                    Warner Music Guardian
                  </h1>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {!apiConfigured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="glass-card p-6 rounded-2xl flex gap-4 items-start border-l-4 border-l-amber-500">
             <div className="shrink-0 w-6 h-6 text-amber-500 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="animate-pulse">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-500">Configuration Required</h3>
                <p className="mt-1 text-slate-300">
                  YouTube API is not configured. Please add your API key to the .env file.
                </p>
              </div>
          </div>
        </div>
      )}

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardEnhanced apiConfigured={apiConfigured} />
      </main>
    </div>
  )
}

export default App
