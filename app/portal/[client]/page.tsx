import { Suspense } from 'react'
import { getPostsByClient } from '@/lib/airtable'
import { getInitials, capitalize } from '@/lib/utils'
import PostFeed from '@/components/PostFeed'
import SkeletonFeed from '@/components/SkeletonCard'

// ─── Metadata dinámica ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>
}) {
  const { client } = await params
  return {
    title: `${capitalize(client)} · Portal de Aprobación — Implant`,
  }
}

// ─── Componente de contenido (async) ─────────────────────────────────────────

async function PortalContent({ clientSlug }: { clientSlug: string }) {
  const posts = await getPostsByClient(clientSlug)

  return <PostFeed posts={posts} clientSlug={clientSlug} />
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default async function PortalPage({
  params,
}: {
  params: Promise<{ client: string }>
}) {
  const { client: clientSlug } = await params
  const initials = getInitials(clientSlug)
  const clientName = clientSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + cliente */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold tracking-wide">
                IM
              </span>
            </div>
            <div>
              <p className="text-[11px] text-[#6E6E73] leading-none">Implant Agency</p>
              <p className="text-sm font-semibold text-[#1D1D1F] leading-tight">
                {clientName}
              </p>
            </div>
          </div>

          {/* Avatar del cliente */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* ── Feed ── */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Suspense fallback={<SkeletonFeed />}>
          <PortalContent clientSlug={clientSlug} />
        </Suspense>
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-2xl mx-auto px-4 pb-10 pt-4 text-center">
        <p className="text-[11px] text-[#6E6E73]">
          Implant Agency · Portal de Aprobación de Contenidos
        </p>
      </footer>
    </div>
  )
}
