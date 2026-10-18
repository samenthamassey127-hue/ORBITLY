export interface SatelliteVisualInfo {
  imageUrl: string
  fallbackUrl: string
  modelName: string
  dimensions: string
  mass: string
  solarSpan: string
  launchVehicle: string
  purpose: string
  badgeColor: string
}

export const SATELLITE_VISUALS: Record<string, SatelliteVisualInfo> = {
  // International Space Station (NORAD 25544)
  '25544': {
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    modelName: 'International Space Station (ISS)',
    dimensions: '109 m × 73 m (Football field size)',
    mass: '450,000 kg (~992,000 lbs)',
    solarSpan: '73 meters (Solar array wing area: 2,400 m²)',
    launchVehicle: 'Proton-K / Space Shuttle Assembly',
    purpose: 'Permanent human microgravity research laboratory and orbital outpost',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  // Hubble Space Telescope (NORAD 20580)
  '20580': {
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    modelName: 'Hubble Space Telescope (HST)',
    dimensions: '13.2 m length × 4.2 m diameter',
    mass: '11,110 kg',
    solarSpan: '7.6 meters',
    launchVehicle: 'Space Shuttle Discovery (STS-31)',
    purpose: 'Deep-space optical and ultraviolet astrophysical telescope',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
  // Tiangong Space Station (NORAD 48274)
  '48274': {
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    modelName: 'Tiangong Chinese Space Station (CSS)',
    dimensions: 'T-shaped complex, ~55 m across modules',
    mass: '~100,000 kg',
    solarSpan: 'Dual large flexible solar wings (30m each)',
    launchVehicle: 'Long March 5B',
    purpose: 'Crewed multi-module low Earth orbit space station',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
}

export function getSatelliteVisual(noradId?: number | string, name?: string): SatelliteVisualInfo {
  const idStr = String(noradId || '')
  if (SATELLITE_VISUALS[idStr]) {
    return SATELLITE_VISUALS[idStr]
  }

  const nameUpper = (name || '').toUpperCase()

  // Match by keyword
  if (nameUpper.includes('ISS') || nameUpper.includes('ZARYA')) {
    return SATELLITE_VISUALS['25544']
  }
  if (nameUpper.includes('HUBBLE') || nameUpper.includes('HST')) {
    return SATELLITE_VISUALS['20580']
  }
  if (nameUpper.includes('TIANGONG') || nameUpper.includes('CSS') || nameUpper.includes('TIANHE')) {
    return SATELLITE_VISUALS['48274']
  }
  if (nameUpper.includes('STARLINK')) {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80',
      fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      modelName: `${name} (Starlink Gen2 Mini)`,
      dimensions: '3.2 m × 1.6 m flat-panel bus',
      mass: '~800 kg',
      solarSpan: 'Single 12-meter deployable solar array',
      launchVehicle: 'Falcon 9 Block 5',
      purpose: 'Global broadband internet constellation with krypton/argon ion thrusters',
      badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    }
  }
  if (nameUpper.includes('GOES') || nameUpper.includes('METEOSAT') || nameUpper.includes('NOAA')) {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      fallbackUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      modelName: `${name} (Advanced Baseline Imager)`,
      dimensions: '6.0 m × 5.6 m × 3.9 m in-orbit config',
      mass: '5,192 kg fueled',
      solarSpan: 'Single solar array wing',
      launchVehicle: 'Atlas V / Falcon Heavy',
      purpose: 'Continuous geostationary meteorological & atmospheric tracking',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    }
  }
  if (nameUpper.includes('NAVSTAR') || nameUpper.includes('GPS')) {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80',
      fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      modelName: `${name} (GPS Block III)`,
      dimensions: '2.5 m bus diameter with 34 m cross-dipole antennas',
      mass: '3,880 kg',
      solarSpan: 'Dual gallium arsenide solar wings (22 meters)',
      launchVehicle: 'Falcon 9 / Delta IV',
      purpose: 'High-precision global positioning with Rubidium atomic clocks',
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    }
  }

  // Generic aerospace satellite profile
  return {
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    modelName: name || 'Orbital Spacecraft',
    dimensions: 'Variable modular spacecraft bus',
    mass: 'Operational payload',
    solarSpan: 'Dual photovoltaic arrays',
    launchVehicle: 'Commercial launch vehicle',
    purpose: 'Active orbital mission registered with CelesTrak & US Space Command',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  }
}
