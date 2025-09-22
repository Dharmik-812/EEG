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
    <div className="border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="relative" style={{ minHeight: 400 }}>
        <div className="grid" style={{ gridTemplateColumns: `${leftW}px 1fr ${rightW}px`, gridTemplateRows: `${showBottom? `calc(100% - ${bottomH}px)` : '1fr'} ${showBottom? `${bottomH}px` : '0px'}`, height: '600px' }}>
          {/* Left */}
          <div className="border-r overflow-auto">
            <div className="p-3 space-y-3">
              <ScenesPanel />
              <div className="border-t pt-3">
                <HierarchyPanel />
              </div>
            </div>
          </div>
          {/* Center */}
          <div className="overflow-hidden">
            {mode === 'play' ? (
              <div className="w-full">
                <canvas ref={canvasRef} className="block mx-auto my-4 w-full h-auto max-w-full" />
              </div>
            ) : (
              <ViewportCanvas />
            )}
          </div>
          {/* Right */}
          <div className="border-l overflow-auto">
            <InspectorPanel />
          </div>
          {/* Bottom area */}
          <div className="col-span-3 border-t bg-slate-50/70 dark:bg-slate-900/70 overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b">
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
        <div className="absolute inset-y-0 left-[var(--leftW)] w-1 cursor-col-resize" style={{ left: leftW }} onMouseDown={(e)=>{
          const move = ev=>onDrag(ev,'left'); const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up)};window.addEventListener('mousemove',move);window.addEventListener('mouseup',up)
        }} />
        <div className="absolute inset-y-0" style={{ right: rightW, width: 1 }} />
        <div className="absolute inset-y-0 right-[var(--rightW)] w-1 cursor-col-resize" style={{ right: rightW }} onMouseDown={(e)=>{
          const move = ev=>onDrag(ev,'right'); const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up)};window.addEventListener('mousemove',move);window.addEventListener('mouseup',up)
        }} />
        {showBottom && (
          <div className="absolute inset-x-0 bottom-[var(--bottomH)] h-1 cursor-row-resize" style={{ bottom: bottomH }} onMouseDown={(e)=>{
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
