import { useLogStore } from '../../store/logStore'

export default function ConsolePanel() {
  const { logs, clear } = useLogStore(s => ({ logs: s.logs, clear: s.clear }))
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase text-slate-500">Console</div>
        <button className="btn-outline !px-2 !py-1 text-xs" onClick={clear}>Clear</button>
      </div>
      <div className="text-xs space-y-1 max-h-64 overflow-auto">
        {logs.map((l,i) => (
          <div key={i} className="font-mono"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>
        ))}
        {logs.length===0 && <div className="text-slate-500">No logs yet…</div>}
      </div>
    </div>
  )
}
