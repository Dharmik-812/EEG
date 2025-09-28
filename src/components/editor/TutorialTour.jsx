import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// Lightweight guided tour overlay. Highlights targets by CSS ring and shows a floating card.
export default function TutorialTour({ open, onClose }) {
  const steps = useMemo(() => ([
    { key: 'toolbar', title: 'Top Toolbar', body: 'New (Ctrl+N), Save (Ctrl+S), Play/Stop (Ctrl+P), Undo/Redo (Ctrl+Z / Ctrl+Y), Export web build.', sel: '[data-tour="toolbar"]' },
    { key: 'assets', title: 'Assets', body: 'Upload Images/Audio only. Filter by type, search, and drag onto the scene or Assign to selected.', sel: '[data-tour="assets"]' },
    { key: 'hierarchy', title: 'Hierarchy', body: 'All objects in your scene. Click to select. Use layers for ordering.', sel: '[data-tour="hierarchy"]' },
    { key: 'viewport', title: 'Viewport', body: 'Zoom (+/− or mousewheel), Fit, Pan (Space drag). Place and transform entities precisely with the grid.', sel: '[data-tour="viewport"]' },
    { key: 'inspector', title: 'Inspector', body: 'Edit Transform, Sprite, UI, Physics, Colliders. Changes auto-save every few seconds.', sel: '[data-tour="inspector"]' },
    { key: 'script-editor', title: 'Script Editor', body: 'Add logic using onUpdate/onClick/onCollision. Errors appear in Console.', sel: '[data-tour="script-editor"]' },
    { key: 'console', title: 'Console', body: 'Runtime messages and errors appear during Play mode for quick debugging.', sel: '[data-tour="console"]' },
  ]), [])

  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const targetRef = useRef(null)

  useEffect(() => { if (!open) setI(0) }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const step = steps[i]
    const el = document.querySelector(step.sel)
    if (!el) { setRect(null); return }
    targetRef.current = el
    const r = el.getBoundingClientRect()
    setRect(r)
    el.classList.add('ring-4','ring-emerald-400','ring-offset-2','ring-offset-emerald-100','dark:ring-offset-slate-900','animate-pulse')
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    return () => {
      try { el.classList.remove('ring-4','ring-emerald-400','ring-offset-2','ring-offset-emerald-100','dark:ring-offset-slate-900','animate-pulse') } catch {}
    }
  }, [open, i, steps])

  if (!open) return null
  const step = steps[i]

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      {/* Floating card near target */}
      <div className="absolute" style={{ left: Math.max(16, Math.min((rect?.left||40), window.innerWidth-360)), top: Math.min((rect? (rect.bottom+12) : 80), window.innerHeight-200), width: 340 }}>
        <div className="card p-4">
          <div className="text-sm font-semibold">{step.title}</div>
          <div className="text-xs mt-1 text-slate-600 dark:text-slate-300">{step.body}</div>
          <div className="mt-3 flex items-center justify-between">
            <button className="btn-outline !px-3 !py-1 text-xs" onClick={onClose}>Skip</button>
            <div className="flex gap-2">
              <button className="btn-outline !px-3 !py-1 text-xs" disabled={i===0} onClick={()=>setI(i-1)}>Back</button>
              {i < steps.length-1 ? (
                <button className="btn !px-3 !py-1 text-xs" onClick={()=>setI(i+1)}>Next</button>
              ) : (
                <button className="btn !px-3 !py-1 text-xs" onClick={onClose}>Done</button>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Step {i+1} / {steps.length}</div>
        </div>
      </div>
    </div>
  )
}
