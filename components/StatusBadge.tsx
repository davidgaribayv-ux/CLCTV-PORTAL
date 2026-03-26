import type { PostStatus } from '@/lib/airtable'

const config: Record<
  PostStatus,
  { label: string; className: string }
> = {
  Pendiente: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  Aprobado: {
    label: 'Aprobado',
    className: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  },
  Rechazado: {
    label: 'Rechazado',
    className: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  },
}

export default function StatusBadge({ status }: { status: PostStatus }) {
  const { label, className } = config[status] ?? config.Pendiente

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
