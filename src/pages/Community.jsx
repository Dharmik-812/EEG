import Card from '../components/Card'
import { useSubmissionsStore } from '../store/submissionsStore'
import { Link } from 'react-router-dom'

export default function Community() {
  const { approvedGames, approvedQuizzes } = useSubmissionsStore(s => ({ approvedGames: s.approvedGames, approvedQuizzes: s.approvedQuizzes }))

  return (
    <section className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Community Games</div>
          <Link to="/editor" className="btn-outline !px-3 !py-1">Create Game</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedGames.length === 0 && <div className="text-sm text-slate-500">No games yet. Be the first to submit!</div>}
          {approvedGames.map(g => (
            <div key={g.id} className="p-4 rounded-lg border">
              <div className="font-medium">{g.title}</div>
              <div className="text-sm text-slate-500">{g.description}</div>
              <Link to={`/play/${g.id}`} className="btn mt-3 !px-3 !py-2">Play</Link>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Community Quizzes</div>
          <Link to="/create-quiz" className="btn-outline !px-3 !py-1">Create Quiz</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedQuizzes.length === 0 && <div className="text-sm text-slate-500">No quizzes yet.</div>}
          {approvedQuizzes.map(q => (
            <div key={q.id} className="p-4 rounded-lg border">
              <div className="font-medium">{q.quiz.title}</div>
              <div className="text-sm text-slate-500">{q.quiz.topic}</div>
              <Link to="/challenges" className="btn mt-3 !px-3 !py-2">Take</Link>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

