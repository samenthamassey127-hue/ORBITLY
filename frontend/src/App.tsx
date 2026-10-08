import { Suspense, lazy, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { SatellitePanel } from './components/SatellitePanel'
import { FeaturedSatellites } from './components/FeaturedSatellites'
import { StatsBar } from './components/StatsBar'
import { useFeaturedSatellites } from './hooks/useSatellites'
import { useOrbitlyStore } from './store/orbitly'
import './index.css'

// Lazy-load the heavy 3D globe
const Globe3D = lazy(() => import('./components/Globe3D').then(m => ({ default: m.Globe3D })))

// ──────────────────────────────────────────────────
// Background star particles
// ──────────────────────────────────────────────────
function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 150 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            '--duration': `${Math.random() * 4 + 2}s`,
            '--delay': `${Math.random() * 4}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────
// Grid overlay
// ──────────────────────────────────────────────────
function GridOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

// ──────────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse-slow" />
            <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10">
              <circle cx="16" cy="16" r="6" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
              <circle cx="28" cy="12" r="2" fill="#60a5fa" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">ORBITLY</span>
          <span className="text-white/20 text-xs font-mono ml-1">v1.0</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
          <a href="#explore" className="hover:text-white/80 transition-colors">Explore</a>
          <a href="#about" className="hover:text-white/80 transition-colors">About</a>
          <a
            href="http://localhost:8000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/25 transition-colors text-xs font-mono"
          >
            API Docs
          </a>
        </div>
      </div>
    </nav>
  )
}

// ──────────────────────────────────────────────────
// Hero section
// ──────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      {/* Data pipeline indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-mono">LIVE · CelesTrak · SGP4</span>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-center font-bold mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.05 }}>
        <span className="text-gradient">Space Data.</span>
        <br />
        <span className="text-white/80">Finally Human.</span>
      </h1>

      <p className="text-center text-white/45 max-w-xl mx-auto mb-10 text-lg font-light leading-relaxed">
        Real satellite data from CelesTrak, computed by SGP4 orbital mechanics,
        translated into language anyone can understand.
      </p>

      {/* Search */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <SearchBar />
      </div>

      {/* Stats row */}
      <div className="mb-16">
        <StatsBar />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
        <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────
// How it works section
// ──────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: '📡',
      label: 'CelesTrak',
      desc: 'Real TLE data fetched from the authoritative satellite catalog',
      tech: 'TLE / JSON feed',
    },
    {
      icon: '⚙️',
      label: 'Python Backend',
      desc: 'FastAPI processes, validates, and normalizes raw TLE data',
      tech: 'FastAPI · Pydantic',
    },
    {
      icon: '🔭',
      label: 'SGP4 Propagation',
      desc: 'Real orbital math computes position from raw TLE elements',
      tech: 'sgp4 library',
    },
    {
      icon: '🧠',
      label: 'Intelligence Layer',
      desc: 'Gemini AI transforms technical numbers into plain English',
      tech: 'Gemini · Deterministic fallback',
    },
    {
      icon: '🌍',
      label: '3D Visualization',
      desc: 'Three.js renders orbit paths and positions on an interactive Earth',
      tech: 'Three.js · R3F',
    },
  ]

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-blue-400/60 text-xs uppercase tracking-widest mb-3">Architecture</div>
          <h2 className="text-white text-3xl font-bold mb-4">How the Data Pipeline Works</h2>
          <p className="text-white/40 max-w-lg mx-auto">
            Not a mockup — a real data pipeline from satellite catalog to your screen.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center flex-1">
              <div className="flex flex-col items-center text-center p-4 flex-1">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="text-white font-semibold text-sm mb-1">{step.label}</div>
                <div className="text-white/50 text-xs leading-relaxed mb-2">{step.desc}</div>
                <div className="text-blue-400/60 font-mono text-xs">{step.tech}</div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block text-white/15 text-2xl mx-2">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────
// 3D Globe section + satellite panel
// ──────────────────────────────────────────────────
function GlobeSection() {
  const { selectedSatellite } = useOrbitlyStore()

  return (
    <section id="explore" className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-blue-400/60 text-xs uppercase tracking-widest mb-3">Live Orbital Visualization</div>
          <h2 className="text-white text-3xl font-bold mb-3">
            Earth's Active Satellites
          </h2>
          <p className="text-white/40 text-sm">
            Select a satellite to see its real orbit path computed from live TLE data
          </p>
        </div>

        {/* Globe + sidebar layout */}
        <div className="relative flex flex-col lg:flex-row gap-6 items-start">
          {/* Globe */}
          <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/8"
            style={{ height: '70vh', minHeight: '500px' }}>
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(ellipse at center, #020c1b 0%, #000000 100%)',
              }}
            />
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-white/40 text-sm">Loading 3D engine...</div>
                </div>
              </div>
            }>
              <Globe3D />
            </Suspense>

            {/* Overlay labels */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-white/50 text-xs font-mono">LIVE · SGP4 propagated</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="text-white/25 text-xs">Drag to rotate · Scroll to zoom</div>
              {selectedSatellite && (
                <div className="text-yellow-400/70 text-xs font-mono">
                  ◉ {selectedSatellite.satellite.name}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            {selectedSatellite ? (
              <SatellitePanel />
            ) : (
              <div className="flex flex-col gap-4">
                {/* Quick guide */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-3">How to Use</div>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">1.</span> Search for a satellite above
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">2.</span> Select it to see its orbit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">3.</span> Read the plain-English explanation
                    </li>
                  </ul>
                </div>
                <FeaturedSatellites />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────
// Data sources footer section
// ──────────────────────────────────────────────────
function DataSources() {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Data Integrity</div>
          <h3 className="text-white/70 text-xl font-medium">Real Sources, Not Fiction</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'CelesTrak', desc: 'Two-Line Element sets for all tracked objects', url: 'https://celestrak.org', badge: 'Primary' },
            { name: 'SGP4', desc: 'Industry-standard orbital propagation model', url: '#', badge: 'Algorithm' },
            { name: 'Google Gemini', desc: 'AI explanations grounded in real data', url: 'https://aistudio.google.com', badge: 'AI Layer' },
            { name: 'Launch Library 2', desc: 'Mission and launch data', url: 'https://thespacedevs.com', badge: 'Optional' },
            { name: 'NORAD', desc: 'Satellite catalog IDs and object tracking', url: '#', badge: 'Standard' },
            { name: 'Three.js / R3F', desc: '3D orbital visualization engine', url: 'https://threejs.org', badge: 'Renderer' },
          ].map((s) => (
            <div key={s.name} className="bg-white/3 border border-white/6 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{s.name}</span>
                <span className="text-white/30 text-xs font-mono">{s.badge}</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white/25 text-xs font-mono">
          ORBITLY · Hackathon Prototype · Real data, real backend, real orbits
        </div>
        <div className="flex items-center gap-4 text-white/25 text-xs">
          <a href="http://localhost:8000/api/docs" target="_blank" className="hover:text-white/50 transition-colors">
            API Docs
          </a>
          <a href="http://localhost:8000/api/health" target="_blank" className="hover:text-white/50 transition-colors">
            Health Check
          </a>
          <span>Built with FastAPI + Three.js</span>
        </div>
      </div>
    </footer>
  )
}

// ──────────────────────────────────────────────────
// App root
// ──────────────────────────────────────────────────
export default function App() {
  useFeaturedSatellites()

  return (
    <div className="relative min-h-screen bg-[#020408]">
      {/* Ambient effects */}
      <StarField />
      <GridOverlay />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 -right-32 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -left-32 w-96 h-96 bg-purple-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <Nav />
        <Hero />
        <GlobeSection />
        <HowItWorks />
        <DataSources />
        <Footer />
      </div>
    </div>
  )
}
