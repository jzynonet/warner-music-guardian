import { useState, useEffect } from 'react'
import axios from 'axios'

function BulkImport({ onImportComplete }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [artists, setArtists] = useState([])

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/keywords/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      setFile(null)
      if (onImportComplete) onImportComplete()
    } catch (error) {
      setResult({
        error: error.response?.data?.error || 'Upload failed'
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `keyword,artist_name,auto_flag,priority
Example Brand Name,Artist Name,true,High
Example Product,Artist Name,false,Medium
Tour Name 2024,Another Artist,true,Critical`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'keyword_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-xl">📥</span>
        </div>
        <h2 className="text-xl font-bold text-white">
            Bulk Keyword Import
        </h2>
      </div>

      <div className="space-y-8">
        {/* Instructions */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs border border-white/10">1</span>
            How to Import
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400 ml-2">
            <li>Download the CSV template below</li>
            <li>Fill in your keywords (you can add hundreds!)</li>
            <li>Upload the completed CSV file</li>
            <li>Review the import results</li>
          </ol>
        </div>

        {/* Template Download */}
        <div>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-5 py-3 bg-white text-black rounded-lg hover:bg-slate-200 transition-all font-bold shadow-lg shadow-white/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* CSV Format Info */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
             <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs border border-white/10">2</span>
             CSV Format Requirements
          </h4>
          <div className="text-sm text-slate-400 space-y-3 pl-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono bg-black/30 px-2 py-1 rounded text-indigo-300 border border-white/5 text-xs">keyword</span> 
              <span>The keyword to search (required)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono bg-black/30 px-2 py-1 rounded text-indigo-300 border border-white/5 text-xs">artist_name</span> 
              <span>Artist name (must exist in Artist Manager)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono bg-black/30 px-2 py-1 rounded text-indigo-300 border border-white/5 text-xs">auto_flag</span> 
              <span>Auto-flag matches? (true/false)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono bg-black/30 px-2 py-1 rounded text-indigo-300 border border-white/5 text-xs">priority</span> 
              <span>Critical, High, Medium, or Low</span>
            </div>
          </div>
        </div>

        {/* Current Artists */}
        {artists.length > 0 && (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs border border-white/10">3</span>
                Available Artists
            </h4>
            <div className="flex flex-wrap gap-2 mb-3 pl-2">
              {artists.map((artist) => (
                <span key={artist.id} className="px-3 py-1 bg-black/30 text-slate-300 rounded-full border border-white/5 text-xs font-medium">
                  {artist.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 ml-2">
              Make sure artist_name in your CSV matches one of these exactly (case-sensitive).
            </p>
          </div>
        )}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Upload CSV or Excel File
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2.5 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-white/10 file:text-white
                hover:file:bg-white/20
                cursor-pointer bg-white/[0.03] rounded-lg border border-white/5"
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-8 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium whitespace-nowrap"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
          {file && (
            <p className="mt-2 text-sm text-emerald-400 font-medium">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-xl p-6 border ${result.error ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            {result.error ? (
              <>
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Import Failed
                </h3>
                <p className="text-red-300 text-sm">{result.error}</p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Import Complete
                </h3>
                <div className="space-y-2 text-sm text-emerald-100/80">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Keywords added: <strong className="text-white">{result.added}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    Keywords skipped (duplicates): <strong className="text-white">{result.skipped}</strong>
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/30">
                      <p className="font-semibold text-red-300 mb-2">Errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-200/70">
                        {result.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>...and {result.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h4 className="font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span> Pro Tips
          </h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 ml-1">
            <li>You can import 1000+ keywords at once</li>
            <li>Duplicate keywords are automatically skipped</li>
            <li>Use Excel for easier editing, save as CSV or upload .xlsx directly</li>
            <li>Leave <code className="text-xs bg-black/30 px-1 py-0.5 rounded text-slate-400 border border-white/5">artist_name</code> blank for global keywords</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BulkImport
