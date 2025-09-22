import { Trophy } from 'lucide-react'
import clsx from 'clsx'

export default function LeaderboardItem({ rank, name, xp, isYou }) {
  return (
    <div className={clsx('flex items-center justify-between p-4 rounded-xl border', rank <= 3 ? 'border-amber-400/50 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-800')}>
      <div className="flex items-center gap-3">
        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold', rank === 1 ? 'bg-amber-400 text-amber-900' : rank === 2 ? 'bg-slate-300 text-slate-800' : rank === 3 ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-600')}>
          {rank <= 3 ? <Trophy className="h-4 w-4" /> : rank}
        </div>
        <div className="font-medium">{name} {isYou && <span className="text-xs text-emerald-500">(You)</span>}</div>
      </div>
      <div className="text-sm tabular-nums">{xp.toLocaleString()} XP</div>
    </div>
  )
}

