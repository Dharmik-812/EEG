import { useParams } from 'react-router-dom'
import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useEffect, useRef } from 'react'
import { runProject } from '../engine/runtime'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'
import { useGameStore } from '../store/gameStore'

export default function PlayGame() {
  const { id } = useParams()
  const { approvedGames } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames }))
  const game = approvedGames.find(g => g.id === id)
  const canvasRef = useRef(null)
  const addXP = useGameStore(s => s.addXP)
  const awardBadge = useGameStore(s => s.awardBadge)

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

  if (!game) return (
    <>
      <SEO title="Game" description="Play community-created eco games on AverSoltix." noIndex={true} />
      <section><Card>Game not found.</Card></section>
    </>
  )

  return (
    <>
      <SEO title={game.title} description={game.description || 'Play a community-created eco game on AverSoltix.'} noIndex={true} />
    <section>
      <Card>
        <div className="font-semibold mb-2">{game.title}</div>
        <div className="text-sm text-slate-500 mb-4">{game.description}</div>
        <div className="w-full">
          <canvas 
            ref={canvasRef} 
            className="block mx-auto w-full h-auto max-w-full"
            role="img"
            aria-label={`Game canvas for ${game.title}. Use arrow keys or on-screen controls.`}
          />
        </div>
      </Card>
    </section>
    </>
  )
}

