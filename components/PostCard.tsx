'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, MessageSquare, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { Post, PostStatus } from '@/lib/airtable'
import { formatScheduledDate, isVideoUrl } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import FeedbackModal from './FeedbackModal'
import { handleApprove, handleReject } from '@/app/actions/posts'

interface PostCardProps {
  post: Post
  clientSlug: string
  onStatusChange?: (recordId: string, newStatus: PostStatus) => void
}

export default function PostCard({ post, clientSlug, onStatusChange }: PostCardProps) {
  const { id, fields } = post
  const { Image_URL, Caption, Scheduled_Date, Status, Feedback } = fields

  const [localStatus, setLocalStatus] = useState<PostStatus>(Status)
  const [isApproving, setIsApproving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isVideo = isVideoUrl(Image_URL)
  const dates = formatScheduledDate(Scheduled_Date)

  // Caption truncado a 3 líneas
  const captionLines = Caption?.split('\n') ?? []
  const captionPreview = captionLines.slice(0, 3).join('\n')
  const hasMoreCaption = captionLines.length > 3 || Caption?.length > 200

  async function onApprove() {
    if (localStatus !== 'Pendiente') return
    setIsApproving(true)

    // Actualización optimista
    setLocalStatus('Aprobado')
    onStatusChange?.(id, 'Aprobado')

    try {
      await handleApprove(id, clientSlug)
    } catch {
      // Revertir si falla
      setLocalStatus('Pendiente')
      onStatusChange?.(id, 'Pendiente')
    } finally {
      setIsApproving(false)
    }
  }

  async function onReject(feedback: string) {
    // Actualización optimista
    setLocalStatus('Rechazado')
    onStatusChange?.(id, 'Rechazado')

    try {
      await handleReject(id, feedback, clientSlug)
    } catch {
      setLocalStatus('Pendiente')
      onStatusChange?.(id, 'Pendiente')
      throw new Error('Error al rechazar')
    }
  }

  const isPending = localStatus === 'Pendiente'
  const isApproved = localStatus === 'Aprobado'
  const isRejected = localStatus === 'Rechazado'

  return (
    <>
      <article
        className={`
          bg-white rounded-2xl overflow-hidden border transition-all duration-300 animate-fadeIn
          ${isApproved ? 'border-green-200 shadow-[0_0_0_1px_#34C75920]' : ''}
          ${isRejected ? 'border-red-100 shadow-[0_0_0_1px_#FF3B3015]' : ''}
          ${isPending ? 'border-[#E8E8EB] shadow-sm hover:shadow-md hover:-translate-y-0.5' : ''}
        `}
      >
        {/* ── Media ────────────────────────────────────────────────────────── */}
        <div className="relative aspect-square w-full bg-[#F5F5F7] overflow-hidden">
          {isVideo ? (
            <video
              src={Image_URL}
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          ) : imageError || !Image_URL ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#B0B0B8]">
              <div className="w-12 h-12 rounded-xl bg-[#E8E8EB] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#6E6E73]" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5z" />
                </svg>
              </div>
              <span className="text-xs">Imagen no disponible</span>
            </div>
          ) : (
            <Image
              src={Image_URL}
              alt={Caption?.slice(0, 80) || 'Post de redes sociales'}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 672px) 100vw, 672px"
              priority={false}
            />
          )}

          {/* Badge de status sobre la imagen */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={localStatus} />
          </div>
        </div>

        {/* ── Contenido ─────────────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">

          {/* Fecha programada */}
          {Scheduled_Date && (
            <div className="flex items-center gap-1.5 text-xs text-[#6E6E73]">
              <Clock size={12} className="flex-shrink-0" />
              <span className="font-medium">{dates.barcelona}</span>
              <span className="text-[#B0B0B8]">·</span>
              <span className="text-[#B0B0B8]">{dates.lima} Lima</span>
            </div>
          )}

          {/* Caption */}
          {Caption && (
            <div>
              <p className={`text-sm text-[#1D1D1F] whitespace-pre-line leading-relaxed ${!captionExpanded ? 'line-clamp-3' : ''}`}>
                {captionExpanded ? Caption : captionPreview}
              </p>
              {hasMoreCaption && (
                <button
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className="mt-1 flex items-center gap-1 text-xs text-[#0071E3] font-medium hover:opacity-80 transition-opacity"
                >
                  {captionExpanded ? (
                    <><ChevronUp size={12} /> Ver menos</>
                  ) : (
                    <><ChevronDown size={12} /> Ver más</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Feedback previo (si fue rechazado) */}
          {isRejected && Feedback && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-red-500 mb-0.5 uppercase tracking-wide">
                Tu comentario
              </p>
              <p className="text-xs text-red-700 leading-relaxed">{Feedback}</p>
            </div>
          )}

          {/* ── Botones de acción (solo si está Pendiente) ── */}
          {isPending && (
            <div className="flex gap-2.5 pt-1">
              {/* Aprobar */}
              <button
                onClick={onApprove}
                disabled={isApproving}
                className="
                  flex-1 flex items-center justify-center gap-2
                  py-2.5 rounded-xl text-sm font-semibold
                  bg-[#34C759] text-white
                  hover:bg-green-500 active:scale-[0.97]
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isApproving ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
                {isApproving ? 'Aprobando…' : 'Aprobar'}
              </button>

              {/* Comentar / Rechazar */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  py-2.5 rounded-xl text-sm font-semibold
                  bg-[#F5F5F7] text-[#1D1D1F] border border-[#E8E8EB]
                  hover:bg-[#EBEBED] active:scale-[0.97]
                  transition-all duration-150
                "
              >
                <MessageSquare size={14} />
                Comentar
              </button>
            </div>
          )}

          {/* Estado final: Aprobado */}
          {isApproved && (
            <div className="flex items-center gap-2 py-2 px-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-xs font-medium text-green-700">
                Aprobado · listo para publicar
              </p>
            </div>
          )}
        </div>
      </article>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={isModalOpen}
        postCaption={Caption || ''}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onReject}
      />
    </>
  )
}
