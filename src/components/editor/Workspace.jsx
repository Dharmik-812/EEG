import { useRef, useState } from 'react'
import { useLayoutStore } from '../../store/layoutStore'
import ScenesPanel from './ScenesPanel'
import HierarchyPanel from './HierarchyPanel'
import InspectorPanel from './InspectorPanel'
import ViewportCanvas from './ViewportCanvas'
import TimelinePanel from './TimelinePanel'
import ConsolePanel from './ConsolePanel'

export default function Workspace({ mode, canvasRef }) {
  const { leftW, rightW, bottomH, showBottom, setLeft, setRight, setBottom, toggleBottom } = useLayoutStore()
  const [tab, setTab] = useState('timeline')
  const leftRef = useRef(null); const rightRef = useRef(null); const bottomRef = useRef(null)

  function onDrag(e, which) {
    const wrap = e.currentTarget.parentElement
    const rect = wrap.getBoundingClientRect()
    if (which==='left') setLeft(e.clientX - rect.left)
    if (which==='right') setRight(rect.right - e.clientX)
    if (which==='bottom') setBottom(rect.bottom - e.clientY)
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/20 dark:border-slate-800 bg-gradient-to-br from-white/70 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-950/60 backdrop-blur">
      <div className="relative" style={{ minHeight: 400 }}>
        <div className="grid" style={{ gridTemplateColumns: `${leftW}px 1fr ${rightW}px`, gridTemplateRows: `${showBottom? `calc(100% - ${bottomH}px)` : '1fr'} ${showBottom? `${bottomH}px` : '0px'}`, height: '70vh' }}>
          {/* Left */}
          <div className="border-r border-white/20 dark:border-slate-800 overflow-auto bg-white/50 dark:bg-slate-900/40">
            <div className="p-3 space-y-3">
              <ScenesPanel />
              <div className="border-t border-white/20 dark:border-slate-800 pt-3">
                <HierarchyPanel />
              </div>
            </div>
          </div>
          {/* Center */}
          <div className="overflow-hidden bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/40">
            {mode === 'play' ? (
              <div className="w-full">
                <canvas ref={canvasRef} className="block mx-auto my-4 w-full h-auto max-w-full rounded-xl shadow-glow" />
              </div>
            ) : (
              <ViewportCanvas />
            )}
          </div>
          {/* Right */}
          <div className="border-l border-white/20 dark:border-slate-800 overflow-auto bg-white/50 dark:bg-slate-900/40">
            <InspectorPanel />
          </div>
          {/* Bottom area */}
          <div className="col-span-3 border-t border-white/20 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-white/20 dark:border-slate-800">
              <button className={`btn-outline !px-2 !py-1 text-xs ${tab==='timeline'?'!bg-emerald-500/10':''}`} onClick={()=>setTab('timeline')}>Timeline</button>
              <button className={`btn-outline !px-2 !py-1 text-xs ${tab==='console'?'!bg-emerald-500/10':''}`} onClick={()=>setTab('console')}>Console</button>
              <div className="ml-auto" />
              <button className="btn-outline !px-2 !py-1 text-xs" onClick={toggleBottom}>{showBottom? 'Hide' : 'Show'}</button>
            </div>
            <div className="h-full overflow-auto p-2">
              {tab==='timeline' ? <TimelinePanel /> : <ConsolePanel />}
            </div>
          </div>
        </div>
        {/* splitters */}
        <div className="absolute inset-y-0 left-[var(--leftW)] w-1 cursor-col-resize bg-gradient-to-b from-emerald-400/40 to-sky-400/40 hover:from-emerald-400/70 hover:to-sky-400/70 transition-opacity" style={{ left: leftW }} onMouseDown={(e)=>{
          const move = ev=>onDrag(ev,'left'); const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up)};window.addEventListener('mousemove',move);window.addEventListener('mouseup',up)
        }} />
        <div className="absolute inset-y-0" style={{ right: rightW, width: 1 }} />
        <div className="absolute inset-y-0 right-[var(--rightW)] w-1 cursor-col-resize bg-gradient-to-b from-emerald-400/40 to-sky-400/40 hover:from-emerald-400/70 hover:to-sky-400/70 transition-opacity" style={{ right: rightW }} onMouseDown={(e)=>{
          const move = ev=>onDrag(ev,'right'); const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up)};window.addEventListener('mousemove',move);window.addEventListener('mouseup',up)
        }} />
        {showBottom && (
          <div className="absolute inset-x-0 bottom-[var(--bottomH)] h-1 cursor-row-resize bg-gradient-to-r from-emerald-400/40 to-sky-400/40 hover:from-emerald-400/70 hover:to-sky-400/70 transition-opacity" style={{ bottom: bottomH }} onMouseDown={(e)=>{
            const move = ev=>onDrag(ev,'bottom'); const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up)};window.addEventListener('mousemove',move);window.addEventListener('mouseup',up)
          }} />
        )}
        {!showBottom && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2">
            <button className="btn-outline !px-3 !py-1 text-xs" onClick={toggleBottom}>Show Timeline / Console</button>
          </div>
        )}
      </div>
    </div>
  )
}
