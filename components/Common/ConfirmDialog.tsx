'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirming,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !confirming) {
        onCancel()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [confirming, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/50"
        aria-label="Close dialog"
        onClick={onCancel}
        disabled={confirming}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-md rounded-lg bg-surface p-6 shadow-lg"
      >
        <h2 id="confirm-title" className="text-xl font-semibold text-ink">
          {title}
        </h2>
        <p id="confirm-description" className="mt-2 text-gray-600">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
