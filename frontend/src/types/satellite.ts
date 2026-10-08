// Satellite types — mirrors the Python Pydantic models exactly

export interface OrbitalElements {
  inclination_deg: number | null
  raan_deg: number | null
  eccentricity: number | null
  arg_perigee_deg: number | null
  mean_anomaly_deg: number | null
  mean_motion_rev_per_day: number | null
  epoch: string | null
  bstar: number | null
}

export interface DerivedOrbitalData {
  altitude_km: number | null
  apogee_km: number | null
  perigee_km: number | null
  period_minutes: number | null
  velocity_km_s: number | null
  orbit_type: 'LEO' | 'MEO' | 'GEO' | 'HEO' | null
  latitude: number | null
  longitude: number | null
  position_x: number | null
  position_y: number | null
  position_z: number | null
}

export interface LaunchInfo {
  launch_date: string | null
  launch_site: string | null
  rocket: string | null
  mission_description: string | null
  mission_type: string | null
}

export interface FieldExplanation {
  field: string
  value: string
  unit: string | null
  explanation: string
  analogy: string | null
}

export interface SatelliteModel {
  id: string
  norad_id: number
  name: string
  international_designator: string | null
  object_type: string | null
  operational_status: string | null
  country: string | null
  owner: string | null
  tle_line1: string | null
  tle_line2: string | null
  orbital_elements: OrbitalElements | null
  derived: DerivedOrbitalData | null
  launch: LaunchInfo | null
  explanations: FieldExplanation[] | null
  source: string
  last_updated: string
  is_stale: boolean
}

export interface SatelliteListItem {
  id: string
  norad_id: number
  name: string
  orbit_type: string | null
  altitude_km: number | null
  country: string | null
  object_type: string | null
  operational_status: string | null
  last_updated: string
  is_stale: boolean
}

export interface SearchResult {
  query: string
  total: number
  results: SatelliteListItem[]
  data_source: string
  retrieved_at: string
}

export interface SatelliteDetail {
  satellite: SatelliteModel
  explanations: FieldExplanation[]
  summary: string | null
}

export interface SatellitePosition {
  satellite_id: string
  name: string
  position: {
    lat: number
    lon: number
    alt_km: number
    velocity_km_s: number
    position_eci: { x: number; y: number; z: number }
    timestamp: string
    error: string | null
  }
  computed_at: string
  method: string
  tle_epoch: string | null
}

export interface OrbitPath {
  satellite_id: string
  name: string
  period_minutes: number | null
  orbit_path: Array<{ lat: number; lon: number; alt_km: number }>
  point_count: number
  computed_at: string
}

export interface CatalogStats {
  total: number
  payloads: number
  debris: number
  leo_count: number
  geo_count: number
  last_updated: string | null
}
