import React from 'react'
import { X, RotateCcw, Sparkles, ExternalLink, Activity, Radio, Cpu, Compass } from 'lucide-react'
import { useOrbitlyStore } from '../store/orbitly'
import { getSatelliteVisual } from '../data/satelliteImages'

interface SatelliteCloseUpModalProps {
  onAskAI?: (satelliteName: string, satelliteId: string) => void
}

export const SatelliteCloseUpModal: React.FC<SatelliteCloseUpModalProps> = ({ onAskAI }) => {
  const { selectedSatellite, clearSelection, setIsInspectModalOpen } = useOrbitlyStore()

  if (!selectedSatellite) return null

  const sat = selectedSatellite.satellite
  const der = sat.derived
  const visual = getSatelliteVisual(sat.norad_id, sat.name)

  const handleReset = () => {
    clearSelection()
  }

  const handleAsk = () => {
    if (onAskAI) {
      onAskAI(sat.name, sat.id)
    } else {
      const el = document.getElementById('assistant')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="absolute inset-x-4 top-4 z-40 max-w-xl mx-auto animate-fadeIn">
      <div className="bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-cyan-500/20 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-cyan-400">
                Close-Up Telemetry Inspection
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${visual.badgeColor}`}>
                NORAD #{sat.norad_id}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {visual.modelName || sat.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition text-xs flex items-center gap-1 font-medium"
              title="Reset view and deselect satellite"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsInspectModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Satellite Real Image & Visual Presentation */}
        <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
          <img
            src={visual.imageUrl}
            alt={sat.name}
            className="w-full h-44 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Graceful fallback to secondary aerospace photography
              const target = e.target as HTMLImageElement
              if (target.src !== visual.fallbackUrl) {
                target.src = visual.fallbackUrl
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Overlay Tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Speed: {der?.velocity_km_s?.toFixed(2) || '7.66'} km/s</span>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-cyan-300 font-mono text-[11px]">
              Alt: {der?.altitude_km ? Math.round(der.altitude_km) : '420'} km
            </div>
          </div>
        </div>

        {/* Technical Hardware Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Dimensions:
            </div>
            <div className="font-semibold text-slate-200 mt-0.5 truncate">{visual.dimensions}</div>
          </div>

          <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-purple-400" />
              Solar Array:
            </div>
            <div className="font-semibold text-slate-200 mt-0.5 truncate">{visual.solarSpan}</div>
          </div>

          <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" />
              Launch Vehicle:
            </div>
            <div className="font-semibold text-slate-200 mt-0.5 truncate">{visual.launchVehicle}</div>
          </div>

          <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              Estimated Mass:
            </div>
            <div className="font-semibold text-slate-200 mt-0.5 truncate">{visual.mass}</div>
          </div>
        </div>

        {/* Purpose */}
        <p className="text-xs text-slate-300 mt-2.5 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
          <strong className="text-cyan-400">Mission Profile:</strong> {visual.purpose}
        </p>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset View</span>
          </button>

          <button
            onClick={handleAsk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI About This</span>
          </button>
        </div>
      </div>
    </div>
  )
}
