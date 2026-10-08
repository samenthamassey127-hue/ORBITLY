import { useEffect, useState } from 'react'
import { getCatalogStats } from '../api/client'
import type { CatalogStats } from '../types/satellite'

export function StatsBar() {
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCatalogStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="flex items-center gap-6 text-sm">
      {stats ? (
        <>
          <Stat label="Tracked Objects" value={stats.total.toLocaleString()} />
          <div className="w-px h-4 bg-white/10" />
          <Stat label="Payloads" value={stats.payloads.toLocaleString()} />
          <div className="w-px h-4 bg-white/10" />
          <Stat label="LEO" value={stats.leo_count.toLocaleString()} />
          <div className="w-px h-4 bg-white/10" />
          <Stat label="GEO" value={stats.geo_count.toLocaleString()} />
        </>
      ) : (
        <span className="text-white/20 text-xs">Catalog stats unavailable</span>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/30 text-xs">{label}</span>
      <span className="text-white font-mono font-medium">{value}</span>
    </div>
  )
}
