import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, GripVertical, Layers, Settings } from 'lucide-react'

const ResizeHandle = ({ direction, onResize, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({
      width: e.target.parentElement.offsetWidth,
      height: e.target.parentElement.offsetHeight
    })
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y
      
      onResize({
        deltaX: direction.includes('horizontal') ? deltaX : 0,
        deltaY: direction.includes('vertical') ? deltaY : 0
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, startPos, onResize, direction])

  return (
    <div
      className={`absolute bg-slate-600 hover:bg-slate-500 transition-colors cursor-col-resize group ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        width: direction.includes('horizontal') ? '4px' : '100%',
        height: direction.includes('vertical') ? '4px' : '100%',
        right: direction.includes('right') ? 0 : undefined,
        left: direction.includes('left') ? 0 : undefined,
        top: direction.includes('top') ? 0 : undefined,
        bottom: direction.includes('bottom') ? 0 : undefined,
        zIndex: 10
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3 text-white" />
      </div>
    </div>
  )
}

const CollapsiblePanel = ({ 
  title, 
  icon: Icon, 
  children, 
  isCollapsed, 
  onToggle, 
  className = '',
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 500,
  side = 'left'
}) => {
  const [width, setWidth] = useState(defaultWidth)
  const panelRef = useRef(null)

  const handleResize = ({ deltaX }) => {
    if (side === 'left') {
      setWidth(prev => Math.max(minWidth, Math.min(maxWidth, prev + deltaX)))
    } else {
      setWidth(prev => Math.max(minWidth, Math.min(maxWidth, prev - deltaX)))
    }
  }

  return (
    <motion.div
      ref={panelRef}
      initial={false}
      animate={{ 
        width: isCollapsed ? 0 : width,
        opacity: isCollapsed ? 0 : 1
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={`relative bg-slate-800 border-r border-slate-700 overflow-hidden ${className}`}
      style={{ minWidth: isCollapsed ? 0 : minWidth }}
    >
      {!isCollapsed && (
        <>
          <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-750">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-slate-300" />}
              <h3 className="text-sm font-medium text-slate-200">{title}</h3>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Collapse panel"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="h-full overflow-auto">
            {children}
          </div>
          {side === 'left' && (
            <ResizeHandle 
              direction="horizontal-right" 
              onResize={handleResize}
              className="right-0"
            />
          )}
          {side === 'right' && (
            <ResizeHandle 
              direction="horizontal-left" 
              onResize={handleResize}
              className="left-0"
            />
          )}
        </>
      )}
      {isCollapsed && (
        <div className="absolute left-0 top-0 h-full w-8 bg-slate-750 border-r border-slate-700 flex flex-col items-center py-2">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Expand panel"
          >
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          {Icon && (
            <div className="mt-4 p-1">
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

const ModernLayout = ({ 
  leftPanel, 
  centerPanel, 
  rightPanel, 
  bottomPanel,
  leftCollapsed = false,
  rightCollapsed = false,
  bottomCollapsed = false,
  onLeftToggle,
  onRightToggle,
  onBottomToggle
}) => {
  const [leftWidth, setLeftWidth] = useState(300)
  const [rightWidth, setRightWidth] = useState(300)
  const [bottomHeight, setBottomHeight] = useState(200)

  const handleLeftResize = ({ deltaX }) => {
    setLeftWidth(prev => Math.max(200, Math.min(500, prev + deltaX)))
  }

  const handleRightResize = ({ deltaX }) => {
    setRightWidth(prev => Math.max(200, Math.min(500, prev - deltaX)))
  }

  const handleBottomResize = ({ deltaY }) => {
    setBottomHeight(prev => Math.max(150, Math.min(400, prev - deltaY)))
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <CollapsiblePanel
          title="Hierarchy & Assets"
          icon={Layers}
          isCollapsed={leftCollapsed}
          onToggle={onLeftToggle}
          defaultWidth={leftWidth}
          side="left"
        >
          {leftPanel}
        </CollapsiblePanel>

        {/* Center Area */}
        <div className="flex-1 flex flex-col relative">
          {centerPanel}
          
          {/* Bottom Panel */}
          <motion.div
            initial={false}
            animate={{ 
              height: bottomCollapsed ? 0 : bottomHeight,
              opacity: bottomCollapsed ? 0 : 1
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="relative bg-slate-800 border-t border-slate-700 overflow-hidden"
          >
            {!bottomCollapsed && (
              <>
                <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-750">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-200">Console & Script</h3>
                  </div>
                  <button
                    onClick={onBottomToggle}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                    title="Collapse panel"
                  >
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <div className="h-full overflow-auto">
                  {bottomPanel}
                </div>
                <ResizeHandle 
                  direction="vertical-top" 
                  onResize={handleBottomResize}
                  className="top-0"
                />
              </>
            )}
            {bottomCollapsed && (
              <div className="absolute right-0 top-0 h-8 w-full bg-slate-750 border-t border-slate-700 flex items-center justify-center">
                <button
                  onClick={onBottomToggle}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Expand panel"
                >
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Panel */}
        <CollapsiblePanel
          title="Inspector"
          icon={Settings}
          isCollapsed={rightCollapsed}
          onToggle={onRightToggle}
          defaultWidth={rightWidth}
          side="right"
        >
          {rightPanel}
        </CollapsiblePanel>
      </div>
    </div>
  )
}

export default ModernLayout
