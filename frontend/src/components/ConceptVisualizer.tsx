import React, { useState, useEffect } from 'react'
import { BookOpen, Sparkles, GraduationCap, ChevronRight, Activity, Zap } from 'lucide-react'
import type { SpaceConcept } from '../types/satellite'
import { getConcepts } from '../api/client'

interface ConceptVisualizerProps {
  onSelectSatellite?: (noradId: string) => void
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ onSelectSatellite }) => {
  const [concepts, setConcepts] = useState<SpaceConcept[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string>('orbit')
  const [mode, setMode] = useState<'eli10' | 'college'>('eli10')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await getConcepts()
        if (!cancelled) {
          setConcepts(data)
          if (data.length > 0) {
            setSelectedSlug(data[0].slug)
          }
        }
      } catch (e) {
        console.error('Failed to load concepts', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const activeConcept = concepts.find((c) => c.slug === selectedSlug) || concepts[0]

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                Space Concepts in Simple Language
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  DUAL-MODE ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand orbital dynamics without headache — switch between 10-year-old and college level
              </p>
            </div>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setMode('eli10')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'eli10'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explain Like I'm 10
          </button>

          <button
            onClick={() => setMode('college')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'college'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            College / Engineering
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading space concepts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          {/* Concept Tabs Navigation */}
          <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin">
            {concepts.map((c) => {
              const isSelected = c.slug === selectedSlug
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedSlug(c.slug)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group min-w-[220px] lg:min-w-0 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {c.icon}
                    </span>
                    <div>
                      <h4
                        className={`text-sm font-semibold transition ${
                          isSelected ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {c.tagline}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Active Concept Explanation Showcase */}
          {activeConcept && (
            <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeConcept.icon}</span>
                    <h3 className="text-lg font-bold text-slate-100">
                      {activeConcept.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      mode === 'eli10'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {mode === 'eli10' ? '🐣 Kid / Plain-English Mode' : '📐 Aerospace Engineering Mode'}
                  </span>
                </div>

                <p className="text-sm text-cyan-300/90 font-medium italic mb-4">
                  "{activeConcept.tagline}"
                </p>

                {/* Explanation text */}
                <div className="text-slate-200 text-sm leading-relaxed p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
                  {mode === 'eli10' ? (
                    <p className="space-y-2">
                      <span className="font-semibold text-amber-400 block mb-1">Simple Metaphor:</span>
                      {activeConcept.eli10}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p>
                        <span className="font-semibold text-cyan-400 block mb-1">Aerospace Physics Derivation:</span>
                        {activeConcept.college}
                      </p>
                      {activeConcept.formula && (
                        <div className="mt-3 p-3 bg-slate-950 border border-cyan-500/20 rounded-lg flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400">Governing Equation:</span>
                          <code className="text-sm font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/40">
                            {activeConcept.formula}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Real World Satellite Anchor */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Live Satellite Anchor:</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {activeConcept.real_example_name}{' '}
                      <span className="text-xs font-mono text-slate-400">
                        (NORAD #{activeConcept.real_example_id})
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400/90 font-mono">
                      {activeConcept.real_example_stat}
                    </div>
                  </div>
                </div>

                {onSelectSatellite && (
                  <button
                    onClick={() => onSelectSatellite(activeConcept.real_example_id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 text-xs font-semibold transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Track Satellite
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
