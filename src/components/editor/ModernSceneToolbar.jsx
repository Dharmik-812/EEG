import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Square, Pause, RotateCcw, Save, Upload, Download,
  Grid3X3, Ruler, MousePointer, Move, RotateCw, Scale,
  ZoomIn, ZoomOut, Target, Maximize2, Settings, HelpCircle, Home,
  Menu, ChevronRight
} from 'lucide-react'

const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
  variant = 'default',
  className = '',
  tooltip = '',
  hideLabelOnMobile = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const baseClasses = "relative flex items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    default: isActive
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
      : "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    ghost: isActive
      ? "bg-slate-600 text-white"
      : "bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white"
  }

  return (
    <div className="relative group/btn">
      <button
        className={`${baseClasses} ${variants[variant]} ${className}`}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={label || tooltip}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        {label && (
          <span className={`ml-2 text-xs sm:text-sm font-medium ${hideLabelOnMobile ? 'hidden lg:inline' : 'inline'}`}>
            {label}
          </span>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-[10px] sm:text-xs rounded shadow-xl whitespace-nowrap z-50 border border-slate-700 pointer-events-none"
          >
            {tooltip}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ZoomControls = ({ zoom, onZoomChange, onReset, onFit }) => {
  return (
    <div className="hidden md:flex items-center gap-0.5 bg-slate-800 rounded-lg p-1 border border-slate-700">
      <button
        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
        onClick={() => onZoomChange(Math.max(0.25, zoom - 0.1))}
        title="Zoom Out"
      >
        <ZoomOut className="w-3 h-3" />
      </button>
      <div className="px-2 text-[10px] font-mono text-slate-400 min-w-[2.5rem] text-center">
        {Math.round(zoom * 100)}%
      </div>
      <button
        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
        onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
        title="Zoom In"
      >
        <ZoomIn className="w-3 h-3" />
      </button>
    </div>
  )
}

const TransformModeSelector = ({ mode, onModeChange }) => {
  const modes = [
    { key: 'select', icon: MousePointer, label: 'Select' },
    { key: 'move', icon: Move, label: 'Move' },
    { key: 'rotate', icon: RotateCw, label: 'Rotate' },
    { key: 'scale', icon: Scale, label: 'Scale' }
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto no-scrollbar">
      {modes.map(({ key, icon, label }) => (
        <ToolbarButton
          key={key}
          icon={icon}
          onClick={() => onModeChange(key)}
          isActive={mode === key}
          tooltip={`${label} Tool`}
          variant="ghost"
          className="!p-1.5 sm:!p-2"
          hideLabelOnMobile={true}
        />
      ))}
    </div>
  )
}

const ModernSceneToolbar = ({
  mode,
  onModeChange,
  transformMode = 'select',
  onTransformModeChange,
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
  onShowHelp,
  onHome
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-2 sm:px-4 py-2 sm:py-3 z-40 select-none">
      <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">

        {/* Left: Main Tools */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <ToolbarButton
            icon={Home}
            onClick={onHome}
            tooltip="Return Home"
            variant="ghost"
            className="!p-2"
          />

          <div className="w-px h-6 bg-slate-700 hidden sm:block" />

          {/* Transport */}
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <ToolbarButton icon={Pause} onClick={onPause} tooltip="Pause Game" variant="success" className="w-10 sm:w-auto" />
            ) : (
              <ToolbarButton icon={Play} onClick={onPlay} tooltip="Run Game" variant="success" label="Play" className="w-10 sm:w-auto" />
            )}
            <ToolbarButton icon={Square} onClick={onStop} tooltip="Stop" variant="danger" className="w-8 sm:w-auto" />
            <ToolbarButton icon={RotateCcw} onClick={onReset} tooltip="Reset" variant="ghost" className="hidden sm:flex" />
          </div>

          <div className="w-px h-6 bg-slate-700 hidden sm:block" />

          {/* Tools */}
          <TransformModeSelector mode={transformMode} onModeChange={onTransformModeChange || (() => {})} />
        </div>

        {/* Center: Info (Hidden on mobile) */}
        <div className="hidden xl:flex items-center gap-4 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Main Scene
          </span>
          <span className="text-slate-600">|</span>
          <span>800 × 600</span>
        </div>

        {/* Right: View & File */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Toggles */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
            <ToolbarButton
              icon={Grid3X3}
              onClick={onToggleGrid}
              isActive={showGrid}
              variant="ghost"
              className="!p-1.5"
              tooltip="Grid"
            />
            <ToolbarButton
              icon={MousePointer}
              onClick={onToggleSnap}
              isActive={snapToGrid}
              variant="ghost"
              className="!p-1.5"
              tooltip="Snap"
            />
          </div>

          <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />

          <div className="w-px h-6 bg-slate-700 hidden sm:block" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ToolbarButton icon={Save} onClick={onSave} tooltip="Save" variant="default" className="!p-2" />
            <div className="hidden sm:flex gap-1">
              <ToolbarButton icon={Upload} onClick={onLoad} tooltip="Open" variant="ghost" />
              <ToolbarButton icon={Download} onClick={onExport} tooltip="Export" variant="ghost" />
            </div>

            <div className="sm:hidden relative group">
              <button className="p-2 transition-colors hover:bg-slate-800 rounded text-slate-400"><Menu className="w-5 h-5" /></button>
              {/* Mobile Menu Dropdown logic would go here if using state, 
                   but for simplicity we kept major actions visible */}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ModernSceneToolbar
