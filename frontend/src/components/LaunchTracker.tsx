import React, { useState, useEffect } from 'react'
import { Rocket, Clock, MapPin, Globe, ExternalLink, Filter } from 'lucide-react'
import type { RocketLaunch } from '../types/satellite'
import { getLaunches } from '../api/client'

interface LaunchTrackerProps {
  onSelectMission?: (missionName: string) => void
}

export const LaunchTracker: React.FC<LaunchTrackerProps> = ({ onSelectMission }) => {
  const [launches, setLaunches] = useState<RocketLaunch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [now, setNow] = useState(Date.now())

  // Ticking timer for real-time countdown every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchLaunches() {
      try {
        setLoading(true)
        const data = await getLaunches()
        if (!cancelled) {
          setLaunches(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch launches', err)
          setError('Unable to fetch live rocket launch schedules.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchLaunches()
    return () => { cancelled = true }
  }, [])

  // Format countdown string
  const formatCountdown = (windowStart: string) => {
    const diff = Math.max(0, new Date(windowStart).getTime() - now)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    if (days > 0) {
      return `T-${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`
    }
    return `T-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const providers = ['All', 'SpaceX', 'NASA', 'ISRO', 'ESA']
  const missionTypes = ['All', 'Communications', 'Human Spaceflight', 'Earth Observation', 'Solar Science']

  const filteredLaunches = launches.filter((l) => {
    const matchProvider = selectedProvider === 'All' || l.provider.toLowerCase().includes(selectedProvider.toLowerCase())
    const matchType = selectedType === 'All' || l.mission_type.toLowerCase() === selectedType.toLowerCase()
    return matchProvider && matchType
  })

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Rocket className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                Live Rocket Launch Radar
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                  LIVE COUNTDOWNS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Next orbital insertions, payload manifests, and launch windows
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Provider:</span>
            <div className="flex gap-1 ml-1">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={`px-2 py-0.5 rounded transition ${
                    selectedProvider === p
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'hover:text-slate-200 text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <span>Mission:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {missionTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-200">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Rocket className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium">Acquiring global launch manifests...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-rose-400 text-sm bg-rose-950/20 rounded-xl border border-rose-900/40">
          {error}
        </div>
      ) : filteredLaunches.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No upcoming rocket launches match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {filteredLaunches.map((launch) => (
            <div
              key={launch.id}
              className="group relative bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {launch.provider}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 animate-pulse" />
                    {formatCountdown(launch.window_start)}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {launch.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {launch.vehicle}
                </p>

                <p className="text-xs text-slate-300/80 mt-3 line-clamp-2 leading-relaxed">
                  {launch.payload_description}
                </p>
              </div>

              {/* Card Bottom Meta */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    Target Orbit:
                  </span>
                  <span className="text-slate-200 font-medium">{launch.orbit_type}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Site:
                  </span>
                  <span className="text-slate-300 truncate max-w-[170px]" title={launch.pad}>
                    {launch.pad.split(',')[0]}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Status: {launch.status}
                  </span>

                  {launch.webcast_url && (
                    <a
                      href={launch.webcast_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Webcast
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
