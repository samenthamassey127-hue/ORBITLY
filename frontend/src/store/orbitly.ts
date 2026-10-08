import { create } from 'zustand'
import type { SatelliteListItem, SatelliteDetail, OrbitPath } from '../types/satellite'

interface OrbitlyStore {
  // Selected satellite
  selectedSatelliteId: string | null
  selectedSatellite: SatelliteDetail | null
  selectedOrbitPath: OrbitPath | null

  // Search
  searchQuery: string
  searchResults: SatelliteListItem[]
  isSearching: boolean
  searchError: string | null

  // Featured
  featuredSatellites: SatelliteListItem[]
  isFeaturedLoading: boolean

  // Globe
  globeReady: boolean
  cameraTarget: [number, number, number] | null

  // Actions
  setSelectedSatelliteId: (id: string | null) => void
  setSelectedSatellite: (detail: SatelliteDetail | null) => void
  setSelectedOrbitPath: (path: OrbitPath | null) => void
  setSearchQuery: (q: string) => void
  setSearchResults: (results: SatelliteListItem[]) => void
  setIsSearching: (v: boolean) => void
  setSearchError: (e: string | null) => void
  setFeaturedSatellites: (list: SatelliteListItem[]) => void
  setIsFeaturedLoading: (v: boolean) => void
  setGlobeReady: (v: boolean) => void
  setCameraTarget: (target: [number, number, number] | null) => void
  clearSelection: () => void
}

export const useOrbitlyStore = create<OrbitlyStore>((set) => ({
  selectedSatelliteId: null,
  selectedSatellite: null,
  selectedOrbitPath: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  featuredSatellites: [],
  isFeaturedLoading: false,
  globeReady: false,
  cameraTarget: null,

  setSelectedSatelliteId: (id) => set({ selectedSatelliteId: id }),
  setSelectedSatellite: (detail) => set({ selectedSatellite: detail }),
  setSelectedOrbitPath: (path) => set({ selectedOrbitPath: path }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (v) => set({ isSearching: v }),
  setSearchError: (e) => set({ searchError: e }),
  setFeaturedSatellites: (list) => set({ featuredSatellites: list }),
  setIsFeaturedLoading: (v) => set({ isFeaturedLoading: v }),
  setGlobeReady: (v) => set({ globeReady: v }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  clearSelection: () =>
    set({
      selectedSatelliteId: null,
      selectedSatellite: null,
      selectedOrbitPath: null,
      cameraTarget: null,
    }),
}))
