import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'

export default function Admin() {
  const { pendingGames, approveGame, rejectGame, pendingQuizzes, approveQuiz, rejectQuiz } = useSubmissionsStore(s => ({
    pendingGames: s.pendingGames,
    approveGame: s.approveGame,
    rejectGame: s.rejectGame,
    pendingQuizzes: s.pendingQuizzes,
    approveQuiz: s.approveQuiz,
    rejectQuiz: s.rejectQuiz,
  }))
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <SEO title="Admin" description="Admin panel to review and approve community games and quizzes." noIndex={true} />
    <section className="space-y-6">
      <Card>
        <div className="text-xl font-bold">Admin Panel</div>
        <div className="text-sm text-slate-500">Approve community games and quizzes. This area is only visible to administrators.</div>
      </Card>
      <Card>
        <div className="font-semibold mb-2">Pending Games</div>
        <div className="space-y-2">
          {pendingGames.length === 0 && <div className="text-sm text-slate-500">No pending games.</div>}
          {pendingGames.map(g => (
            <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">{g.title}</div>
                <div className="text-xs text-slate-500">By {g.ownerId} • {new Date(g.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline !px-3 !py-1" onClick={() => approveGame(g.id)}>Approve</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => rejectGame(g.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-2">Pending Quizzes</div>
        <div className="space-y-2">
          {pendingQuizzes.length === 0 && <div className="text-sm text-slate-500">No pending quizzes.</div>}
          {pendingQuizzes.map(q => (
            <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">{q.quiz.title}</div>
                <div className="text-xs text-slate-500">Topic: {q.quiz.topic} • {new Date(q.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline !px-3 !py-1" onClick={() => approveQuiz(q.id)}>Approve</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => rejectQuiz(q.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
    </>
  )
}

