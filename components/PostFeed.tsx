'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, Clock, XCircle, Inbox } from 'lucide-react'
import type { Post, PostStatus } from '@/lib/airtable'
import PostCard from './PostCard'

type FilterTab = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Todos'

const TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: 'Pendiente', label: 'Pendientes', icon: <Clock size={12} /> },
  { key: 'Aprobado', label: 'Aprobados', icon: <CheckCircle2 size={12} /> },
  { key: 'Rechazado', label: 'Rechazados', icon: <XCircle size={12} /> },
  { key: 'Todos', label: 'Todos', icon: null },
]

interface PostFeedProps {
  posts: Post[]
  clientSlug: string
}

export default function PostFeed({ posts: initialPosts, clientSlug }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [activeTab, setActiveTab] = useState<FilterTab>('Pendiente')

  // Actualización optimista del estado local
  function handleStatusChange(recordId: string, newStatus: PostStatus) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === recordId
          ? { ...p, fields: { ...p.fields, Status: newStatus } }
          : p
      )
    )
  }

  // Contadores por tab
  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      Pendiente: 0,
      Aprobado: 0,
      Rechazado: 0,
      Todos: posts.length,
    }
    posts.forEach((p) => {
      const s = p.fields.Status as PostStatus
      if (s in c) c[s]++
    })
    return c
  }, [posts])

  // Posts filtrados según tab activo
  const filtered = useMemo(() => {
    if (activeTab === 'Todos') return posts
    return posts.filter((p) => p.fields.Status === activeTab)
  }, [posts, activeTab])

  return (
    <div className="space-y-4">
      {/* ── Tabs de filtro ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(({ key, label, icon }) => {
          const count = counts[key]
          const isActive = activeTab === key

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                whitespace-nowrap flex-shrink-0 transition-all duration-150
                ${isActive
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'bg-white text-[#6E6E73] border border-[#E8E8EB] hover:border-[#C7C7CC] hover:text-[#1D1D1F]'
                }
              `}
            >
              {icon && <span className={isActive ? 'text-white' : 'text-[#6E6E73]'}>{icon}</span>}
              {label}
              {count > 0 && (
                <span
                  className={`
                    ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center
                    rounded-full px-1 text-[10px] font-bold
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : key === 'Pendiente'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-[#F5F5F7] text-[#6E6E73]'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Resumen rápido (solo en tab Pendiente) ──────────────────────── */}
      {activeTab === 'Pendiente' && counts.Pendiente > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-sm text-amber-800 font-medium">
            Tienes{' '}
            <strong>{counts.Pendiente}</strong>{' '}
            {counts.Pendiente === 1 ? 'post pendiente' : 'posts pendientes'} de aprobación.
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Aprueba o comenta cada uno para que el equipo pueda publicarlos.
          </p>
        </div>
      )}

      {/* ── Lista de posts ──────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              clientSlug={clientSlug}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, { title: string; body: string }> = {
    Pendiente: {
      title: '¡Todo al día!',
      body: 'No tienes contenidos pendientes de aprobación.',
    },
    Aprobado: {
      title: 'Sin aprobados aún',
      body: 'Los posts que apruebes aparecerán aquí.',
    },
    Rechazado: {
      title: 'Sin rechazos',
      body: 'Los posts con comentarios de rechazo aparecerán aquí.',
    },
    Todos: {
      title: 'Sin contenidos',
      body: 'No hay posts asignados a este portal todavía.',
    },
  }

  const { title, body } = messages[tab]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
        <Inbox size={24} className="text-[#B0B0B8]" />
      </div>
      <h3 className="text-base font-semibold text-[#1D1D1F] mb-1">{title}</h3>
      <p className="text-sm text-[#6E6E73] max-w-xs">{body}</p>
    </div>
  )
}
