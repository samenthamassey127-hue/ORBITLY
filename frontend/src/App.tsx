import { Suspense, lazy } from 'react'
import { SearchBar } from './components/SearchBar'
import { SatellitePanel } from './components/SatellitePanel'
import { FeaturedSatellites } from './components/FeaturedSatellites'
import { StatsBar } from './components/StatsBar'
import { LaunchTracker } from './components/LaunchTracker'
import { ConceptVisualizer } from './components/ConceptVisualizer'
import { PersonalizedDashboard } from './components/PersonalizedDashboard'
import { AskOrbitlyAssistant } from './components/AskOrbitlyAssistant'
import { useFeaturedSatellites, useSelectSatellite } from './hooks/useSatellites'
import { useOrbitlyStore } from './store/orbitly'
import './index.css'

// Lazy-load the heavy 3D globe
const Globe3D = lazy(() => import('./components/Globe3D').then((m) => ({ default: m.Globe3D })))

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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse-slow" />
            <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10">
              <circle cx="16" cy="16" r="6" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
              <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
              <circle cx="28" cy="12" r="2" fill="#38bdf8" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ORBITLY</span>
          <span className="text-cyan-400/60 text-xs font-mono ml-1 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
            v2.0 PRO
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#explore" className="hover:text-cyan-400 transition-colors">3D Map</a>
          <a href="#launches" className="hover:text-cyan-400 transition-colors">Rocket Radar</a>
          <a href="#concepts" className="hover:text-cyan-400 transition-colors">Concepts</a>
          <a href="#dashboard" className="hover:text-cyan-400 transition-colors">My Dashboard</a>
          <a href="#assistant" className="hover:text-cyan-400 transition-colors">Ask AI</a>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/25 transition-colors font-mono"
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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-24 pb-12">
      {/* Data pipeline indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono font-semibold">
            LIVE CelesTrak GP Feed · SGP4 Propagated · AI Grounded
          </span>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-center font-extrabold mb-6" style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5rem)', lineHeight: 1.05 }}>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
          Space Data.
        </span>
        <br />
        <span className="text-white">Understood by Everyone.</span>
      </h1>

      <p className="text-center text-slate-400 max-w-2xl mx-auto mb-10 text-base sm:text-lg font-light leading-relaxed">
        Live satellite tracking, upcoming rocket launch countdowns, dual-mode plain-English orbital concepts,
        and an intelligent conversational AI grounded in real telemetry.
      </p>

      {/* Search */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <SearchBar />
      </div>

      {/* Stats row */}
      <div className="mb-8">
        <StatsBar />
      </div>

      {/* Quick feature pill navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <a
          href="#explore"
          className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
        >
          🌍 <span>3D Orbit Explorer</span>
        </a>
        <a
          href="#launches"
          className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
        >
          🚀 <span>Rocket Launch Radar</span>
        </a>
        <a
          href="#concepts"
          className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
        >
          📖 <span>Plain-English Concepts</span>
        </a>
        <a
          href="#dashboard"
          className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
        >
          🎯 <span>Role Dashboard & Quiz</span>
        </a>
        <a
          href="#assistant"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 font-semibold transition flex items-center gap-1.5"
        >
          ✨ <span>Ask ORBITLY AI</span>
        </a>
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
    <section id="explore" className="relative py-12 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Interactive Earth Telemetry
          </div>
          <h2 className="text-white text-3xl font-extrabold mb-3">
            Live 3D Satellite Radar
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Real orbital paths computed dynamically using SGP4 mathematical models and live CelesTrak TLE feeds
          </p>
        </div>

        {/* Globe + sidebar layout */}
        <div className="relative flex flex-col lg:flex-row gap-6 items-start">
          {/* Globe */}
          <div
            className="flex-1 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
            style={{ height: '70vh', minHeight: '520px', width: '100%' }}
          >
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(ellipse at center, #020c1b 0%, #000000 100%)',
              }}
            />
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                    <div className="text-slate-400 text-sm font-medium">Loading 3D space engine...</div>
                  </div>
                </div>
              }
            >
              <Globe3D />
            </Suspense>

            {/* Overlay labels */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-300 text-xs font-mono font-medium">LIVE · SGP4 Propagated</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="text-slate-400 text-xs bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800">
                Drag to rotate · Scroll to zoom · Click to inspect
              </div>
              {selectedSatellite && (
                <div className="text-amber-300 text-xs font-mono font-bold bg-slate-950/80 px-3 py-1 rounded-full border border-amber-500/30">
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
                    Mission Control Tips
                  </div>
                  <ul className="space-y-2.5 text-slate-300 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px]">1</span>
                      Search by satellite name, NORAD ID, or mission type
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px]">2</span>
                      Click any satellite to project its real-time 3D orbit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px]">3</span>
                      Ask ORBITLY AI to break down its physical mission
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
    <section className="py-20 px-6 border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Data Integrity & Scientific Sources
          </div>
          <h3 className="text-white text-2xl font-bold">100% Real Orbital Telemetry</h3>
          <p className="text-slate-400 text-xs mt-1">Grounded in authoritative space surveillance and flight logs</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'CelesTrak', desc: 'Two-Line Element sets updated multiple times daily', url: 'https://celestrak.org', badge: 'Primary TLE' },
            { name: 'SGP4 / SDP4', desc: 'Simplified General Perturbations orbital mechanics propagator', url: '#', badge: 'Astrodynamics' },
            { name: 'Google Gemini', desc: 'Synthesizes plain-English insights from raw numbers', url: 'https://aistudio.google.com', badge: 'AI Engine' },
            { name: 'NASA & ESA', desc: 'Space science, orbital debris tracking, and mission archives', url: 'https://nasa.gov', badge: 'Scientific Reference' },
            { name: 'US Space Command', desc: 'NORAD catalog identification and international tracking numbers', url: '#', badge: 'Catalog Standard' },
            { name: 'Three.js / WebGL', desc: 'GPU-accelerated realistic Earth and satellite trajectory rendering', url: 'https://threejs.org', badge: 'Visualization' },
          ].map((s) => (
            <div key={s.name} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{s.name}</span>
                <span className="text-cyan-400/80 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">{s.badge}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
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
    <footer className="py-10 px-6 border-t border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-xs font-mono">
          ORBITLY · Global Orbital Intelligence Platform · Real data, real physics, real orbits
        </div>
        <div className="flex items-center gap-6 text-slate-400 text-xs">
          <a href="/api/docs" target="_blank" className="hover:text-cyan-400 transition-colors">
            API Documentation
          </a>
          <a href="/api/health" target="_blank" className="hover:text-cyan-400 transition-colors">
            System Health
          </a>
          <span className="text-slate-500">Built with FastAPI, Three.js & Tailwind</span>
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
  const { selectSatellite } = useSelectSatellite()
  const { selectedSatellite } = useOrbitlyStore()

  const handleSelectSatelliteFromConcept = (noradId: string) => {
    selectSatellite(noradId)
    // Smooth scroll up to 3D Globe
    const el = document.getElementById('explore')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative min-h-screen bg-[#020408] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient effects */}
      <StarField />
      <GridOverlay />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content Stack */}
      <div className="relative z-10 space-y-12">
        <Nav />
        <Hero />

        {/* 1. Live 3D Globe Orbit Explorer */}
        <GlobeSection />

        {/* 2. Live Rocket Launch Radar */}
        <section id="launches" className="max-w-7xl mx-auto px-6 scroll-mt-20">
          <LaunchTracker />
        </section>

        {/* 3. Space Concepts in Simple Language (Dual-Mode) */}
        <section id="concepts" className="max-w-7xl mx-auto px-6 scroll-mt-20">
          <ConceptVisualizer onSelectSatellite={handleSelectSatelliteFromConcept} />
        </section>

        {/* 4. Personalized Space Dashboard */}
        <section id="dashboard" className="max-w-7xl mx-auto px-6 scroll-mt-20">
          <PersonalizedDashboard />
        </section>

        {/* 5. Ask ORBITLY AI Space Assistant */}
        <section id="assistant" className="max-w-7xl mx-auto px-6 scroll-mt-20">
          <AskOrbitlyAssistant
            currentSatelliteId={selectedSatellite?.satellite.id}
            currentSatelliteName={selectedSatellite?.satellite.name}
          />
        </section>

        <DataSources />
        <Footer />
      </div>
    </div>
  )
}
