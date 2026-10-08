import { useEffect, useState, useRef } from 'react'
import { useOrbitlyStore } from '../store/orbitly'
import { useSelectSatellite } from '../hooks/useSatellites'
import type { SatelliteListItem } from '../types/satellite'

const ORBIT_COLORS: Record<string, string> = {
  LEO: 'text-blue-400',
  MEO: 'text-purple-400',
  GEO: 'text-yellow-400',
  HEO: 'text-orange-400',
}

function SatelliteCard({
  sat,
  selected,
  onSelect,
}: {
  sat: SatelliteListItem
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(sat.id)}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all duration-200
        ${selected
          ? 'bg-blue-500/15 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-white font-medium text-sm leading-tight truncate">{sat.name}</div>
          <div className="text-white/35 font-mono text-xs mt-1">
            #{sat.norad_id}
            {sat.altitude_km && ` · ${Math.round(sat.altitude_km).toLocaleString()} km`}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sat.orbit_type && (
            <span className={`text-xs font-mono font-medium ${ORBIT_COLORS[sat.orbit_type] || 'text-white/40'}`}>
              {sat.orbit_type}
            </span>
          )}
          {sat.is_stale && (
            <span className="text-yellow-500/60 text-xs">stale</span>
          )}
        </div>
      </div>
    </button>
  )
}

export function FeaturedSatellites() {
  const { featuredSatellites, isFeaturedLoading, selectedSatelliteId } = useOrbitlyStore()
  const { selectSatellite } = useSelectSatellite()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (isFeaturedLoading) {
    return (
      <div className="flex items-center gap-3 text-white/40 text-sm py-4">
        <div className="w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        Loading catalog from CelesTrak...
      </div>
    )
  }

  if (featuredSatellites.length === 0) {
    return (
      <div className="text-white/30 text-sm py-4 text-center">
        Backend unavailable — start the FastAPI server to load real satellite data.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">
        Notable Satellites — Live Catalog
      </div>
      <div ref={scrollRef} className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {featuredSatellites.map((sat) => (
          <SatelliteCard
            key={sat.id}
            sat={sat}
            selected={selectedSatelliteId === sat.id}
            onSelect={selectSatellite}
          />
        ))}
      </div>
    </div>
  )
}
