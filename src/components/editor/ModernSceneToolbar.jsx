import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, Square, Pause, RotateCcw, Save, Upload, Download, 
  Grid3X3, Ruler, MousePointer, Move, RotateCw, Scale,
  ZoomIn, ZoomOut, Target, Maximize2, Settings, HelpCircle
} from 'lucide-react'

const ToolbarButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  isActive = false, 
  disabled = false,
  variant = 'default',
  className = '',
  tooltip = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const baseClasses = "relative flex items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
  
  const variants = {
    default: isActive 
      ? "bg-emerald-600 text-white shadow-lg" 
      : "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ghost: isActive 
      ? "bg-slate-600 text-white" 
      : "bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white"
  }

  return (
    <div className="relative">
      <button
        className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={tooltip || label}
      >
        <Icon className="h-4 w-4" />
        {label && <span className="ml-2 text-sm font-medium">{label}</span>}
      </button>
      
      {showTooltip && tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
        </motion.div>
      )}
    </div>
  )
}

const ZoomControls = ({ zoom, onZoomChange, onReset, onFit }) => {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      <ToolbarButton
        icon={ZoomOut}
        onClick={() => onZoomChange(Math.max(0.25, zoom - 0.1))}
        tooltip="Zoom Out"
        variant="ghost"
        className="!p-1"
      />
      <div className="px-2 py-1 text-xs font-mono text-slate-300 min-w-[3rem] text-center">
        {Math.round(zoom * 100)}%
      </div>
      <ToolbarButton
        icon={ZoomIn}
        onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
        tooltip="Zoom In"
        variant="ghost"
        className="!p-1"
      />
      <div className="w-px h-4 bg-slate-600 mx-1" />
      <ToolbarButton
        icon={Target}
        onClick={onReset}
        tooltip="Reset Zoom"
        variant="ghost"
        className="!p-1"
      />
      <ToolbarButton
        icon={Maximize2}
        onClick={onFit}
        tooltip="Fit to Screen"
        variant="ghost"
        className="!p-1"
      />
    </div>
  )
}

const TransformModeSelector = ({ mode, onModeChange }) => {
  const modes = [
    { key: 'select', icon: MousePointer, label: 'Select', tooltip: 'Select objects' },
    { key: 'move', icon: Move, label: 'Move', tooltip: 'Move objects' },
    { key: 'rotate', icon: RotateCw, label: 'Rotate', tooltip: 'Rotate objects' },
    { key: 'scale', icon: Scale, label: 'Scale', tooltip: 'Scale objects' }
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      {modes.map(({ key, icon: Icon, label, tooltip }) => (
        <ToolbarButton
          key={key}
          icon={Icon}
          label={label}
          onClick={() => onModeChange(key)}
          isActive={mode === key}
          tooltip={tooltip}
          variant="ghost"
          className="!px-2 !py-1"
        />
      ))}
    </div>
  )
}

const ModernSceneToolbar = ({ 
  mode,
  onModeChange,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onReset,
  onSave,
  onLoad,
  onExport,
  showGrid,
  onToggleGrid,
  showRulers,
  onToggleRulers,
  snapToGrid,
  onToggleSnap,
  gridSize,
  onGridSizeChange,
  zoom,
  onZoomChange,
  onZoomReset,
  onZoomFit,
  onShowSettings,
  onShowHelp
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section - Main Controls */}
        <div className="flex items-center gap-3">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <ToolbarButton
                icon={Pause}
                onClick={onPause}
                tooltip="Pause"
                variant="success"
              />
            ) : (
              <ToolbarButton
                icon={Play}
                onClick={onPlay}
                tooltip="Play Scene"
                variant="success"
              />
            )}
            <ToolbarButton
              icon={Square}
              onClick={onStop}
              tooltip="Stop"
              variant="danger"
            />
            <ToolbarButton
              icon={RotateCcw}
              onClick={onReset}
              tooltip="Reset Scene"
              variant="default"
            />
          </div>

          <div className="w-px h-6 bg-slate-600" />

          {/* Transform Mode */}
          <TransformModeSelector mode={mode} onModeChange={onModeChange} />

          <div className="w-px h-6 bg-slate-600" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={Grid3X3}
              onClick={onToggleGrid}
              isActive={showGrid}
              tooltip="Toggle Grid"
              variant="ghost"
            />
            <ToolbarButton
              icon={Ruler}
              onClick={onToggleRulers}
              isActive={showRulers}
              tooltip="Toggle Rulers"
              variant="ghost"
            />
            <ToolbarButton
              icon={Settings}
              onClick={onShowSettings}
              tooltip="View Settings"
              variant="ghost"
            />
          </div>
        </div>

        {/* Center Section - Scene Info */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">
            <span className="font-medium">Scene: Main</span>
            <span className="text-slate-500 ml-2">960 × 540</span>
          </div>
          
          {/* Snap Controls */}
          <div className="flex items-center gap-2">
            <ToolbarButton
              icon={MousePointer}
              onClick={onToggleSnap}
              isActive={snapToGrid}
              tooltip="Snap to Grid"
              variant="ghost"
              className="!px-2"
            />
            <select
              value={gridSize}
              onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
              className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Grid Size"
            >
              <option value={8}>8px</option>
              <option value={16}>16px</option>
              <option value={24}>24px</option>
              <option value={32}>32px</option>
              <option value={48}>48px</option>
              <option value={64}>64px</option>
            </select>
          </div>
        </div>

        {/* Right Section - File & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* File Controls */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={Save}
              onClick={onSave}
              tooltip="Save Project (Ctrl+S)"
              variant="default"
            />
            <ToolbarButton
              icon={Upload}
              onClick={onLoad}
              tooltip="Load Project"
              variant="default"
            />
            <ToolbarButton
              icon={Download}
              onClick={onExport}
              tooltip="Export Game"
              variant="default"
            />
          </div>

          <div className="w-px h-6 bg-slate-600" />

          {/* Zoom Controls */}
          <ZoomControls
            zoom={zoom}
            onZoomChange={onZoomChange}
            onReset={onZoomReset}
            onFit={onZoomFit}
          />

          <div className="w-px h-6 bg-slate-600" />

          {/* Help */}
          <ToolbarButton
            icon={HelpCircle}
            onClick={onShowHelp}
            tooltip="Help & Tutorial"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  )
}

export default ModernSceneToolbar
