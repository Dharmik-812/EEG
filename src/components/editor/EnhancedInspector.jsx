import { useState, useCallback } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Plus, Trash2, Eye, EyeOff,
  Move, RotateCcw, Scale, Box, Type, Image, Volume2, Gamepad2,
  Palette, ToggleLeft, ToggleRight, AlignLeft,
  Search, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react'

const COMPONENT_TYPES = [
  { id: 'transform', name: 'Transform', icon: Move, color: 'emerald' },
  { id: 'sprite', name: 'Sprite', icon: Image, color: 'blue' },
  { id: 'text', name: 'Text', icon: Type, color: 'purple' },
  { id: 'audio', name: 'Audio', icon: Volume2, color: 'orange' },
  { id: 'collider', name: 'Collider', icon: Box, color: 'red' },
  { id: 'rigidbody', name: 'Rigidbody', icon: Gamepad2, color: 'yellow' },
  { id: 'script', name: 'Script', icon: Sparkles, color: 'pink' },
  { id: 'animation', name: 'Animation', icon: RotateCcw, color: 'teal' },
  { id: 'ui', name: 'UI', icon: AlignLeft, color: 'indigo' },
  { id: 'particle', name: 'Particle', icon: Sparkles, color: 'green' }
]

const PropertyEditor = ({ property, value, onChange, type = 'text' }) => {
  const handleChange = useCallback((newValue) => {
    onChange(property, newValue)
  }, [property, onChange])

  switch (type) {
    case 'number':
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
          step="0.1"
        />
      )
    
    case 'vector2':
      return (
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="text-xs text-slate-500">X</label>
            <input
              type="number"
              value={value?.x || 0}
              onChange={(e) => handleChange({ ...value, x: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Y</label>
            <input
              type="number"
              value={value?.y || 0}
              onChange={(e) => handleChange({ ...value, y: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
              step="0.1"
            />
          </div>
        </div>
      )
    
    case 'color':
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={(e) => handleChange(e.target.value)}
            className="w-12 h-8 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || '#ffffff'}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
            placeholder="#ffffff"
          />
        </div>
      )
    
    case 'boolean':
      return (
        <button
          onClick={() => handleChange(!value)}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
            value 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {value ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {value ? 'True' : 'False'}
        </button>
      )
    
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select...</option>
          {/* Options would be passed as prop */}
        </select>
      )
    
    case 'slider':
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>0</span>
            <span className="font-medium">{value || 0}</span>
            <span>100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value || 0}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      )
    
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
          placeholder="Enter value..."
        />
      )
  }
}

const ComponentPanel = ({ component, entity, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEnabled, setIsEnabled] = useState(true)

  const componentType = COMPONENT_TYPES.find(t => t.id === component.type) || COMPONENT_TYPES[0]
  const colorClass = `text-${componentType.color}-500`

  const handlePropertyChange = useCallback((property, value) => {
    const updatedComponent = {
      ...component,
      [property]: value
    }
    onUpdate(component.type, updatedComponent)
  }, [component, onUpdate])

  const renderProperties = () => {
    const properties = []
    
    switch (component.type) {
      case 'transform':
        properties.push(
          { key: 'x', label: 'Position X', value: component.x, type: 'number' },
          { key: 'y', label: 'Position Y', value: component.y, type: 'number' },
          { key: 'w', label: 'Width', value: component.w, type: 'number' },
          { key: 'h', label: 'Height', value: component.h, type: 'number' },
          { key: 'rotation', label: 'Rotation', value: component.rotation || 0, type: 'number' },
          { key: 'scale', label: 'Scale', value: component.scale || 1, type: 'number' }
        )
        break
        
      case 'sprite':
        properties.push(
          { key: 'assetId', label: 'Asset', value: component.assetId, type: 'select' },
          { key: 'tint', label: 'Tint', value: component.tint || '#ffffff', type: 'color' },
          { key: 'opacity', label: 'Opacity', value: component.opacity || 100, type: 'slider' },
          { key: 'flipX', label: 'Flip X', value: component.flipX, type: 'boolean' },
          { key: 'flipY', label: 'Flip Y', value: component.flipY, type: 'boolean' }
        )
        break
        
      case 'text':
        properties.push(
          { key: 'content', label: 'Text Content', value: component.content, type: 'text' },
          { key: 'fontSize', label: 'Font Size', value: component.fontSize || 16, type: 'number' },
          { key: 'color', label: 'Text Color', value: component.color || '#000000', type: 'color' },
          { key: 'fontFamily', label: 'Font Family', value: component.fontFamily || 'Arial', type: 'text' },
          { key: 'align', label: 'Alignment', value: component.align || 'center', type: 'select' }
        )
        break
        
      case 'collider':
        properties.push(
          { key: 'type', label: 'Shape', value: component.type || 'box', type: 'select' },
          { key: 'isTrigger', label: 'Is Trigger', value: component.isTrigger, type: 'boolean' },
          { key: 'layer', label: 'Layer', value: component.layer || 0, type: 'number' }
        )
        break
        
      default:
        Object.keys(component).forEach(key => {
          if (key !== 'type') {
            properties.push({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              value: component[key],
              type: typeof component[key] === 'number' ? 'number' : 
                   typeof component[key] === 'boolean' ? 'boolean' : 'text'
            })
          }
        })
    }
    
    return properties
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Component Header */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
          
          <componentType.icon className={`h-4 w-4 ${colorClass}`} />
          <span className="font-medium text-sm">{componentType.name}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`p-1 rounded ${isEnabled ? 'text-emerald-500' : 'text-slate-400'}`}
            title={isEnabled ? 'Disable Component' : 'Enable Component'}
          >
            {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onRemove(component.type)}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Remove Component"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Component Properties */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 space-y-3"
          >
            {renderProperties().map(prop => (
              <div key={prop.key} className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {prop.label}
                </label>
                <PropertyEditor
                  property={prop.key}
                  value={prop.value}
                  onChange={handlePropertyChange}
                  type={prop.type}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function EnhancedInspector() {
  const {
    project, selectedEntity, updateEntity
  } = useEditorStore(s => ({
    project: s.project,
    selectedEntity: s.selectedEntityId,
    updateEntity: s.updateEntity
  }))

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddComponent, setShowAddComponent] = useState(false)

  const currentScene = project?.scenes?.[0]
  const entity = selectedEntity && currentScene ? currentScene.entities?.find(e => e.id === selectedEntity) : null
  
  const handleComponentUpdate = useCallback((componentType, updatedComponent) => {
    if (!entity) return
    
    const updatedEntity = {
      ...entity,
      components: {
        ...entity.components,
        [componentType]: updatedComponent
      }
    }
    
    updateEntity?.(selectedEntity, updatedEntity)
  }, [entity, selectedEntity, updateEntity])

  const handleComponentRemove = useCallback((componentType) => {
    if (!entity) return
    
    const updatedComponents = { ...entity.components }
    delete updatedComponents[componentType]
    
    const updatedEntity = {
      ...entity,
      components: updatedComponents
    }
    
    updateEntity?.(selectedEntity, updatedEntity)
  }, [entity, selectedEntity, updateEntity])

  const handleAddComponent = useCallback((componentType) => {
    if (!entity) return
    
    const defaultComponent = {
      type: componentType.id,
      ...getDefaultComponentData(componentType.id)
    }
    
    const updatedEntity = {
      ...entity,
      components: {
        ...entity.components,
        [componentType.id]: defaultComponent
      }
    }
    
    updateEntity?.(selectedEntity, updatedEntity)
    setShowAddComponent(false)
  }, [entity, selectedEntity, updateEntity])

  const getDefaultComponentData = (type) => {
    switch (type) {
      case 'transform':
        return { x: 0, y: 0, w: 100, h: 100, rotation: 0, scale: 1 }
      case 'sprite':
        return { assetId: '', tint: '#ffffff', opacity: 100, flipX: false, flipY: false }
      case 'text':
        return { content: 'New Text', fontSize: 16, color: '#000000', fontFamily: 'Arial', align: 'center' }
      case 'collider':
        return { type: 'box', isTrigger: false, layer: 0 }
      default:
        return {}
    }
  }

  if (!entity) {
    return (
      <div className="p-4 text-center text-slate-500">
        <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <h3 className="font-medium mb-2">No Entity Selected</h3>
        <p className="text-sm">Select an entity in the viewport to edit its properties</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Inspector</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddComponent(!showAddComponent)}
              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              title="Add Component"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Entity Info */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Entity Name
            </label>
            <input
              type="text"
              value={entity.name || ''}
              onChange={(e) => {
                const updated = { ...entity, name: e.target.value }
                updateEntity?.(selectedEntity, updated)
              }}
              className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500"
              placeholder="Entity Name"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Entity ID
            </label>
            <input
              type="text"
              value={entity.id || ''}
              disabled
              className="w-full px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-500"
            />
          </div>
        </div>
        
        {/* Search Components */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        <AnimatePresence>
          {Object.entries(entity.components || {})
            .filter(([type]) => !searchTerm || type.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(([type, component]) => (
              <ComponentPanel
                key={type}
                component={{ ...component, type }}
                entity={entity}
                onUpdate={handleComponentUpdate}
                onRemove={handleComponentRemove}
              />
            ))}
        </AnimatePresence>

        {/* Add Component Panel */}
        <AnimatePresence>
          {showAddComponent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
            >
              <h3 className="font-medium text-sm mb-3">Add Component</h3>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENT_TYPES
                  .filter(comp => !entity.components?.[comp.id])
                  .map(componentType => (
                    <button
                      key={componentType.id}
                      onClick={() => handleAddComponent(componentType)}
                      className="flex items-center gap-2 p-2 text-left bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    >
                      <componentType.icon className={`h-4 w-4 text-${componentType.color}-500`} />
                      <span className="text-sm font-medium">{componentType.name}</span>
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setShowAddComponent(false)}
                className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}