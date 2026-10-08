import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useOrbitlyStore } from '../store/orbitly'
import { useSelectSatellite } from '../hooks/useSatellites'
import type { OrbitPath } from '../types/satellite'

// ────────────────────────────────────────────────────────
// Earth mesh — interactive 3D planet with atmosphere
// ────────────────────────────────────────────────────────
function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const cloudsRef = useRef<THREE.Mesh>(null!)
  const atmosRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.03
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.038
    if (atmosRef.current) atmosRef.current.rotation.y += delta * 0.032
  })

  return (
    <group>
      {/* Ocean body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#0c2548"
          emissive="#030b18"
          emissiveIntensity={0.3}
          specular="#3888d8"
          shininess={45}
        />
      </mesh>

      {/* Lat/Long orbital grid layer */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1.002, 36, 18]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe={true}
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Cloud & land subtle glow layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.008, 48, 48]} />
        <meshStandardMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
          roughness={0.9}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosRef}>
        <sphereGeometry args={[1.06, 32, 32]} />
        <meshPhongMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer thermosphere haze */}
      <mesh>
        <sphereGeometry args={[1.14, 32, 32]} />
        <meshBasicMaterial
          color="#1e40af"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

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
// Orbit path line
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
      {/* Primary orbit trace */}
      <Line
        points={points}
        color="#38bdf8"
        lineWidth={2.2}
        transparent
        opacity={0.85}
      />
      {/* Ambient orbit halo */}
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
// Satellite dot (Interactive beacon in orbit)
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
        const s = 1 + Math.sin(t * 4) * 0.25
        meshRef.current.scale.setScalar(s)
      }
    }
    if (ringRef.current && selected) {
      ringRef.current.scale.setScalar(1 + (t % 1) * 1.2)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = 1 - (t % 1)
    }
  })

  return (
    <group position={pos}>
      {/* Satellite core beacon */}
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
        <sphereGeometry args={[selected ? 0.024 : 0.012, 12, 12]} />
        <meshBasicMaterial color={selected ? '#fbbf24' : '#60a5fa'} />
      </mesh>

      {/* Selected pulsing sonar ring */}
      {selected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.025, 0.035, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Telemetry HUD Label */}
      {selected && (
        <Html distanceFactor={4} position={[0, 0.04, 0]} center>
          <div className="pointer-events-none select-none px-2 py-1 rounded bg-[#06101e]/90 border border-amber-400/60 shadow-lg backdrop-blur-md whitespace-nowrap">
            <div className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {name}
            </div>
            <div className="text-[9px] text-white/60 font-mono">
              {Math.round(altKm).toLocaleString()} km alt
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// ────────────────────────────────────────────────────────
// Camera controller — smoothly flies to selected satellite
// ────────────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree()
  const cameraTarget = useOrbitlyStore((s) => s.cameraTarget)
  const targetRef = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (cameraTarget) {
      const [lat, lon, altKm] = cameraTarget
      const pos = latLonAltToXYZ(lat, lon, altKm + 1800)
      targetRef.current = pos
    }
  }, [cameraTarget])

  useFrame(() => {
    if (targetRef.current) {
      camera.position.lerp(targetRef.current, 0.04)
      camera.lookAt(0, 0, 0)
    }
  })

  return null
}

// ────────────────────────────────────────────────────────
// Scene — wires all 3D assets together
// ────────────────────────────────────────────────────────
function Scene() {
  const { selectedSatellite, selectedOrbitPath, featuredSatellites } = useOrbitlyStore()
  const { selectSatellite } = useSelectSatellite()

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 3, 6]} intensity={1.6} color="#fffcf0" castShadow />
      <pointLight position={[-10, -4, -6]} intensity={0.3} color="#3b82f6" />

      {/* Deep Space Starfield */}
      <Stars
        radius={120}
        depth={60}
        count={9000}
        factor={4.5}
        saturation={0.1}
        fade
        speed={0.4}
      />

      {/* Earth */}
      <EarthMesh />

      {/* Selected Orbit Path Trajectory */}
      {selectedOrbitPath && <OrbitLine orbitPath={selectedOrbitPath} />}

      {/* Selected Satellite Real-Time Position Dot */}
      {selectedSatellite?.satellite.derived?.latitude != null && (
        <SatelliteDot
          lat={selectedSatellite.satellite.derived.latitude}
          lon={selectedSatellite.satellite.derived.longitude!}
          altKm={selectedSatellite.satellite.derived.altitude_km || 420}
          selected={true}
          name={selectedSatellite.satellite.name}
        />
      )}

      {/* Active Satellites Constellation (featured catalog) */}
      {featuredSatellites.map((sat, idx) => {
        if (selectedSatellite?.satellite.id === sat.id) return null
        const alt = sat.altitude_km || 500
        // Distribute featured satellites naturally across celestial coordinates
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

      {/* Camera flight smoothing */}
      <CameraController />

      {/* Orbit Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={1.4}
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
// Globe3D Component
// ────────────────────────────────────────────────────────
export function Globe3D() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
