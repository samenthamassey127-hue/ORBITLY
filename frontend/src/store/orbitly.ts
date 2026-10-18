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

  // Globe & View
  globeReady: boolean
  cameraTarget: [number, number, number] | null
  earthViewMode: 'political' | 'night' | 'radar'
  isInspectModalOpen: boolean
  resetCameraTrigger: number

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
  setEarthViewMode: (mode: 'political' | 'night' | 'radar') => void
  setIsInspectModalOpen: (open: boolean) => void
  triggerCameraReset: () => void
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
  earthViewMode: 'political',
  isInspectModalOpen: false,
  resetCameraTrigger: 0,

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
  setEarthViewMode: (mode) => set({ earthViewMode: mode }),
  setIsInspectModalOpen: (open) => set({ isInspectModalOpen: open }),
  triggerCameraReset: () =>
    set((state) => ({
      resetCameraTrigger: state.resetCameraTrigger + 1,
      cameraTarget: null,
    })),
  clearSelection: () =>
    set((state) => ({
      selectedSatelliteId: null,
      selectedSatellite: null,
      selectedOrbitPath: null,
      cameraTarget: null,
      isInspectModalOpen: false,
      resetCameraTrigger: state.resetCameraTrigger + 1,
    })),
}))
