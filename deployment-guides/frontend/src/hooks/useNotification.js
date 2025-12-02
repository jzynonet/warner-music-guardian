import { useState, useCallback } from 'react'

export function useNotification() {
  const [notification, setNotification] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type })
  }, [])

  const showSuccess = useCallback((message) => {
    showNotification(message, 'success')
  }, [showNotification])

  const showError = useCallback((message) => {
    showNotification(message, 'error')
  }, [showNotification])

  const showWarning = useCallback((message) => {
    showNotification(message, 'warning')
  }, [showNotification])

  const showInfo = useCallback((message) => {
    showNotification(message, 'info')
  }, [showNotification])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const showConfirm = useCallback((message, type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmDialog({
        message,
        type,
        onConfirm: () => {
          setConfirmDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmDialog(null)
          resolve(false)
        },
      })
    })
  }, [])

  return {
    notification,
    confirmDialog,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    showConfirm,
  }
}
