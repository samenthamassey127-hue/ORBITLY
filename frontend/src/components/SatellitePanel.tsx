import { useOrbitlyStore } from '../store/orbitly'
import type { SatelliteDetail, FieldExplanation } from '../types/satellite'

function StatBox({ label, value, unit }: { label: string; value: string | null; unit?: string }) {
  return (
    <div className="bg-white/3 rounded-xl p-4 border border-white/6">
      <div className="text-white/40 text-xs uppercase tracking-widest mb-1 font-medium">{label}</div>
      <div className="text-white font-mono text-lg font-medium">
        {value ?? <span className="text-white/20">—</span>}
        {unit && value && <span className="text-white/40 text-sm ml-1">{unit}</span>}
      </div>
    </div>
  )
}

function ExplanationItem({ ex }: { ex: FieldExplanation }) {
  return (
    <div className="border-l-2 border-blue-500/30 pl-4 py-1">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-blue-400 text-xs font-mono font-medium uppercase tracking-wider">{ex.field}</span>
        <span className="text-white/60 font-mono text-sm">{ex.value}</span>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{ex.explanation}</p>
      {ex.analogy && (
        <p className="text-white/40 text-xs italic mt-1">→ {ex.analogy}</p>
      )}
    </div>
  )
}

function OrbitTypeBadge({ type }: { type: string | null }) {
  const colors: Record<string, string> = {
    LEO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    MEO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    GEO: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    HEO: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  }
  if (!type) return null
  return (
    <span className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-medium ${colors[type] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {type}
    </span>
  )
}

export function SatellitePanel() {
  const { selectedSatellite, clearSelection } = useOrbitlyStore()

  if (!selectedSatellite) return null

  const { satellite, explanations, summary } = selectedSatellite
  const der = satellite.derived
  const el = satellite.orbital_elements

  const lastUpdated = new Date(satellite.last_updated).toLocaleString()

  return (
    <div className="
      relative w-full max-w-lg
      bg-[#06101c]/95 backdrop-blur-2xl
      border border-white/10 rounded-3xl
      overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]
    ">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${satellite.is_stale ? 'bg-yellow-400' : 'bg-green-400'} ${satellite.is_stale ? '' : 'animate-pulse'}`} />
              <span className="text-white/40 text-xs">
                {satellite.is_stale ? 'Stale data' : 'Live data'} · {lastUpdated}
              </span>
            </div>
            <h2 className="text-white font-semibold text-xl leading-tight truncate">{satellite.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/40 font-mono text-xs">NORAD #{satellite.norad_id}</span>
              {satellite.international_designator && (
                <span className="text-white/30 font-mono text-xs">· {satellite.international_designator}</span>
              )}
              <OrbitTypeBadge type={der?.orbit_type ?? null} />
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-white/30 hover:text-white/80 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[70vh]">
        {/* AI Summary */}
        {summary && (
          <div className="px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span className="text-blue-400/80 text-xs font-medium uppercase tracking-wider">Intelligence Layer</span>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="px-6 py-4 border-b border-white/8">
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Altitude"
              value={der?.altitude_km ? Math.round(der.altitude_km).toLocaleString() : null}
              unit="km"
            />
            <StatBox
              label="Period"
              value={der?.period_minutes ? `${der.period_minutes.toFixed(1)}` : null}
              unit="min"
            />
            <StatBox
              label="Inclination"
              value={el?.inclination_deg ? `${el.inclination_deg.toFixed(2)}` : null}
              unit="°"
            />
            <StatBox
              label="Velocity"
              value={der?.velocity_km_s ? `${der.velocity_km_s.toFixed(2)}` : null}
              unit="km/s"
            />
            <StatBox
              label="Apogee"
              value={der?.apogee_km ? Math.round(der.apogee_km).toLocaleString() : null}
              unit="km"
            />
            <StatBox
              label="Perigee"
              value={der?.perigee_km ? Math.round(der.perigee_km).toLocaleString() : null}
              unit="km"
            />
          </div>
        </div>

        {/* Human-readable explanations */}
        {explanations && explanations.length > 0 && (
          <div className="px-6 py-4 border-b border-white/8">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">
              What This Means
            </div>
            <div className="space-y-5">
              {explanations.map((ex) => (
                <ExplanationItem key={ex.field} ex={ex} />
              ))}
            </div>
          </div>
        )}

        {/* Mission info */}
        {satellite.launch && (
          <div className="px-6 py-4 border-b border-white/8">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Mission</div>
            <div className="space-y-2 text-sm">
              {satellite.launch.launch_date && (
                <div className="flex justify-between">
                  <span className="text-white/40">Launch Date</span>
                  <span className="text-white/80">{satellite.launch.launch_date}</span>
                </div>
              )}
              {satellite.launch.rocket && (
                <div className="flex justify-between">
                  <span className="text-white/40">Rocket</span>
                  <span className="text-white/80">{satellite.launch.rocket}</span>
                </div>
              )}
              {satellite.launch.launch_site && (
                <div className="flex justify-between">
                  <span className="text-white/40">Launch Site</span>
                  <span className="text-white/80 text-right max-w-48">{satellite.launch.launch_site}</span>
                </div>
              )}
              {satellite.launch.mission_description && (
                <div className="mt-3">
                  <div className="text-white/40 text-xs mb-1">Mission Description</div>
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-4">
                    {satellite.launch.mission_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TLE raw data */}
        <div className="px-6 py-4">
          <div className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Raw TLE Data</div>
          <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-white/50 space-y-1 overflow-x-auto">
            <div className="text-white/70">{satellite.name}</div>
            {satellite.tle_line1 && <div>{satellite.tle_line1}</div>}
            {satellite.tle_line2 && <div>{satellite.tle_line2}</div>}
          </div>
          <div className="mt-2 text-white/25 text-xs">
            Source: {satellite.source} · NORAD catalog
          </div>
        </div>
      </div>
    </div>
  )
}
