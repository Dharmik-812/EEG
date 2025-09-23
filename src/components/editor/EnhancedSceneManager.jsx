import { useState, useCallback, useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, Plus, Trash2, Eye, EyeOff, Lock, Unlock, Copy, 
  Settings, Search, ChevronDown, ChevronRight, MoreVertical,
  Layers, TreePine, Box, Type, Image, Volume2, Sparkles,
  Move, RotateCcw, Scale, Grid, Target, Gamepad2, Save,
  Download, Upload, Folder, FileText, Star, Palette, Wand2
} from 'lucide-react'

const ENTITY_TEMPLATES = [
  {
    id: 'sprite-entity',
    name: 'Sprite Entity',
    icon: Image,
    color: 'blue',
    description: 'Basic sprite with transform',
    template: {
      components: {
        transform: { x: 0, y: 0, w: 64, h: 64, rotation: 0, scale: 1 },
        sprite: { assetId: '', tint: '#ffffff', opacity: 100, flipX: false, flipY: false }
      }
    }
  },
  {
    id: 'text-entity',
    name: 'Text Entity', 
    icon: Type,
    color: 'purple',
    description: 'Text display component',
    template: {
      components: {
        transform: { x: 0, y: 0, w: 200, h: 50, rotation: 0, scale: 1 },
        text: { content: 'New Text', fontSize: 16, color: '#000000', fontFamily: 'Arial', align: 'center' }
      }
    }
  },
  {
    id: 'physics-entity',
    name: 'Physics Object',
    icon: Gamepad2,
    color: 'red',
    description: 'Object with physics and collision',
    template: {
      components: {
        transform: { x: 0, y: 0, w: 64, h: 64, rotation: 0, scale: 1 },
        sprite: { assetId: '', tint: '#ffffff', opacity: 100, flipX: false, flipY: false },
        collider: { type: 'box', isTrigger: false, layer: 0 },
        rigidbody: { mass: 1, gravity: 1, friction: 0.5, bounce: 0.3 }
      }
    }
  },
  {
    id: 'ui-button',
    name: 'UI Button',
    icon: Target,
    color: 'emerald',
    description: 'Interactive button element',
    template: {
      components: {
        transform: { x: 0, y: 0, w: 120, h: 40, rotation: 0, scale: 1 },
        sprite: { assetId: '', tint: '#10b981', opacity: 100, flipX: false, flipY: false },
        text: { content: 'Button', fontSize: 14, color: '#ffffff', fontFamily: 'Arial', align: 'center' },
        ui: { type: 'button', interactive: true }
      }
    }
  },
  {
    id: 'particle-system',
    name: 'Particle System',
    icon: Sparkles,
    color: 'yellow',
    description: 'Animated particle effects',
    template: {
      components: {
        transform: { x: 0, y: 0, w: 32, h: 32, rotation: 0, scale: 1 },
        particle: { 
          maxParticles: 100, 
          emissionRate: 10, 
          lifetime: 2.0, 
          speed: { min: 50, max: 150 },
          color: '#ffff00'
        }
      }
    }
  }
]

const SCENE_TEMPLATES = [
  {
    id: 'empty-scene',
    name: 'Empty Scene',
    icon: FolderOpen,
    description: 'Start with a blank scene',
    template: {
      name: 'New Scene',
      width: 800,
      height: 600,
      bg: '#87CEEB',
      entities: []
    }
  },
  {
    id: 'platformer-scene',
    name: 'Platformer Scene',
    icon: TreePine,
    description: 'Basic platform game setup',
    template: {
      name: 'Platformer Scene',
      width: 800,
      height: 600,
      bg: '#87CEEB',
      entities: [
        {
          id: 'player',
          name: 'Player',
          components: {
            transform: { x: 100, y: 400, w: 32, h: 48, rotation: 0, scale: 1 },
            sprite: { assetId: 'player-sprite', tint: '#ffffff', opacity: 100 },
            collider: { type: 'box', isTrigger: false, layer: 1 },
            rigidbody: { mass: 1, gravity: 1, friction: 0.1, bounce: 0 }
          }
        },
        {
          id: 'ground',
          name: 'Ground',
          components: {
            transform: { x: 400, y: 550, w: 800, h: 100, rotation: 0, scale: 1 },
            sprite: { assetId: 'ground-sprite', tint: '#8B4513', opacity: 100 },
            collider: { type: 'box', isTrigger: false, layer: 0 }
          }
        }
      ]
    }
  },
  {
    id: 'ui-scene',
    name: 'UI Scene',
    icon: Grid,
    description: 'User interface layout',
    template: {
      name: 'UI Scene',
      width: 800,
      height: 600,
      bg: '#f0f0f0',
      entities: [
        {
          id: 'title',
          name: 'Title',
          components: {
            transform: { x: 400, y: 100, w: 400, h: 60, rotation: 0, scale: 1 },
            text: { content: 'Game Title', fontSize: 32, color: '#000000', fontFamily: 'Arial', align: 'center' }
          }
        },
        {
          id: 'start-button',
          name: 'Start Button',
          components: {
            transform: { x: 400, y: 300, w: 200, h: 50, rotation: 0, scale: 1 },
            sprite: { assetId: '', tint: '#10b981', opacity: 100 },
            text: { content: 'Start Game', fontSize: 16, color: '#ffffff', align: 'center' },
            ui: { type: 'button', interactive: true }
          }
        }
      ]
    }
  }
]

const EntityHierarchyItem = ({ entity, depth = 0, onSelect, onToggleVisibility, isSelected, onDragStart, onDrop }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const hasChildren = false // For future hierarchical entities
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', entity.id)
    onDragStart?.(entity)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  
  const handleDragLeave = () => {
    setIsDragOver(false)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const draggedId = e.dataTransfer.getData('text/plain')
    onDrop?.(draggedId, entity.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`group ${isDragOver ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(entity.id)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
            }
          </button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {/* Entity icon based on components */}
          {entity.components?.sprite && <Image className="h-3 w-3 text-blue-500" />}
          {entity.components?.text && !entity.components?.sprite && <Type className="h-3 w-3 text-purple-500" />}
          {entity.components?.particle && <Sparkles className="h-3 w-3 text-yellow-500" />}
          {!entity.components?.sprite && !entity.components?.text && !entity.components?.particle && (
            <Box className="h-3 w-3 text-slate-400" />
          )}
          
          <span className="text-sm truncate">{entity.name || entity.id}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility?.(entity.id)
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
            title="Toggle Visibility"
          >
            {entity.visible !== false ? 
              <Eye className="h-3 w-3" /> : 
              <EyeOff className="h-3 w-3 text-slate-400" />
            }
          </button>
          
          <button
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
            title="More Options"
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function EnhancedSceneManager() {
  const {
    project, selectedEntity, setSelectedEntity, addEntity, updateEntity, removeEntity
  } = useEditorStore(s => ({
    project: s.project,
    selectedEntity: s.selectedEntityId,
    setSelectedEntity: s.selectEntity,
    addEntity: s.addEntity,
    updateEntity: s.updateEntity,
    removeEntity: s.removeEntity
  }))

  const [searchTerm, setSearchTerm] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSceneTemplates, setShowSceneTemplates] = useState(false)
  const [draggedEntity, setDraggedEntity] = useState(null)

  const currentScene = project?.scenes?.[0] || { entities: [] }
  const filteredEntities = currentScene.entities?.filter(entity => 
    !searchTerm || 
    entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleAddEntity = useCallback((template) => {
    // Use the store's addEntity with the appropriate kind parameter
    let kind = 'sprite' // default
    
    if (template.id === 'text-entity') {
      kind = 'text'
    } else if (template.id === 'sprite-entity') {
      kind = 'sprite'
    }
    
    addEntity?.(kind)
    setShowTemplates(false)
  }, [addEntity])

  const handleToggleVisibility = useCallback((entityId) => {
    const entity = currentScene.entities.find(e => e.id === entityId)
    if (entity) {
      const updated = { ...entity, visible: entity.visible !== false ? false : true }
      updateEntity?.(entityId, updated)
    }
  }, [currentScene.entities, updateEntity])

  const handleEntityDragStart = useCallback((entity) => {
    setDraggedEntity(entity)
  }, [])

  const handleEntityDrop = useCallback((draggedId, targetId) => {
    // For future: implement entity parenting/hierarchy
    console.log('Drop entity', draggedId, 'onto', targetId)
  }, [])

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            Scene Hierarchy
          </h2>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSceneTemplates(!showSceneTemplates)}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded transition-colors"
              title="Scene Templates"
            >
              <Folder className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded transition-colors"
              title="Add Entity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scene Info */}
        <div className="text-xs text-slate-500 mb-2">
          Scene: {currentScene.name || 'Untitled'} • {filteredEntities.length} entities
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded focus:outline-none focus:bg-white dark:focus:bg-slate-600"
          />
        </div>
      </div>

      {/* Entity Templates Popup */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-3 min-w-[280px]"
          >
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-emerald-500" />
              Entity Templates
            </h3>
            
            <div className="space-y-2">
              {ENTITY_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleAddEntity(template)}
                  className="w-full flex items-start gap-3 p-2 text-left bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <template.icon className={`h-5 w-5 text-${template.color}-500 flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowTemplates(false)}
              className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Templates Popup */}
      <AnimatePresence>
        {showSceneTemplates && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl p-3 min-w-[280px]"
          >
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-500" />
              Scene Templates
            </h3>
            
            <div className="space-y-2">
              {SCENE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    // Load scene template
                    console.log('Load scene template:', template)
                    setShowSceneTemplates(false)
                  }}
                  className="w-full flex items-start gap-3 p-2 text-left bg-slate-50 dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <template.icon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowSceneTemplates(false)}
              className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entities List */}
      <div className="flex-1 overflow-auto">
        {filteredEntities.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm font-medium">No Entities</div>
            <div className="text-xs mt-1">Add entities to start building your scene</div>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {filteredEntities.map(entity => (
                <EntityHierarchyItem
                  key={entity.id}
                  entity={entity}
                  onSelect={setSelectedEntity}
                  onToggleVisibility={handleToggleVisibility}
                  isSelected={selectedEntity === entity.id}
                  onDragStart={handleEntityDragStart}
                  onDrop={handleEntityDrop}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Entity Count & Stats */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            {filteredEntities.length} entities
            {searchTerm && ` (filtered from ${currentScene.entities?.length || 0})`}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              {currentScene.entities?.filter(e => e.components?.sprite).length || 0}
            </div>
            <div className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              {currentScene.entities?.filter(e => e.components?.text).length || 0}
            </div>
            <div className="flex items-center gap-1">
              <Gamepad2 className="h-3 w-3" />
              {currentScene.entities?.filter(e => e.components?.rigidbody).length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}