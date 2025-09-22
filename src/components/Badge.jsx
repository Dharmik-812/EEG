import { Award } from 'lucide-react'
import clsx from 'clsx'

export default function Badge({ name, acquired = false, description }) {
  return (
    <div className={clsx('flex items-center gap-3 p-4 rounded-xl border transition-all', acquired ? 'border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 opacity-70')}>
      <div className={clsx('rounded-full p-2', acquired ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')}>
        <Award className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold">{name}</div>
        {description && <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>}
      </div>
    </div>
  )
}

