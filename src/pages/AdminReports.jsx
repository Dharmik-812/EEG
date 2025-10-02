import { useAuthStore } from '../store/authStore'
import { useCommunityStore } from '../store/communityStore'

export default function AdminReports() {
  const { currentUser } = useAuthStore()
  const { reports, updateReportStatus } = useCommunityStore()

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="py-12 text-center text-slate-600 dark:text-slate-300">Admin access required.</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Moderation Reports</h1>
      <div className="grid gap-3">
        {reports.length === 0 && (
          <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border">No reports yet.</div>
        )}
        {reports.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border">
            <div className="text-sm text-slate-500">{r.createdAt}</div>
            <div className="font-medium">{r.targetType} • {r.targetId}</div>
            <div className="text-sm">Reason: {r.reason}</div>
            {r.evidenceUrls?.length ? (
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300">
                {r.evidenceUrls.map(url => (<li key={url}><a className="underline" href={url} target="_blank" rel="noreferrer">Evidence</a></li>))}
              </ul>
            ) : null}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">{r.status}</span>
              <button onClick={() => updateReportStatus({ id: r.id, status: 'muted' })} className="px-3 py-1 rounded bg-amber-500 text-white">Temp ban</button>
              <button onClick={() => updateReportStatus({ id: r.id, status: 'banned' })} className="px-3 py-1 rounded bg-red-600 text-white">Permanent ban</button>
              <button onClick={() => updateReportStatus({ id: r.id, status: 'resolved' })} className="px-3 py-1 rounded bg-emerald-600 text-white">Resolve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


