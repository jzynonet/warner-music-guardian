import { useState } from 'react'

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await onLogin(password)
    
    if (!success) {
      setError('Invalid password')
      setPassword('')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Minimal Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle deep gradient mesh */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/10 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-slate-800/10 rounded-full blur-[120px] opacity-40"></div>
        
        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
        
        {/* Left Side - Branding & Intro */}
        <div className="hidden lg:block space-y-10">
          <div>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 shadow-glass-sm p-2">
               <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 className="text-5xl font-bold tracking-tight leading-tight text-white mb-4">
              Warner Music <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">Guardian</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Advanced AI-powered copyright protection system. Monitor, detect, and manage unauthorized content across platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Active Monitoring</div>
             </div>
             <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Detection Accuracy</div>
             </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden group">
            {/* Subtle light reflection effect */}
            <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-white hover:bg-slate-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Access System'
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <div className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Protected by Warner Music Guardian</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
