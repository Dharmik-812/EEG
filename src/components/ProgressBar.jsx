export default function ProgressBar({ value, max = 100, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label && <div className="mb-1 text-sm">{label}</div>}
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full animate-gradient-x bg-gradient-to-r from-amber-300 via-emerald-400 to-sky-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{pct}%</div>
    </div>
  )
}

