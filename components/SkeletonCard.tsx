function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E8EB]">
      {/* Imagen */}
      <div className="skeleton aspect-square w-full" />

      <div className="p-4 space-y-3">
        {/* Fecha */}
        <div className="skeleton h-4 w-32 rounded-full" />

        {/* Caption */}
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded-full" />
          <div className="skeleton h-3.5 w-4/5 rounded-full" />
          <div className="skeleton h-3.5 w-3/5 rounded-full" />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function SkeletonFeed() {
  return (
    <div className="space-y-4">
      {/* Tabs skeleton */}
      <div className="flex gap-2 pb-2">
        {[80, 64, 72].map((w) => (
          <div
            key={w}
            className="skeleton h-8 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
