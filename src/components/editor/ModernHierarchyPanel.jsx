import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Plus, Search, 
  Square, Circle, Triangle, Type, 
  Image, Music, FileText, Code2,
  Eye, EyeOff, Lock, Unlock, Trash2,
  TreePine, Users, Sparkles
} from 'lucide-react'

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative p-3 border-b border-slate-700">
    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
    />
  </div>
)

const EntityItem = ({ 
  entity, 
  isSelected, 
  onSelect, 
  onToggleVisibility, 
  onToggleLock, 
  onDelete,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = entity.children && entity.children.length > 0

  const getEntityIcon = (entity) => {
    if (entity.components?.sprite) return Square
    if (entity.components?.text) return Type
    if (entity.components?.tilemap) return Square
    if (entity.components?.ui) return Square
    return Square
  }

  const Icon = getEntityIcon(entity)

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1.5 px-3 hover:bg-slate-700 cursor-pointer transition-colors ${
          isSelected ? 'bg-emerald-600/20 border-r-2 border-emerald-500' : ''
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(entity.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-slate-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm text-slate-200 truncate flex-1">
          {entity.name || 'Untitled Entity'}
        </span>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility?.(entity.id)
            }}
            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
            title="Toggle visibility"
          >
            <Eye className="h-4 w-4 text-slate-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleLock?.(entity.id)
            }}
            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
            title="Toggle lock"
          >
            <Lock className="h-4 w-4 text-slate-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(entity.id)
            }}
            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
            title="Delete entity"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {entity.children.map((child) => (
              <EntityItem
                key={child.id}
                entity={child}
                isSelected={isSelected}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onDelete={onDelete}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const HierarchyTab = ({ 
  project, 
  selectedEntityId, 
  onSelectEntity, 
  onAddEntity, 
  onDeleteEntity 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const currentScene = project?.scenes?.[0]

  const filteredEntities = currentScene?.entities?.filter(entity =>
    entity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="h-full flex flex-col">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search entities..."
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Scene Hierarchy
            </h3>
            <button
              onClick={() => onAddEntity('sprite')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Add entity"
            >
              <Plus className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            {filteredEntities.map((entity) => (
              <EntityItem
                key={entity.id}
                entity={entity}
                isSelected={selectedEntityId === entity.id}
                onSelect={onSelectEntity}
                onDelete={onDeleteEntity}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const AssetItem = ({ asset, onSelect, onDelete, onDragStart }) => {
  const getAssetIcon = (type, category) => {
    // Enhanced icon selection based on type and category
    if (type === 'image') {
      switch (category) {
        case 'environment': return TreePine
        case 'character': return Users
        case 'ui': return Square
        case 'decoration': return Sparkles
        default: return Image
      }
    }
    if (type === 'audio') return Music
    return FileText
  }

  const getAssetColor = (type, category) => {
    if (type === 'image') {
      switch (category) {
        case 'environment': return 'from-green-500 to-emerald-600'
        case 'character': return 'from-blue-500 to-cyan-600'
        case 'ui': return 'from-purple-500 to-violet-600'
        case 'decoration': return 'from-yellow-500 to-orange-600'
        default: return 'from-slate-500 to-slate-600'
      }
    }
    if (type === 'audio') return 'from-orange-500 to-red-600'
    return 'from-slate-500 to-slate-600'
  }

  const Icon = getAssetIcon(asset.type, asset.category)
  const colorClass = getAssetColor(asset.type, asset.category)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'asset',
      asset: asset
    }))
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart?.(asset)
  }

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-4 p-4 hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 rounded-lg interactive-hover"
        onClick={() => onSelect?.(asset.id)}
        draggable
        onDragStart={handleDragStart}
      >
        <div className={`w-24 h-24 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-200`}>
          <Icon className="h-12 w-12 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-slate-200 truncate">
            {asset.name || 'Untitled Asset'}
          </div>
          <div className="text-sm text-slate-400 capitalize">
            {asset.category || asset.type}
          </div>
          {asset.description && (
            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
              {asset.description}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(asset.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600 rounded-lg transition-all duration-200"
          title="Delete asset"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </div>
  )
}

// Premade Environmental Assets Library
const PREMADE_ASSETS = [
  // Environment Assets
  {
    id: 'forest-bg-1',
    name: 'Forest Background',
    type: 'image',
    category: 'environment',
    description: 'Lush green forest with tall trees and natural lighting',
    tags: ['background', 'forest', 'nature', 'environment']
  },
  {
    id: 'mountain-bg-1',
    name: 'Mountain Landscape',
    type: 'image',
    category: 'environment',
    description: 'Majestic mountain range with snow-capped peaks',
    tags: ['background', 'mountain', 'landscape', 'environment']
  },
  {
    id: 'desert-bg-1',
    name: 'Desert Scene',
    type: 'image',
    category: 'environment',
    description: 'Vast desert with sand dunes and clear sky',
    tags: ['background', 'desert', 'sand', 'environment']
  },
  {
    id: 'ocean-bg-1',
    name: 'Ocean View',
    type: 'image',
    category: 'environment',
    description: 'Calm ocean with waves and horizon',
    tags: ['background', 'ocean', 'water', 'environment']
  },
  {
    id: 'city-bg-1',
    name: 'Urban Cityscape',
    type: 'image',
    category: 'environment',
    description: 'Modern city skyline with buildings and lights',
    tags: ['background', 'city', 'urban', 'environment']
  },
  {
    id: 'tree-1',
    name: 'Oak Tree',
    type: 'image',
    category: 'environment',
    description: 'Large oak tree with detailed bark and leaves',
    tags: ['tree', 'nature', 'decoration', 'environment']
  },
  {
    id: 'rock-1',
    name: 'Stone Rock',
    type: 'image',
    category: 'environment',
    description: 'Natural stone rock formation',
    tags: ['rock', 'stone', 'decoration', 'environment']
  },
  {
    id: 'grass-1',
    name: 'Grass Patch',
    type: 'image',
    category: 'environment',
    description: 'Green grass texture for ground cover',
    tags: ['grass', 'ground', 'texture', 'environment']
  },
  // Character Assets
  {
    id: 'player-char-1',
    name: 'Adventure Hero',
    type: 'image',
    category: 'character',
    description: 'Main character sprite for adventure games',
    tags: ['character', 'player', 'hero', 'sprite']
  },
  {
    id: 'npc-1',
    name: 'Friendly NPC',
    type: 'image',
    category: 'character',
    description: 'Non-player character for interactions',
    tags: ['character', 'npc', 'friendly', 'sprite']
  },
  // UI Assets
  {
    id: 'button-ui-1',
    name: 'Modern Button',
    type: 'image',
    category: 'ui',
    description: 'Clean modern button design for UI',
    tags: ['ui', 'button', 'interface', 'modern']
  },
  {
    id: 'panel-ui-1',
    name: 'Info Panel',
    type: 'image',
    category: 'ui',
    description: 'Information display panel',
    tags: ['ui', 'panel', 'info', 'interface']
  },
  // Decoration Assets
  {
    id: 'flower-1',
    name: 'Wild Flower',
    type: 'image',
    category: 'decoration',
    description: 'Colorful wild flower for decoration',
    tags: ['flower', 'decoration', 'colorful', 'nature']
  },
  {
    id: 'gem-1',
    name: 'Magic Gem',
    type: 'image',
    category: 'decoration',
    description: 'Shining magical gem for collectibles',
    tags: ['gem', 'magic', 'collectible', 'decoration']
  },
  // Audio Assets
  {
    id: 'ambient-forest',
    name: 'Forest Ambience',
    type: 'audio',
    category: 'environment',
    description: 'Peaceful forest sounds with birds and wind',
    tags: ['audio', 'ambient', 'forest', 'nature']
  },
  {
    id: 'pickup-sound',
    name: 'Item Pickup',
    type: 'audio',
    category: 'ui',
    description: 'Satisfying pickup sound effect',
    tags: ['audio', 'sfx', 'pickup', 'item']
  }
]

const AssetsTab = ({ 
  project, 
  onSelectAsset, 
  onDeleteAsset, 
  onImportAsset 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [showPremade, setShowPremade] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  // Combine project assets with premade assets
  const allAssets = [
    ...(project?.assets || []),
    ...(showPremade ? PREMADE_ASSETS : [])
  ]

  const filteredAssets = allAssets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = category === 'all' || asset.category === category || asset.type === category
    return matchesSearch && matchesCategory
  }) || []

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type.startsWith('audio/'))) {
      onImportAsset(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
        onImportAsset(file)
      }
    })
  }

  const handleAssetDragStart = (asset) => {
    console.log('Dragging asset:', asset.name)
  }

  return (
    <div 
      className={`h-full flex flex-col ${isDragOver ? 'bg-emerald-500/10 border-2 border-dashed border-emerald-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search assets..."
      />
      
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Assets</option>
            <option value="environment">Environment</option>
            <option value="character">Characters</option>
            <option value="ui">UI Elements</option>
            <option value="decoration">Decorations</option>
            <option value="image">All Images</option>
            <option value="audio">All Audio</option>
          </select>
          <button
            onClick={() => setShowPremade(!showPremade)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPremade 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {showPremade ? 'Hide' : 'Show'} Library
          </button>
          <button
            onClick={() => document.getElementById('asset-upload').click()}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium text-white enhanced-button shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Import
          </button>
          <input
            id="asset-upload"
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        {showPremade && (
          <div className="text-xs text-slate-400 mb-2">
            📚 Asset Library: {PREMADE_ASSETS.length} premade assets available
          </div>
        )}
        {isDragOver && (
          <div className="text-center py-4 text-emerald-500 font-medium">
            📁 Drop files here to import
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-slate-500 mb-4">
              <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
            </div>
            <p className="text-base font-medium text-slate-300 mb-2">No assets found</p>
            <p className="text-sm text-slate-400 mb-4">
              {category === 'all' 
                ? 'Import your own assets or browse the premade library' 
                : `No ${category} assets found. Try a different category or search term.`
              }
            </p>
            {!showPremade && (
              <button
                onClick={() => setShowPremade(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Browse Asset Library
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredAssets.map((asset) => (
              <AssetItem
                key={asset.id}
                asset={asset}
                onSelect={onSelectAsset}
                onDelete={onDeleteAsset}
                onDragStart={handleAssetDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ModernHierarchyPanel = ({ 
  activeTab, 
  onTabChange, 
  project, 
  selectedEntityId, 
  onSelectEntity, 
  onAddEntity, 
  onDeleteEntity,
  onSelectAsset,
  onDeleteAsset,
  onImportAsset
}) => {
  return (
    <div className="h-full flex flex-col enhanced-scrollbar">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => onTabChange('hierarchy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'hierarchy'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Square className="h-4 w-4" />
          Hierarchy
        </button>
        <button
          onClick={() => onTabChange('assets')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'assets'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Image className="h-4 w-4" />
          Assets
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'hierarchy' ? (
          <HierarchyTab
            project={project}
            selectedEntityId={selectedEntityId}
            onSelectEntity={onSelectEntity}
            onAddEntity={onAddEntity}
            onDeleteEntity={onDeleteEntity}
          />
        ) : (
          <AssetsTab
            project={project}
            onSelectAsset={onSelectAsset}
            onDeleteAsset={onDeleteAsset}
            onImportAsset={onImportAsset}
          />
        )}
      </div>
    </div>
  )
}

export default ModernHierarchyPanel
