import { useState, useRef, useEffect, useCallback } from 'react'
import { useOrbitlyStore } from '../store/orbitly'
import { searchSatellites } from '../api/client'
import { useSelectSatellite } from '../hooks/useSatellites'

export function SearchBar() {
  const [localQuery, setLocalQuery] = useState('')
  const [localResults, setLocalResults] = useState<{ id: string; name: string; orbit_type: string | null; altitude_km: number | null }[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { selectSatellite } = useSelectSatellite()
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setLocalResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await searchSatellites(q, 8)
      setLocalResults(result.results)
      setIsOpen(true)
    } catch (e) {
      setError('Search unavailable — check backend connection')
      setLocalResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(localQuery), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [localQuery, doSearch])

  const handleSelect = (id: string) => {
    selectSatellite(id)
    setIsOpen(false)
    setLocalQuery('')
    inputRef.current?.blur()
  }

  const orbitColors: Record<string, string> = {
    LEO: 'text-blue-400',
    MEO: 'text-purple-400',
    GEO: 'text-yellow-400',
    HEO: 'text-orange-400',
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => localResults.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search satellites — ISS, Hubble, Starlink, NORAD ID..."
          className="
            w-full pl-12 pr-12 py-4
            bg-white/5 backdrop-blur-xl
            border border-white/10 hover:border-blue-500/40 focus:border-blue-500/60
            rounded-2xl
            text-white placeholder-white/30
            text-base font-light tracking-wide
            outline-none transition-all duration-300
            focus:bg-white/8 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)]
          "
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Quick preset pills for students and hobbyists */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        <span className="text-white/30 text-xs font-mono mr-1">Quick Explore:</span>
        {[
          { label: '🛰️ ISS Space Station', id: '25544' },
          { label: '🔭 Hubble Telescope', id: '20580' },
          { label: '🇨🇳 Tiangong CSS', id: '48274' },
          { label: '📡 NOAA-19', id: '33591' },
          { label: '✨ Starlink', query: 'Starlink' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.id) {
                selectSatellite(item.id)
              } else if (item.query) {
                setLocalQuery(item.query)
                doSearch(item.query)
              }
            }}
            className="
              text-xs px-3 py-1.5 rounded-full
              bg-white/5 hover:bg-blue-500/20 hover:border-blue-400/50
              border border-white/10 text-white/70 hover:text-white
              transition-all duration-200 cursor-pointer
            "
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Dropdown results */}
      {isOpen && (localResults.length > 0 || error) && (
        <div className="
          absolute top-full mt-3 w-full z-50
          bg-[#060c14]/95 backdrop-blur-xl
          border border-white/10 rounded-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          overflow-hidden
        ">
          {error ? (
            <div className="px-4 py-3 text-red-400/80 text-sm font-light flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          ) : (
            <ul>
              {localResults.map((sat, i) => (
                <li key={sat.id}>
                  <button
                    onMouseDown={() => handleSelect(sat.id)}
                    className="
                      w-full px-5 py-3.5 text-left flex items-center justify-between
                      hover:bg-blue-500/10 transition-colors duration-150
                      border-b border-white/5 last:border-0
                    "
                  >
                    <div>
                      <div className="text-white font-medium text-sm">{sat.name}</div>
                      <div className="text-white/40 text-xs font-mono mt-0.5">
                        NORAD #{sat.id}
                        {sat.altitude_km && ` · ${Math.round(sat.altitude_km).toLocaleString()} km`}
                      </div>
                    </div>
                    {sat.orbit_type && (
                      <span className={`text-xs font-mono font-medium ${orbitColors[sat.orbit_type] || 'text-white/40'}`}>
                        {sat.orbit_type}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* No results state */}
      {isOpen && !isLoading && localQuery.trim() && localResults.length === 0 && !error && (
        <div className="
          absolute top-full mt-3 w-full z-50
          bg-[#060c14]/95 backdrop-blur-xl
          border border-white/10 rounded-2xl
          px-5 py-4 text-white/40 text-sm
        ">
          No satellites found for "<span className="text-white/70">{localQuery}</span>"
        </div>
      )}
    </div>
  )
}
