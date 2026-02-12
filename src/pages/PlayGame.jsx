import { useParams } from 'react-router-dom'
import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useEffect, useRef } from 'react'
import { runProject } from '../engine/runtime'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'
import { useGameStore } from '../store/gameStore'
import { motion } from 'framer-motion'

export default function PlayGame() {
  const { id } = useParams()
  const { approvedGames } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames }))
  const game = approvedGames.find(g => g.id === id)
  const canvasRef = useRef(null)
  const addXP = useGameStore(s => s.addXP)
  const awardBadge = useGameStore(s => s.awardBadge)
  const { xp, level } = useGameStore(s => ({ xp: s.xp, level: s.level }))

  const XP_PER_LEVEL = 500
  const currentLevelProgress = xp % XP_PER_LEVEL
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / XP_PER_LEVEL) * 100))

  useEffect(() => {
    if (game) {
      const r = runProject(canvasRef.current, game.project, { 
        onMessage: (m) => toast(m),
        onSceneChange: (scene, prevId) => {
          // Award XP when entering summary scenes
          const sid = scene?.id || ''
          const award = (xp, badge) => { try { addXP(xp, `Completed ${game.title}`) } catch {}; if (badge) try { awardBadge(badge) } catch {} }
          if (sid.endsWith('-summary')) {
            const map = {
              'rr-summary': { xp: 100, badge: 'recycle_rookie' },
              'wf-summary': { xp: 100, badge: 'wind_builder' },
              'es-summary': { xp: 80, badge: 'efficiency_ally' },
              'wr-summary': { xp: 120, badge: 'wetland_restorer' },
              'tc-summary': { xp: 90, badge: 'ocean_cleaner' },
              'tp-summary': { xp: 90, badge: 'tree_planter' },
              'sp-summary': { xp: 100, badge: 'solar_planner' },
              'bc-summary': { xp: 70, badge: 'bike_commuter' },
            }
            const conf = map[sid] || { xp: 50 }
            award(conf.xp, conf.badge)
          }
        }
      })
      return () => r.stop()
    }
  }, [id])

  if (!game) {
    return (
      <>
        <SEO title="Game" description="Play community-created eco games on AverSoltix." noIndex={true} />
        <section className="max-w-5xl mx-auto">
          <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-900/80 border border-rose-100/60 dark:border-rose-500/20 shadow-xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-rose-500/25 via-amber-400/20 to-transparent blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-2xl font-black mb-2 bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                Game not found
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                This community game might have been removed or the link is incorrect.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try returning to the Community tab to explore other eco games created by the community.
              </p>
            </div>
          </Card>
        </section>
      </>
    )
  }

  return (
    <>
      <SEO title={game.title} description={game.description || 'Play a community-created eco game on AverSoltix.'} noIndex={true} />
      <section className="max-w-6xl mx-auto">
        <Card className="relative overflow-hidden bg-white/90 dark:bg-slate-900/80 border border-emerald-100/60 dark:border-emerald-500/20 shadow-2xl">
          {/* Soft ambient gradients */}
          <div className="pointer-events-none absolute -top-32 -right-40 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/25 to-purple-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-sky-400/15 blur-3xl" />

          <div className="relative z-10 space-y-6">
            {/* Header + meta */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-sky-600 to-purple-600 bg-clip-text text-transparent">
                  {game.title}
                </h1>
                <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {game.description || 'Interactive eco game created in the AverSoltix editor.'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 dark:bg-emerald-900/40 dark:text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Community Game
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 dark:bg-slate-800/70 dark:text-slate-200">
                    👤 {game.ownerId === 'system' ? 'AverSoltix demo' : (game.ownerId || 'Community creator')}
                  </span>
                </div>
              </div>

              {/* XP / level mini HUD */}
              <div className="mt-2 w-full max-w-xs rounded-2xl border border-emerald-100/70 bg-emerald-50/70 p-4 text-xs shadow-sm dark:border-emerald-500/40 dark:bg-emerald-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-100">
                    Player Progress
                  </span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 shadow-sm dark:bg-emerald-900/60">
                    Level {level}
                  </span>
                </div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>Next level</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100/80 dark:bg-emerald-900/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  />
                </div>
                <div className="mt-1 text-[10px] text-emerald-900/70 dark:text-emerald-100/70">
                  Playing community games earns XP and unlocks badges as you explore more eco challenges.
                </div>
              </div>
            </div>

            {/* Game canvas frame */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-2"
            >
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500/25 via-sky-500/20 to-purple-500/25 p-[2px] shadow-xl shadow-emerald-500/20 dark:shadow-emerald-500/30">
                <div className="relative overflow-hidden rounded-[1.35rem] bg-slate-950/95 dark:bg-slate-900/95">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 via-white/0 to-transparent opacity-40" />
                  <div className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rotate-12 bg-gradient-to-br from-emerald-400/25 via-sky-400/25 to-transparent blur-2xl" />

                  <div className="flex items-center justify-between px-4 pt-3 pb-2 text-[11px] text-slate-200/90">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Gameplay
                    </span>
                    <span className="text-slate-400">
                      Use arrow keys / WASD & click where prompted
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80" />

                  <div className="w-full px-2 pb-3 pt-2 sm:px-4 sm:pb-4">
                    <canvas
                      ref={canvasRef}
                      className="mx-auto block h-auto w-full max-w-full rounded-2xl bg-slate-900/90"
                      role="img"
                      aria-label={`Game canvas for ${game.title}. Use arrow keys or on-screen controls.`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Helper tips */}
            <div className="flex flex-col gap-2 text-[11px] text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                  Controls
                </span>
                <span>Most games use arrow keys or WASD; some respond to mouse clicks or taps.</span>
              </div>
              <span>
                Tip: Complete summary or goal scenes to earn extra XP and unlock themed eco badges.
              </span>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

