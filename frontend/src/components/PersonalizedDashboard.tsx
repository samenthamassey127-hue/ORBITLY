import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  GraduationCap,
  Telescope,
  Briefcase,
  BookMarked,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Eye,
  Radio,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { RoleDashboardData, QuizQuestion } from '../types/satellite'
import { getDashboardRole } from '../api/client'

export const PersonalizedDashboard: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'astronomer' | 'business' | 'educator'>('student')
  const [dashboardData, setDashboardData] = useState<RoleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Quiz State for Student Role
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [showHints, setShowHints] = useState<Record<number, boolean>>({})
  const [quizScore, setQuizScore] = useState<number>(0)
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    async function loadRoleData() {
      try {
        setLoading(true)
        const data = await getDashboardRole(selectedRole)
        if (!cancelled) {
          setDashboardData(data)
          // Reset quiz state when switching roles
          setQuizAnswers({})
          setShowHints({})
          setQuizScore(0)
          setQuizCompleted(false)
        }
      } catch (err) {
        console.error('Failed to load role dashboard', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadRoleData()
    return () => { cancelled = true }
  }, [selectedRole])

  const handleSelectAnswer = (qId: number, optionIndex: number, correctIndex: number) => {
    if (quizAnswers[qId] !== undefined) return // already answered
    const newAnswers = { ...quizAnswers, [qId]: optionIndex }
    setQuizAnswers(newAnswers)

    const isCorrect = optionIndex === correctIndex
    if (isCorrect) {
      setQuizScore((prev) => prev + 1)
    }

    if (dashboardData?.quiz && Object.keys(newAnswers).length === dashboardData.quiz.length) {
      setQuizCompleted(true)
    }
  }

  const toggleHint = (qId: number) => {
    setShowHints((prev) => ({ ...prev, [qId]: !prev[qId] }))
  }

  const resetQuiz = () => {
    setQuizAnswers({})
    setShowHints({})
    setQuizScore(0)
    setQuizCompleted(false)
  }

  const roles = [
    { id: 'student', label: 'Students', icon: GraduationCap, color: 'text-amber-400' },
    { id: 'astronomer', label: 'Amateur Astronomers', icon: Telescope, color: 'text-cyan-400' },
    { id: 'business', label: 'Small Businesses', icon: Briefcase, color: 'text-emerald-400' },
    { id: 'educator', label: 'Teachers & Educators', icon: BookMarked, color: 'text-purple-400' },
  ] as const

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                Personalized Space Dashboard
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  CHOOSE YOUR ROLE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Curated insights, quizzes, passes, and tools tailored to who you are
              </p>
            </div>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {roles.map((r) => {
            const Icon = r.icon
            const isSelected = selectedRole === r.id
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${r.color}`} />
                <span>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {loading || !dashboardData ? (
        <div className="py-16 text-center text-slate-400">Configuring personalized orbital console...</div>
      ) : (
        <div className="pt-6 space-y-6">
          {/* Persona Headline & Quick Stats */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {dashboardData.headline}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {dashboardData.subtext}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {Object.entries(dashboardData.quick_stats).map(([k, v]) => (
                <div key={k} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{k}</div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 1. STUDENT PERSONA: Interactive Space Trivia Quiz */}
          {selectedRole === 'student' && dashboardData.quiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-slate-200">
                    Interactive Orbital Mechanics Challenge ({dashboardData.quiz.length} Questions)
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Score: {quizScore} / {dashboardData.quiz.length}
                  </span>
                  <button
                    onClick={resetQuiz}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 text-xs flex items-center gap-1 transition"
                    title="Reset quiz"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {quizCompleted && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Space Cadet Mission Complete!
                    </h5>
                    <p className="text-xs text-slate-300 mt-0.5">
                      You scored {quizScore} out of {dashboardData.quiz.length} points! You understand how objects defy gravity in orbit.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {dashboardData.quiz.map((q: QuizQuestion, index: number) => {
                  const userAnswer = quizAnswers[q.id]
                  const isAnswered = userAnswer !== undefined
                  const isCorrect = userAnswer === q.correct_index

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">
                          Question {index + 1}
                        </span>
                        <button
                          onClick={() => toggleHint(q.id)}
                          className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
                        >
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          {showHints[q.id] ? 'Hide Hint' : 'Need a Hint?'}
                        </button>
                      </div>

                      <h5 className="text-sm font-semibold text-slate-100 mt-1 mb-3">
                        {q.question}
                      </h5>

                      {showHints[q.id] && (
                        <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                          💡 <strong>Hint:</strong> {q.hint}
                        </div>
                      )}

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          if (isAnswered) {
                            if (optIdx === q.correct_index) {
                              optStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                            } else if (optIdx === userAnswer) {
                              optStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                            } else {
                              optStyle = 'opacity-50 bg-slate-950 border-slate-800/40 text-slate-500'
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => handleSelectAnswer(q.id, optIdx, q.correct_index)}
                              className={`text-left p-3 rounded-lg border text-xs transition duration-150 flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && optIdx === q.correct_index && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                              {isAnswered && optIdx === userAnswer && optIdx !== q.correct_index && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswered && (
                        <div
                          className={`mt-3 p-3 rounded-lg text-xs leading-relaxed border ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900/90 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-bold block mb-1">
                            {isCorrect ? '🎯 Spot on!' : '📖 Learning Insight:'}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. AMATEUR ASTRONOMER: Visible Satellite Passes */}
          {selectedRole === 'astronomer' && dashboardData.visible_passes && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  Visible Satellite Passes Tonight (Naked-Eye Sightings)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.visible_passes.map((pass, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-bold text-slate-100">
                        {pass.satellite_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Mag {pass.magnitude}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 my-3">
                      <div>
                        Rise Time: <strong className="text-slate-200 block">{pass.rise_time}</strong>
                      </div>
                      <div>
                        Max Elevation: <strong className="text-slate-200 block">{pass.max_elevation}</strong>
                      </div>
                      <div>
                        Sky Path: <strong className="text-slate-200 block">{pass.direction}</strong>
                      </div>
                      <div>
                        Naked Eye:
                        <span className="text-emerald-400 font-semibold block">
                          {pass.naked_eye ? '★ Clearly Visible' : 'Binoculars Suggested'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. BUSINESS PERSONA: Commercial Constellations */}
          {selectedRole === 'business' && dashboardData.commercial_services && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  Commercial Satellite Constellations & Earth Observation Tiers
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.commercial_services.map((svc, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/40 transition"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {svc.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Revisit: <strong className="text-slate-200">{svc.revisit_rate}</strong>
                      </span>
                    </div>

                    <h5 className="text-base font-semibold text-slate-100">{svc.constellation}</h5>

                    {svc.resolution && (
                      <div className="text-xs font-mono text-cyan-300 mt-0.5">
                        Spatial Resolution: {svc.resolution}
                      </div>
                    )}

                    <p className="text-xs text-slate-300/80 mt-2.5 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                      <strong>Business Application:</strong> {svc.business_use_case}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EDUCATOR PERSONA: Classroom Modules */}
          {selectedRole === 'educator' && dashboardData.classroom_topics && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-200">
                  Physics Curriculum Lesson Modules & Live Telemetry Labs
                </h4>
              </div>

              <div className="space-y-3">
                {dashboardData.classroom_topics.map((topic, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {topic.grade_level}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Module #{i + 1}
                      </span>
                    </div>

                    <h5 className="text-base font-bold text-slate-100 mb-1">
                      {topic.title}
                    </h5>

                    <p className="text-xs text-cyan-300 font-mono mb-2">
                      Principle: {topic.physics_principle}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                        <strong className="text-slate-300 block mb-0.5">Classroom Activity:</strong>
                        <span className="text-slate-400">{topic.activity}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                        <strong className="text-emerald-400 block mb-0.5">Live Telemetry Lab:</strong>
                        <span className="text-slate-400">{topic.satellite_lab}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
