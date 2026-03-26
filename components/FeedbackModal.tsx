'use client'

import { useRef, useEffect, useState } from 'react'
import { X, Send } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  postCaption: string
  onClose: () => void
  onSubmit: (feedback: string) => Promise<void>
}

export default function FeedbackModal({
  isOpen,
  postCaption,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus automático al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
      setFeedback('')
      setError('')
    }
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!feedback.trim()) {
      setError('Escribe un comentario antes de rechazar.')
      textareaRef.current?.focus()
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSubmit(feedback.trim())
      onClose()
      setFeedback('')
    } catch {
      setError('No se pudo enviar. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Preview de la primera línea del caption
  const captionPreview = postCaption.split('\n')[0].slice(0, 60)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-0 z-50 pb-safe sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-scaleIn overflow-hidden">

          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-[#D2D2D7] rounded-full" />
          </div>

          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1D1D1F]">
                  Comentario de rechazo
                </h2>
                {captionPreview && (
                  <p className="text-xs text-[#6E6E73] mt-0.5 truncate max-w-[260px]">
                    "{captionPreview}…"
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-3 p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#6E6E73] transition-colors"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <textarea
                  ref={textareaRef}
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Ej. Cambiar el tono, el color del texto no se ve bien, agregar el precio..."
                  rows={4}
                  className={`
                    w-full resize-none rounded-xl border px-4 py-3 text-sm
                    text-[#1D1D1F] placeholder:text-[#B0B0B8]
                    outline-none transition-all
                    ${error
                      ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-[#D2D2D7] bg-[#F9F9FB] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/10'
                    }
                  `}
                  disabled={isLoading}
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">{error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl border border-[#D2D2D7] text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !feedback.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF3B30] text-white text-sm font-semibold transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Enviar rechazo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
