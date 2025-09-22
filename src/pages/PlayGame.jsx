import { useParams } from 'react-router-dom'
import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useEffect, useRef } from 'react'
import { runProject } from '../engine/runtime'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'

export default function PlayGame() {
  const { id } = useParams()
  const { approvedGames } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames }))
  const game = approvedGames.find(g => g.id === id)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (game) {
      const r = runProject(canvasRef.current, game.project, { onMessage: (m) => toast(m) })
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
      <SEO title={game.title} description={game.description || 'Play a community-created eco game on AverSoltix.'} />
    <section>
      <Card>
        <div className="font-semibold mb-2">{game.title}</div>
        <div className="text-sm text-slate-500 mb-4">{game.description}</div>
        <div className="w-full">
          <canvas ref={canvasRef} className="block mx-auto w-full h-auto max-w-full" />
        </div>
      </Card>
    </section>
    </>
  )
}

