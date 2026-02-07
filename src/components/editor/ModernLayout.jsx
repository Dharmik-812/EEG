import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, GripVertical, Layers, Settings, Terminal, Maximize2, Minimize2 } from 'lucide-react'

const ResizeHandle = ({ direction, onResize, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    setIsDragging(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y
      
      onResize({
        deltaX: direction.includes('horizontal') ? deltaX : 0,
        deltaY: direction.includes('vertical') ? deltaY : 0
      })
      
      // Update start position for smooth continuous dragging
      startPosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onResize, direction])

  const isVertical = direction.includes('vertical')
  const isHorizontal = direction.includes('horizontal')
  
  return (
    <div
      className={`absolute transition-colors group ${className} ${
        isVertical ? 'cursor-ns-resize' : 'cursor-col-resize'
      } bg-slate-600/50 hover:bg-slate-500`}
      onMouseDown={handleMouseDown}
      style={{
        width: isHorizontal ? '6px' : '100%',
        height: isVertical ? '8px' : '100%',
        right: direction.includes('right') ? 0 : undefined,
        left: direction.includes('left') ? 0 : undefined,
        top: direction.includes('top') ? 0 : undefined,
        bottom: direction.includes('bottom') ? 0 : undefined,
        zIndex: 30,
        userSelect: 'none'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none">
        {isVertical ? (
          <GripVertical className="h-4 w-4 text-white rotate-90" />
        ) : (
          <GripVertical className="h-4 w-4 text-white" />
        )}
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
  defaultWidth = 350,
  minWidth = 200,
  maxWidth = null,
  side = 'left'
}) => {
  const [width, setWidth] = useState(defaultWidth)
  const panelRef = useRef(null)
  
  // Calculate max width based on viewport if not provided
  const calculatedMaxWidth = maxWidth || (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 800)

  const handleResize = ({ deltaX }) => {
    if (side === 'left') {
      setWidth(prev => Math.max(minWidth, Math.min(calculatedMaxWidth, prev + deltaX)))
    } else {
      setWidth(prev => Math.max(minWidth, Math.min(calculatedMaxWidth, prev - deltaX)))
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
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
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
        <div className="absolute left-0 top-0 h-full w-8 bg-slate-750 border-r border-slate-700 flex flex-col items-center py-2 z-20">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
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
  onBottomToggle,
  bottomPanelTabs = null,
  activeTab = null,
  onTabChange = null
}) => {
  const [leftWidth, setLeftWidth] = useState(350)
  const [rightWidth, setRightWidth] = useState(350)
  const [bottomHeight, setBottomHeight] = useState(300)
  const [isBottomMaximized, setIsBottomMaximized] = useState(false)

  // Bottom panel limits: 85% of screen height max
  const minBottomHeight = 150
  const maxBottomHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800
  const maxBottomHeightForMaximize = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800

  // Calculate max widths based on viewport (50% of screen width)
  const maxPanelWidth = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 800
  const minPanelWidth = 200

  const handleLeftResize = ({ deltaX }) => {
    setLeftWidth(prev => Math.max(minPanelWidth, Math.min(maxPanelWidth, prev + deltaX)))
  }

  const handleRightResize = ({ deltaX }) => {
    setRightWidth(prev => Math.max(minPanelWidth, Math.min(maxPanelWidth, prev - deltaX)))
  }

  const handleBottomResize = ({ deltaY }) => {
    if (isBottomMaximized) {
      setIsBottomMaximized(false)
      setBottomHeight(300) // Reset to default when resizing from maximized
      return
    }
    // Limit to 85% of screen height
    setBottomHeight(prev => Math.max(minBottomHeight, Math.min(maxBottomHeight, prev - deltaY)))
  }

  const toggleBottomMaximize = () => {
    if (isBottomMaximized) {
      setIsBottomMaximized(false)
      setBottomHeight(300)
    } else {
      setIsBottomMaximized(true)
      setBottomHeight(maxBottomHeightForMaximize)
    }
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <CollapsiblePanel
          title="Hierarchy & Assets"
          icon={Layers}
          isCollapsed={leftCollapsed}
          onToggle={onLeftToggle}
          defaultWidth={leftWidth}
          minWidth={200}
          maxWidth={typeof window !== 'undefined' ? window.innerWidth * 0.5 : 800}
          side="left"
        >
          {leftPanel}
        </CollapsiblePanel>

        {/* Center Area */}
        <div className="flex-1 flex flex-col relative min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            {centerPanel}
          </div>
          
          {/* Bottom Panel */}
          <motion.div
            initial={false}
            animate={{ 
              height: bottomCollapsed ? 0 : (isBottomMaximized ? maxBottomHeightForMaximize : bottomHeight),
              opacity: bottomCollapsed ? 0 : 1
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-slate-800 border-t border-slate-700 overflow-hidden flex-shrink-0"
            style={{ 
              minHeight: bottomCollapsed ? 0 : minBottomHeight,
              maxHeight: maxBottomHeight
            }}
          >
            {!bottomCollapsed && (
              <>
                <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-750">
                  <div className="flex items-center gap-2">
                    {bottomPanelTabs && bottomPanelTabs.length > 0 ? (
                      <div className="flex gap-1">
                        {bottomPanelTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              activeTab === tab.id
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <h3 className="text-sm font-medium text-slate-200">Console & Script</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleBottomMaximize}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title={isBottomMaximized ? "Restore panel size" : "Maximize panel"}
                    >
                      {isBottomMaximized ? (
                        <Minimize2 className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Maximize2 className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={onBottomToggle}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Collapse panel"
                    >
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="h-full overflow-auto">
                  {bottomPanel}
                </div>
                <ResizeHandle 
                  direction="vertical-top" 
                  onResize={handleBottomResize}
                  className="top-0"
                />
                {/* Double-click to maximize - larger hit area on top */}
                <div
                  onDoubleClick={toggleBottomMaximize}
                  className="absolute top-0 left-0 right-0 h-8 cursor-ns-resize z-25"
                  title="Double-click to maximize/restore"
                />
              </>
            )}
            {bottomCollapsed && (
              <div className="absolute right-0 top-0 h-8 w-full bg-slate-750 border-t border-slate-700 flex items-center justify-center z-20">
                <button
                  onClick={onBottomToggle}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
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
          minWidth={200}
          maxWidth={typeof window !== 'undefined' ? window.innerWidth * 0.5 : 800}
          side="right"
        >
          {rightPanel}
        </CollapsiblePanel>
      </div>

      {/* Floating Expand Buttons - Only show when panels are collapsed */}
      <AnimatePresence>
        {(leftCollapsed || rightCollapsed || bottomCollapsed) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 flex flex-col gap-2"
          >
            {/* Show All Panels Button - Only show when multiple panels are collapsed */}
            {(leftCollapsed && rightCollapsed) || (leftCollapsed && bottomCollapsed) || (rightCollapsed && bottomCollapsed) || (leftCollapsed && rightCollapsed && bottomCollapsed) ? (
              <motion.button
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                onClick={() => {
                  onLeftToggle()
                  onRightToggle()
                  onBottomToggle()
                }}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg border border-emerald-500 transition-all duration-200 hover:shadow-xl font-medium"
                title="Show All Panels (Escape key)"
              >
                <Layers className="h-4 w-4" />
                <span className="text-sm">Show All</span>
              </motion.button>
            ) : null}
            {leftCollapsed && (
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onClick={onLeftToggle}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg shadow-lg border border-slate-600 transition-all duration-200 hover:shadow-xl"
                title="Expand Hierarchy & Assets Panel"
              >
                <Layers className="h-4 w-4" />
                <span className="text-sm font-medium">Hierarchy</span>
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
            
            {rightCollapsed && (
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onClick={onRightToggle}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg shadow-lg border border-slate-600 transition-all duration-200 hover:shadow-xl"
                title="Expand Inspector Panel"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Inspector</span>
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
            
            {bottomCollapsed && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={onBottomToggle}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg shadow-lg border border-slate-600 transition-all duration-200 hover:shadow-xl"
                title="Expand Console & Script Panel"
              >
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-medium">Console</span>
                <ChevronUp className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModernLayout
