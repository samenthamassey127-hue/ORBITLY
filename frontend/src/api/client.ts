import axios from 'axios'
import type {
  SearchResult,
  SatelliteDetail,
  SatelliteListItem,
  SatellitePosition,
  OrbitPath,
  CatalogStats,
  RocketLaunch,
  SpaceConcept,
  RoleDashboardData,
  AssistantQuery,
  AssistantResponse,
} from '../types/satellite'

const BASE_URL = import.meta.env.VITE_API_BASE || ''

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Satellites ─────────────────────────────────

export async function getFeaturedSatellites(limit = 12): Promise<SatelliteListItem[]> {
  const { data } = await api.get<SatelliteListItem[]>('/api/satellites/featured', {
    params: { limit },
  })
  return data
}

export async function getSatelliteDetail(id: string): Promise<SatelliteDetail> {
  const { data } = await api.get<SatelliteDetail>(`/api/satellites/${id}`)
  return data
}

export async function getSatellitePosition(id: string): Promise<SatellitePosition> {
  const { data } = await api.get<SatellitePosition>(`/api/satellites/${id}/position`)
  return data
}

export async function getSatelliteOrbit(id: string, points = 180): Promise<OrbitPath> {
  const { data } = await api.get<OrbitPath>(`/api/satellites/${id}/orbit`, {
    params: { points },
  })
  return data
}

export async function getCatalogStats(): Promise<CatalogStats> {
  const { data } = await api.get<CatalogStats>('/api/satellites/stats')
  return data
}

// ── Search ─────────────────────────────────────

export async function searchSatellites(query: string, limit = 20): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>('/api/search', {
    params: { q: query, limit },
  })
  return data
}

// ── Health ─────────────────────────────────────

export async function getHealth(): Promise<{
  status: string
  timestamp: string
  cache: Record<string, unknown>
  catalog: CatalogStats
}> {
  const { data } = await api.get('/api/health')
  return data
}

// ── Extended Space Features ────────────────────

export async function getLaunches(provider?: string, missionType?: string): Promise<RocketLaunch[]> {
  const { data } = await api.get<RocketLaunch[]>('/api/launches', {
    params: { provider, mission_type: missionType },
  })
  return data
}

export async function getConcepts(): Promise<SpaceConcept[]> {
  const { data } = await api.get<SpaceConcept[]>('/api/concepts')
  return data
}

export async function getDashboardRole(role: string): Promise<RoleDashboardData> {
  const { data } = await api.get<RoleDashboardData>(`/api/dashboard/${role}`)
  return data
}

export async function askAssistant(query: AssistantQuery): Promise<AssistantResponse> {
  const { data } = await api.post<AssistantResponse>('/api/assistant/ask', query)
  return data
}

