import React, { useState } from 'react'
import {
  Sparkles,
  Send,
  CheckCircle,
  AlertTriangle,
  Database,
  Compass,
  ArrowRight,
  Loader2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import type { AssistantResponse } from '../types/satellite'
import { askAssistant } from '../api/client'

interface AskOrbitlyAssistantProps {
  currentSatelliteId?: string
  currentSatelliteName?: string
}

export const AskOrbitlyAssistant: React.FC<AskOrbitlyAssistantProps> = ({
  currentSatelliteId,
  currentSatelliteName,
}) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [mode, setMode] = useState<'balanced' | 'eli10' | 'college'>('balanced')

  const sampleQuestions = [
    'Why is the ISS not falling to Earth?',
    'Compare the altitude of ISS and Hubble Space Telescope',
    'Explain the next upcoming rocket launch to me',
    'How is space debris tracked to prevent collisions?',
  ]

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return
    try {
      setLoading(true)
      const res = await askAssistant({
        question: questionText,
        satellite_id: currentSatelliteId,
        mode,
      })
      setResponse(res)
      setQuery('')
    } catch (e) {
      console.error('Failed to query Ask ORBITLY', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAsk(query)
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                Ask ORBITLY — AI Space Assistant
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30">
                  GROUNDED TELEMETRY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Grounded in CelesTrak GP orbital elements, real-time SGP4 physics, and NASA/ESA flight data
              </p>
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('eli10')}
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === 'eli10'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explain Like I'm 10
          </button>
          <button
            onClick={() => setMode('balanced')}
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === 'balanced'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Balanced
          </button>
          <button
            onClick={() => setMode('college')}
            className={`px-3 py-1.5 rounded-lg transition ${
              mode === 'college'
                ? 'bg-purple-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aerospace Rigor
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="pt-4">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-xs bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            currentSatelliteName
              ? `Ask anything about ${currentSatelliteName} or orbital science...`
              : 'Ask anything about satellites, rocket launches, or orbital mechanics...'
          }
          className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none pr-12 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Send className="w-4 h-4 text-slate-950 font-bold" />
          )}
        </button>
      </form>

      {/* Assistant Response Box */}
      {response && (
        <div className="mt-6 bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 space-y-4 animate-fadeIn">
          {/* Header of Response: Verified Badge & Source */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {response.verified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  VERIFIED REAL-TIME TELEMETRY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  THEORETICAL ESTIMATE
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Source: <span className="text-slate-300">{response.source}</span>
            </div>
          </div>

          {/* User Question Echo */}
          <h4 className="text-sm font-semibold text-cyan-300">
            "{response.question}"
          </h4>

          {/* Simple Metaphor / ELI10 Box */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
            <strong className="block text-amber-400 mb-0.5">🐣 Plain-English Intuition:</strong>
            {response.eli10_summary}
          </div>

          {/* Detailed Aerospace Answer */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {response.answer}
          </p>

          {/* Verified Data Points Table */}
          {response.data_points && response.data_points.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Verified Aerospace Parameters:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {response.data_points.map((dp, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center"
                  >
                    <div className="text-[10px] text-slate-400 truncate">{dp.label}</div>
                    <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                      {dp.value}
                    </div>
                    {dp.unit && (
                      <div className="text-[10px] font-mono text-slate-500">{dp.unit}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Follow-ups */}
          {response.suggested_followups && response.suggested_followups.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 mb-2">Explore deeper questions:</div>
              <div className="flex flex-col gap-1.5">
                {response.suggested_followups.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(fu)}
                    className="text-left text-xs text-cyan-400/90 hover:text-cyan-300 flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 transition"
                  >
                    <span>{fu}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
