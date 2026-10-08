import { useEffect, useCallback } from 'react'
import { useOrbitlyStore } from '../store/orbitly'
import {
  searchSatellites,
  getFeaturedSatellites,
  getSatelliteDetail,
  getSatelliteOrbit,
} from '../api/client'

// ── Search hook ────────────────────────────────────
export function useSearch() {
  const {
    setSearchResults,
    setIsSearching,
    setSearchError,
  } = useOrbitlyStore()

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    setSearchError(null)
    try {
      const result = await searchSatellites(query)
      setSearchResults(result.results)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed'
      setSearchError(msg)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [setSearchResults, setIsSearching, setSearchError])

  return { doSearch }
}

// ── Featured satellites hook ───────────────────────
export function useFeaturedSatellites() {
  const { setFeaturedSatellites, setIsFeaturedLoading } = useOrbitlyStore()

  useEffect(() => {
    let cancelled = false
    setIsFeaturedLoading(true)
    getFeaturedSatellites(12)
      .then((list) => {
        if (!cancelled) setFeaturedSatellites(list)
      })
      .catch((err) => {
        console.error('[useFeaturedSatellites]', err)
      })
      .finally(() => {
        if (!cancelled) setIsFeaturedLoading(false)
      })
    return () => { cancelled = true }
  }, [setFeaturedSatellites, setIsFeaturedLoading])
}

// ── Satellite selection hook ───────────────────────
export function useSelectSatellite() {
  const {
    setSelectedSatelliteId,
    setSelectedSatellite,
    setSelectedOrbitPath,
    setCameraTarget,
  } = useOrbitlyStore()

  const selectSatellite = useCallback(async (id: string) => {
    setSelectedSatelliteId(id)
    setSelectedSatellite(null)
    setSelectedOrbitPath(null)

    try {
      // Fetch detail and orbit path in parallel
      const [detail, orbit] = await Promise.all([
        getSatelliteDetail(id),
        getSatelliteOrbit(id, 180),
      ])
      setSelectedSatellite(detail)
      setSelectedOrbitPath(orbit)

      // Move camera to satellite position if we have one
      const der = detail.satellite.derived
      if (der?.latitude != null && der?.longitude != null) {
        setCameraTarget([der.latitude, der.longitude, der.altitude_km || 500])
      }
    } catch (err) {
      console.error('[useSelectSatellite]', err)
    }
  }, [setSelectedSatelliteId, setSelectedSatellite, setSelectedOrbitPath, setCameraTarget])

  return { selectSatellite }
}
