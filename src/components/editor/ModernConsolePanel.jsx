import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Trash2, Play, Square, 
  Code2, Terminal, AlertCircle, CheckCircle, Info, 
  Copy, Download, Upload, Settings
} from 'lucide-react'

const LogEntry = ({ entry, index }) => {
  const getIcon = (level) => {
    switch (level) {
      case 'error': return AlertCircle
      case 'warn': return AlertCircle
      case 'info': return Info
      case 'success': return CheckCircle
      default: return Info
    }
  }

  const getColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      case 'success': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const Icon = getIcon(entry.level)

  return (
    <div className="flex items-start gap-3 py-2 px-3 hover:bg-slate-700/50 transition-colors">
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getColor(entry.level)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500 font-mono">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
          <span className={`text-xs font-medium ${getColor(entry.level)}`}>
            {entry.level.toUpperCase()}
          </span>
        </div>
        <div className="text-sm text-slate-200 font-mono whitespace-pre-wrap">
          {entry.message}
        </div>
        {entry.stack && (
          <details className="mt-2">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
              Stack Trace
            </summary>
            <pre className="text-xs text-slate-500 font-mono mt-1 ml-4 whitespace-pre-wrap">
              {entry.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

const ConsoleTab = ({ logs, onClearLogs }) => {
  const consoleRef = useRef(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-200">Console</h3>
          <span className="text-xs text-slate-500">({logs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const text = logs.map(log => `[${log.level}] ${log.message}`).join('\n')
              navigator.clipboard.writeText(text)
            }}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Copy logs"
          >
            <Copy className="h-3 w-3 text-slate-400" />
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>
      
      <div ref={consoleRef} className="flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="p-6 text-center">
            <Terminal className="h-8 w-8 mx-auto mb-2 text-slate-500 opacity-50" />
            <p className="text-sm text-slate-400">No console output</p>
            <p className="text-xs text-slate-500 mt-1">Runtime messages will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {logs.map((entry, index) => (
              <LogEntry key={index} entry={entry} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ScriptEditor = ({ 
  selectedEntity, 
  onUpdateScript, 
  onRunScript, 
  onStopScript, 
  isRunning 
}) => {
  const [code, setCode] = useState(selectedEntity?.components?.script?.code || '')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const newCode = selectedEntity?.components?.script?.code || ''
    setCode(newCode)
    setIsDirty(false)
  }, [selectedEntity])

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    setIsDirty(true)
  }

  const handleSave = () => {
    if (selectedEntity && isDirty) {
      onUpdateScript(selectedEntity.id, code)
      setIsDirty(false)
    }
  }

  const handleRun = () => {
    handleSave()
    onRunScript?.(selectedEntity.id)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-200">Script Editor</h3>
          {isDirty && (
            <span className="text-xs text-yellow-400">• Unsaved</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isRunning ? (
            <button
              onClick={() => onStopScript?.(selectedEntity.id)}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white transition-colors"
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={!selectedEntity}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
            >
              <Play className="h-3 w-3" />
              Run
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-slate-300 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {!selectedEntity ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Code2 className="h-8 w-8 mx-auto mb-2 text-slate-500 opacity-50" />
              <p className="text-sm text-slate-400">No entity selected</p>
              <p className="text-xs text-slate-500 mt-1">Select an entity to edit its script</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-2 bg-slate-750 border-b border-slate-700">
              <div className="text-xs text-slate-400">
                Entity: <span className="text-slate-300">{selectedEntity.name || 'Untitled'}</span>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 w-full p-3 bg-slate-900 text-slate-200 font-mono text-sm resize-none focus:outline-none"
              placeholder="// Enter your script code here...
function onUpdate(event, payload, api) {
  // Called every frame
}

function onCollision(event, payload, api) {
  // Called when collision occurs
  // payload.other contains the other entity
}

function onClick(event, payload, api) {
  // Called when clicked
}"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const ModernConsolePanel = ({ 
  activeTab, 
  onTabChange, 
  logs, 
  onClearLogs,
  selectedEntity,
  onUpdateScript,
  onRunScript,
  onStopScript,
  isRunning
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => onTabChange('console')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'console'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Console
        </button>
        <button
          onClick={() => onTabChange('script')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'script'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Code2 className="h-4 w-4" />
          Script
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'console' ? (
          <ConsoleTab
            logs={logs}
            onClearLogs={onClearLogs}
          />
        ) : (
          <ScriptEditor
            selectedEntity={selectedEntity}
            onUpdateScript={onUpdateScript}
            onRunScript={onRunScript}
            onStopScript={onStopScript}
            isRunning={isRunning}
          />
        )}
      </div>
    </div>
  )
}

export default ModernConsolePanel
