import { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeStyles = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-down">
      <div className={`
        ${typeStyles[type]}
        backdrop-blur-xl border rounded-lg p-4 pr-12 shadow-2xl
        min-w-[300px] max-w-md
      `}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icons[type]}</span>
          <p className="text-white text-sm leading-relaxed whitespace-pre-line flex-1">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
