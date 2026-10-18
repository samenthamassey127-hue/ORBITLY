import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, ZoomIn, Info, Sparkles, Compass } from 'lucide-react'
import { useOrbitlyStore } from '../store/orbitly'
import { useSelectSatellite } from '../hooks/useSatellites'
import type { OrbitPath } from '../types/satellite'
import { createDottedEarthTexture } from '../utils/earthTexture'
import { SatelliteCloseUpModal } from './SatelliteCloseUpModal'

// ────────────────────────────────────────────────────────
// Major World Cities Dataset (Revealed on Zoom)
// ────────────────────────────────────────────────────────
interface WorldCity {
  name: string
  country: string
  lat: number
  lon: number
}

const WORLD_CITIES: WorldCity[] = [
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.76 },
  { name: 'London', country: 'UK', lat: 51.50, lon: -0.12 },
  { name: 'Paris', country: 'France', lat: 48.85, lon: 2.35 },
  { name: 'New York', country: 'USA', lat: 40.71, lon: -74.00 },
  { name: 'San Francisco', country: 'USA', lat: 37.77, lon: -122.41 },
  { name: 'New Delhi', country: 'India', lat: 28.61, lon: 77.20 },
  { name: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87 },
  { name: 'Beijing', country: 'China', lat: 39.90, lon: 116.40 },
  { name: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47 },
  { name: 'Dubai', country: 'UAE', lat: 25.20, lon: 55.27 },
  { name: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.23 },
  { name: 'Sydney', country: 'Australia', lat: -33.86, lon: 151.20 },
  { name: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.81 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.90, lon: -43.17 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.92, lon: 18.42 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.40 },
  { name: 'Moscow', country: 'Russia', lat: 55.75, lon: 37.61 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.60, lon: -58.38 },
  { name: 'Seoul', country: 'South Korea', lat: 37.56, lon: 126.97 },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.29, lon: 36.82 },
]

// ────────────────────────────────────────────────────────
// Convert lat/lon/alt to 3D XYZ position
// ────────────────────────────────────────────────────────
function latLonAltToXYZ(lat: number, lon: number, altKm: number, earthRadiusUnits = 1): THREE.Vector3 {
  const EARTH_RADIUS_KM = 6371
  // Scale altitude visually so LEO (400km) is clearly detached from surface
  const visualAltKm = Math.max(altKm, 180)
  const r = earthRadiusUnits * (1 + (visualAltKm / EARTH_RADIUS_KM) * 1.5)
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

// ────────────────────────────────────────────────────────
// Dotted Earth Mesh — Exact match to the reference image
// ────────────────────────────────────────────────────────
function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosRef = useRef<THREE.Mesh>(null!)

  // Generate the glowing dotted texture once
  const dottedTexture = useMemo(() => createDottedEarthTexture(), [])

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.025
    if (atmosRef.current) atmosRef.current.rotation.y += delta * 0.028
  })

  return (
    <group>
      {/* 1. Base Dotted Earth Sphere */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={dottedTexture}
          emissive="#0c2340"
          emissiveIntensity={0.5}
          specular="#38bdf8"
          shininess={35}
        />
      </mesh>

      {/* 2. Concentric Coordinate Wireframe Grid */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1.003, 36, 18]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe={true}
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* 3. Luminous Equatorial Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.004, 1.008, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Atmospheric Rim Halo (BackSide Fresnel Glow) */}
      <mesh ref={atmosRef}>
        <sphereGeometry args={[1.055, 48, 48]} />
        <meshPhongMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Outer Thermosphere Haze */}
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ────────────────────────────────────────────────────────
// Cities Layer — Lights up when user zooms in
// ────────────────────────────────────────────────────────
function CitiesLayer({ zoomClose }: { zoomClose: boolean }) {
  if (!zoomClose) return null

  return (
    <group>
      {WORLD_CITIES.map((city) => {
        const pos = latLonAltToXYZ(city.lat, city.lon, 0, 1.004)
        return (
          <group key={city.name} position={pos}>
            {/* Glowing pin dot */}
            <mesh>
              <sphereGeometry args={[0.007, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>

            {/* City Label */}
            <Html distanceFactor={3.2} position={[0, 0.015, 0]} center>
              <div className="pointer-events-none select-none px-1.5 py-0.5 rounded bg-slate-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-200 backdrop-blur-sm whitespace-nowrap shadow-md">
                <span className="font-bold text-white">{city.name}</span>
                <span className="text-cyan-400/80 ml-1">({city.country})</span>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

// ────────────────────────────────────────────────────────
// Orbit Path Trace
// ────────────────────────────────────────────────────────
function OrbitLine({ orbitPath }: { orbitPath: OrbitPath }) {
  const points = useMemo(() => {
    return orbitPath.orbit_path.map((p) =>
      latLonAltToXYZ(p.lat, p.lon, p.alt_km)
    )
  }, [orbitPath])

  if (points.length < 2) return null

  return (
    <group>
      <Line
        points={points}
        color="#38bdf8"
        lineWidth={2.4}
        transparent
        opacity={0.9}
      />
      <Line
        points={points}
        color="#60a5fa"
        lineWidth={4.5}
        transparent
        opacity={0.25}
      />
    </group>
  )
}

// ────────────────────────────────────────────────────────
// Satellite Dot with Beacon & Close-Up Trigger
// ────────────────────────────────────────────────────────
function SatelliteDot({
  lat,
  lon,
  altKm,
  selected,
  name,
  onClick,
}: {
  lat: number
  lon: number
  altKm: number
  selected: boolean
  name: string
  onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const pos = useMemo(() => latLonAltToXYZ(lat, lon, altKm), [lat, lon, altKm])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      if (selected) {
        const s = 1 + Math.sin(t * 4) * 0.3
        meshRef.current.scale.setScalar(s)
      }
    }
    if (ringRef.current && selected) {
      ringRef.current.scale.setScalar(1 + (t % 1) * 1.3)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = 1 - (t % 1)
    }
  })

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[selected ? 0.026 : 0.013, 12, 12]} />
        <meshBasicMaterial color={selected ? '#38bdf8' : '#60a5fa'} />
      </mesh>

      {selected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.028, 0.04, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {selected && (
        <Html distanceFactor={4} position={[0, 0.04, 0]} center>
          <div className="pointer-events-none select-none px-2.5 py-1 rounded bg-[#030a16]/95 border border-cyan-400/80 shadow-2xl backdrop-blur-md whitespace-nowrap">
            <div className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              {name}
            </div>
            <div className="text-[9px] text-slate-300 font-mono">
              {Math.round(altKm).toLocaleString()} km alt · Scroll in for photo
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// ────────────────────────────────────────────────────────
// Camera Controller & Zoom Detection
// ────────────────────────────────────────────────────────
function CameraController({
  onZoomChange,
}: {
  onZoomChange: (isClose: boolean) => void
}) {
  const { camera } = useThree()
  const cameraTarget = useOrbitlyStore((s) => s.cameraTarget)
  const resetCameraTrigger = useOrbitlyStore((s) => s.resetCameraTrigger)
  const selectedSatellite = useOrbitlyStore((s) => s.selectedSatellite)
  const setIsInspectModalOpen = useOrbitlyStore((s) => s.setIsInspectModalOpen)
  const isInspectModalOpen = useOrbitlyStore((s) => s.isInspectModalOpen)

  const targetPosRef = useRef<THREE.Vector3 | null>(null)
  const defaultPos = useMemo(() => new THREE.Vector3(0, 0, 3.4), [])

  // When target changes, calculate new camera position
  useEffect(() => {
    if (cameraTarget) {
      const [lat, lon, altKm] = cameraTarget
      const pos = latLonAltToXYZ(lat, lon, altKm + 1600)
      targetPosRef.current = pos
    }
  }, [cameraTarget])

  // Handle explicit reset trigger
  useEffect(() => {
    if (resetCameraTrigger > 0) {
      targetPosRef.current = defaultPos
    }
  }, [resetCameraTrigger, defaultPos])

  useFrame(() => {
    if (targetPosRef.current) {
      camera.position.lerp(targetPosRef.current, 0.05)
      camera.lookAt(0, 0, 0)
      if (camera.position.distanceTo(targetPosRef.current) < 0.05) {
        targetPosRef.current = null
      }
    }

    // Measure zoom distance to Earth center
    const distToCenter = camera.position.length()
    const isZoomClose = distToCenter < 2.5
    onZoomChange(isZoomClose)

    // Measure proximity to selected satellite for automatic photo inspection
    if (selectedSatellite?.satellite.derived?.latitude != null) {
      const sat = selectedSatellite.satellite.derived
      const satPos = latLonAltToXYZ(sat.latitude!, sat.longitude || 0, sat.altitude_km || 420)
      const distToSat = camera.position.distanceTo(satPos)

      // When the user scrolls in close to the satellite (< 0.75 distance)
      if (distToSat < 0.75 && !isInspectModalOpen) {
        setIsInspectModalOpen(true)
      }
    }
  })

  return null
}

// ────────────────────────────────────────────────────────
// Scene Composition
// ────────────────────────────────────────────────────────
function Scene({ onZoomChange }: { onZoomChange: (close: boolean) => void }) {
  const { selectedSatellite, selectedOrbitPath, featuredSatellites, setIsInspectModalOpen } = useOrbitlyStore()
  const { selectSatellite } = useSelectSatellite()
  const [zoomClose, setZoomClose] = useState(false)

  const handleZoomUpdate = (isClose: boolean) => {
    setZoomClose(isClose)
    onZoomChange(isClose)
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 3, 6]} intensity={1.8} color="#f0f9ff" />
      <pointLight position={[-10, -4, -6]} intensity={0.4} color="#38bdf8" />

      {/* Deep Space Background Stars */}
      <Stars
        radius={140}
        depth={60}
        count={8000}
        factor={4.5}
        saturation={0.1}
        fade
        speed={0.4}
      />

      {/* Exact Match Dotted Earth */}
      <EarthMesh />

      {/* Cities Layer (visible on zoom) */}
      <CitiesLayer zoomClose={zoomClose} />

      {/* Selected Orbit Line */}
      {selectedOrbitPath && <OrbitLine orbitPath={selectedOrbitPath} />}

      {/* Selected Satellite Dot */}
      {selectedSatellite?.satellite.derived?.latitude != null && (
        <SatelliteDot
          lat={selectedSatellite.satellite.derived.latitude}
          lon={selectedSatellite.satellite.derived.longitude!}
          altKm={selectedSatellite.satellite.derived.altitude_km || 420}
          selected={true}
          name={selectedSatellite.satellite.name}
          onClick={() => setIsInspectModalOpen(true)}
        />
      )}

      {/* Featured Satellites Constellation */}
      {featuredSatellites.map((sat, idx) => {
        if (selectedSatellite?.satellite.id === sat.id) return null
        const alt = sat.altitude_km || 500
        const lat = ((idx * 43) % 130) - 65
        const lon = ((idx * 67) % 360) - 180
        return (
          <SatelliteDot
            key={sat.id}
            lat={lat}
            lon={lon}
            altKm={alt}
            selected={false}
            name={sat.name}
            onClick={() => selectSatellite(sat.id)}
          />
        )
      })}

      <CameraController onZoomChange={handleZoomUpdate} />

      <OrbitControls
        enablePan={false}
        minDistance={1.3}
        maxDistance={7}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
      />
    </>
  )
}

// ────────────────────────────────────────────────────────
// Globe3D Main Component
// ────────────────────────────────────────────────────────
export function Globe3D() {
  const {
    selectedSatellite,
    clearSelection,
    isInspectModalOpen,
    setIsInspectModalOpen,
    setCameraTarget,
  } = useOrbitlyStore()

  const [isZoomClose, setIsZoomClose] = useState(false)

  // Zoom directly to satellite
  const handleZoomToSatellite = () => {
    if (selectedSatellite?.satellite.derived?.latitude != null) {
      const der = selectedSatellite.satellite.derived
      setCameraTarget([der.latitude!, der.longitude || 0, der.altitude_km || 420])
      setIsInspectModalOpen(true)
    }
  }

  return (
    <div className="w-full h-full relative select-none">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene onZoomChange={setIsZoomClose} />
      </Canvas>

      {/* Close-Up Satellite Photo & Inspection Modal */}
      {isInspectModalOpen && selectedSatellite && <SatelliteCloseUpModal />}

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {selectedSatellite && (
          <>
            {/* Zoom to Satellite / Photo view button */}
            <button
              onClick={handleZoomToSatellite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md transition shadow-lg"
              title="Zoom into satellite and inspect photo"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Inspect Photo</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold backdrop-blur-md transition shadow-lg"
              title="Reset view and deselect satellite"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset View</span>
            </button>
          </>
        )}
      </div>

      {/* Bottom Center Indicator (Matching the reference aesthetic) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-300 backdrop-blur-md flex items-center gap-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {selectedSatellite ? (
            <span>
              Tracking: <strong className="text-cyan-300">{selectedSatellite.satellite.name}</strong> · Scroll in to view spacecraft image
            </span>
          ) : (
            <span>
              {isZoomClose
                ? '🔍 Zoomed In · Cities & Terrestrial Nodes Active'
                : 'Scroll to Zoom · Select any satellite beacon to inspect'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
