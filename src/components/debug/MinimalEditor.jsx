export default function MinimalEditor() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-emerald-600 mb-4">
          🎮 Game Engine - Debug Mode
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          This is a minimal test version of the editor to verify routing works.
        </p>
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded border">
          <h2 className="font-semibold text-emerald-700 dark:text-emerald-400">Status:</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✅ React Router working</li>
            <li>✅ Component loading</li>
            <li>✅ Styles applying</li>
          </ul>
        </div>
      </div>
    </div>
  )
}