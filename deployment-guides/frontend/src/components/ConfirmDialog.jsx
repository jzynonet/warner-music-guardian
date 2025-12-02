export default function ConfirmDialog({ message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
  const typeStyles = {
    danger: 'border-red-500/30 bg-red-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
  }

  const buttonStyles = {
    danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30',
    warning: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30',
    info: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30',
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`
        ${typeStyles[type]}
        backdrop-blur-xl border rounded-2xl p-6 shadow-2xl
        w-full max-w-md mx-4 animate-scale-in
      `}>
        <p className="text-white text-base leading-relaxed whitespace-pre-line mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 border rounded-lg text-white transition-colors font-medium ${buttonStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
