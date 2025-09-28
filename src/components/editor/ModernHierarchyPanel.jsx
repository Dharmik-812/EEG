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
        <div className={`w-24 h-24 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-200 relative overflow-hidden`}>
          {asset.preview ? (
            <img 
              src={asset.preview} 
              alt={asset.name}
              className="w-full h-full object-cover pixel-art"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <Icon className="h-12 w-12 text-white" />
          )}
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

// Pixel Art Environmental Assets Library
const PREMADE_ASSETS = [
  // Pixel Art Backgrounds
  {
    id: 'pixel-forest-bg',
    name: 'Pixel Forest',
    type: 'image',
    category: 'environment',
    description: '16x16 pixel art forest background with trees and grass',
    tags: ['pixel', 'forest', 'background', 'nature'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNDA4MDQwIi8+CjxyZWN0IHg9IjIiIHk9IjEyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjA0MDIwIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzIwNDAyMCIvPgo8cmVjdCB4PSI2IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSI4IiBmaWxsPSIjMjA0MDIwIi8+Cjwvc3ZnPgo='
  },
  {
    id: 'pixel-mountain-bg',
    name: 'Pixel Mountains',
    type: 'image',
    category: 'environment',
    description: 'Pixel art mountain landscape with snow peaks',
    tags: ['pixel', 'mountain', 'background', 'landscape'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjODc0Q0VCIi8+CjxyZWN0IHg9IjAiIHk9IjEyIiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjQiIHk9IjEwIiB3aWR0aD0iOCIgaGVpZ2h0PSI2IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjEwIiB5PSI4IiB3aWR0aD0iNiIgaGVpZ2h0PSI4IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjQiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-desert-bg',
    name: 'Pixel Desert',
    type: 'image',
    category: 'environment',
    description: 'Pixel art desert with sand dunes and sun',
    tags: ['pixel', 'desert', 'background', 'sand'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRkZENzAwIi8+CjxyZWN0IHg9IjAiIHk9IjEwIiB3aWR0aD0iMTYiIGhlaWdodD0iNiIgZmlsbD0iI0ZGRDcwMCIvPgo8cmVjdCB4PSIyIiB5PSIxMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI0ZGRDcwMCIvPgo8cmVjdCB4PSI4IiB5PSIxMCIgd2lkdGg9IjYiIGhlaWdodD0iNiIgZmlsbD0iI0ZGRDcwMCIvPgo8cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-ocean-bg',
    name: 'Pixel Ocean',
    type: 'image',
    category: 'environment',
    description: 'Pixel art ocean with waves and horizon',
    tags: ['pixel', 'ocean', 'background', 'water'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjODdDSUUiLz4KPHJlY3QgeD0iMCIgeT0iMTAiIHdpZHRoPSIxNiIgaGVpZ2h0PSI2IiBmaWxsPSIjMDA2NkZGIi8+CjxyZWN0IHg9IjAiIHk9IjEyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDA2NkZGIi8+CjxyZWN0IHg9IjQiIHk9IjEwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjMDA2NkZGIi8+CjxyZWN0IHg9IjgiIHk9IjEyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDA2NkZGIi8+CjxyZWN0IHg9IjEyIiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iNiIgZmlsbD0iIzAwNjZGRiIvPgo8L3N2Zz4K'
  },
  {
    id: 'pixel-city-bg',
    name: 'Pixel City',
    type: 'image',
    category: 'environment',
    description: 'Pixel art city skyline with buildings',
    tags: ['pixel', 'city', 'background', 'urban'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMzMzMzMzIi8+CjxyZWN0IHg9IjAiIHk9IjEwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjQiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjgiIGZpbGw9IiM2NjY2NjYiLz4KPHJlY3QgeD0iOCIgeT0iNiIgd2lkdGg9IjQiIGhlaWdodD0iMTAiIGZpbGw9IiM2NjY2NjYiLz4KPHJlY3QgeD0iMTIiIHk9IjEwIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkZGMDAiLz4KPC9zdmc+Cg=='
  },
  
  // Pixel Art Trees
  {
    id: 'pixel-tree-oak',
    name: 'Pixel Oak Tree',
    type: 'image',
    category: 'environment',
    description: '16x16 pixel art oak tree with detailed leaves',
    tags: ['pixel', 'tree', 'oak', 'nature'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzIwNDAyMCIvPgo8cmVjdCB4PSI2IiB5PSIyIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjA0MDIwIi8+CjxyZWN0IHg9IjIiIHk9IjYiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMyMDQwMjAiLz4KPHJlY3QgeD0iMTAiIHk9IjYiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMyMDQwMjAiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-tree-pine',
    name: 'Pixel Pine Tree',
    type: 'image',
    category: 'environment',
    description: 'Pixel art pine tree with triangular shape',
    tags: ['pixel', 'tree', 'pine', 'nature'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDgwMDAiLz4KPHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iNCIgZmlsbD0iIzAwODAwMCIvPgo8cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSIjMDA4MDAwIi8+CjxyZWN0IHg9IjIiIHk9IjQiIHdpZHRoPSIxMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMDA4MDAwIi8+CjxyZWN0IHg9IjQiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDgwMDAiLz4KPHJlY3QgeD0iNiIgeT0iMCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwODAwMCIvPgo8L3N2Zz4K'
  },
  {
    id: 'pixel-tree-palm',
    name: 'Pixel Palm Tree',
    type: 'image',
    category: 'environment',
    description: 'Pixel art palm tree for tropical scenes',
    tags: ['pixel', 'tree', 'palm', 'tropical'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjgiIGhlaWdodD0iMiIgZmlsbD0iIzAwODAwMCIvPgo8cmVjdCB4PSIyIiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMiIgZmlsbD0iIzAwODAwMCIvPgo8cmVjdCB4PSIwIiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMiIgZmlsbD0iIzAwODAwMCIvPgo8cmVjdCB4PSI2IiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDA4MDAwIi8+Cjwvc3ZnPgo='
  },

  // Pixel Art Rocks & Stones
  {
    id: 'pixel-rock-large',
    name: 'Pixel Large Rock',
    type: 'image',
    category: 'environment',
    description: 'Big pixel art stone rock formation',
    tags: ['pixel', 'rock', 'stone', 'decoration'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzY2NjY2NiIvPgo8cmVjdCB4PSIyIiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTAiIGZpbGw9IiM2NjY2NjYiLz4KPHJlY3QgeD0iMCIgeT0iMTAiIHdpZHRoPSIxNiIgaGVpZ2h0PSI2IiBmaWxsPSIjNjY2NjY2Ii8+CjxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4ODg4ODgiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-rock-small',
    name: 'Pixel Small Rock',
    type: 'image',
    category: 'environment',
    description: 'Small pixel art stone for decoration',
    tags: ['pixel', 'rock', 'stone', 'small'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYiIGZpbGw9IiM2NjY2NjYiLz4KPHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzY2NjY2NiIvPgo8cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjODg4ODg4Ii8+Cjwvc3ZnPgo='
  },

  // Pixel Art Grass & Ground
  {
    id: 'pixel-grass-tile',
    name: 'Pixel Grass Tile',
    type: 'image',
    category: 'environment',
    description: 'Pixel art grass texture tile for ground',
    tags: ['pixel', 'grass', 'ground', 'tile'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNDA4MDQwIi8+CjxyZWN0IHg9IjIiIHk9IjEyIiB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMjA0MDIwIi8+CjxyZWN0IHg9IjYiIHk9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSI2IiBmaWxsPSIjMjA0MDIwIi8+CjxyZWN0IHg9IjEwIiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iNCIgZmlsbD0iIzIwNDAyMCIvPgo8cmVjdCB4PSIxNCIgeT0iMTAiIHdpZHRoPSIyIiBoZWlnaHQ9IjYiIGZpbGw9IiMyMDQwMjAiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-dirt-tile',
    name: 'Pixel Dirt Tile',
    type: 'image',
    category: 'environment',
    description: 'Pixel art dirt ground texture',
    tags: ['pixel', 'dirt', 'ground', 'tile'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjOEE2NTQwIi8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM2QjQwMjAiLz4KPHJlY3QgeD0iMTAiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM2QjQwMjAiLz4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM2QjQwMjAiLz4KPC9zdmc+Cg=='
  },

  // Pixel Art Flowers & Plants
  {
    id: 'pixel-flower-red',
    name: 'Pixel Red Flower',
    type: 'image',
    category: 'decoration',
    description: 'Small pixel art red flower',
    tags: ['pixel', 'flower', 'red', 'decoration'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0MDgwNDAiLz4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiM0MDgwNDAiLz4KPHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI0ZGMDAwMCIvPgo8cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGMDAwIi8+CjxyZWN0IHg9IjEwIiB5PSI4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGMDAwIi8+Cjwvc3ZnPgo='
  },
  {
    id: 'pixel-flower-blue',
    name: 'Pixel Blue Flower',
    type: 'image',
    category: 'decoration',
    description: 'Small pixel art blue flower',
    tags: ['pixel', 'flower', 'blue', 'decoration'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0MDgwNDAiLz4KPHJlY3QgeD0iNiIgeT0iMTAiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiM0MDgwNDAiLz4KPHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwMDBGRiIvPgo8cmVjdCB4PSI0IiB5PSI4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDA4MEZGIi8+CjxyZWN0IHg9IjEwIiB5PSI4IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDA4MEZGIi8+Cjwvc3ZnPgo='
  },
  {
    id: 'pixel-bush',
    name: 'Pixel Bush',
    type: 'image',
    category: 'environment',
    description: 'Pixel art green bush for decoration',
    tags: ['pixel', 'bush', 'green', 'decoration'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiMwMDgwMDAiLz4KPHJlY3QgeD0iMiIgeT0iOCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDgwMDAiLz4KPHJlY3QgeD0iNiIgeT0iNiIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwODAwMCIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iOCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDA4MDAwIi8+Cjwvc3ZnPgo='
  },

  // Pixel Art Water Features
  {
    id: 'pixel-water-tile',
    name: 'Pixel Water Tile',
    type: 'image',
    category: 'environment',
    description: 'Pixel art water texture tile',
    tags: ['pixel', 'water', 'tile', 'liquid'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMDA2NkZGIi8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDQ0Q0MiLz4KPHJlY3QgeD0iMTAiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDQ0Q0MiLz4KPHJlY3QgeD0iNiIgeT0iNiIgd2lkdGg9IjQiIGhlaWdodD0iMiIgZmlsbD0iIzAwNDRDQyIvPgo8cmVjdCB4PSIyIiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSIjMDA0NENDIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjQiIGhlaWdodD0iMiIgZmlsbD0iIzAwNDRDQyIvPgo8L3N2Zz4K'
  },
  {
    id: 'pixel-lake',
    name: 'Pixel Lake',
    type: 'image',
    category: 'environment',
    description: 'Pixel art lake with ripples',
    tags: ['pixel', 'lake', 'water', 'ripples'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMiIgeT0iNCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDY2RkYiLz4KPHJlY3QgeD0iNCIgeT0iNiIgd2lkdGg9IjgiIGhlaWdodD0iNCIgZmlsbD0iIzAwNDRDQyIvPgo8cmVjdCB4PSI2IiB5PSI4IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSIjMDA0NENDIi8+Cjwvc3ZnPgo='
  },

  // Pixel Art Characters
  {
    id: 'pixel-player',
    name: 'Pixel Player',
    type: 'image',
    category: 'character',
    description: '16x16 pixel art player character',
    tags: ['pixel', 'player', 'character', 'hero'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iNCIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiMwMDAwRkYiLz4KPHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI0ZGRkZGRiIvPgo8cmVjdCB4PSI2IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkZENzAwIi8+CjxyZWN0IHg9IjYiIHk9IjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+Cg=='
  },
  {
    id: 'pixel-npc',
    name: 'Pixel NPC',
    type: 'image',
    category: 'character',
    description: 'Pixel art non-player character',
    tags: ['pixel', 'npc', 'character', 'friendly'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iNCIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNGRjAwRkYiLz4KPHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI0ZGRkZGRiIvPgo8cmVjdCB4PSI2IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkZENzAwIi8+CjxyZWN0IHg9IjYiIHk9IjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+Cg=='
  },

  // Pixel Art Collectibles
  {
    id: 'pixel-gem',
    name: 'Pixel Gem',
    type: 'image',
    category: 'decoration',
    description: 'Shining pixel art gem for collectibles',
    tags: ['pixel', 'gem', 'collectible', 'shiny'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNGRkZGMDAiLz4KPHJlY3QgeD0iNCIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNGRkZGMDAiLz4KPHJlY3QgeD0iNiIgeT0iOCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI0ZGMDAwMCIvPgo8cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='
  },
  {
    id: 'pixel-coin',
    name: 'Pixel Coin',
    type: 'image',
    category: 'decoration',
    description: 'Pixel art gold coin for currency',
    tags: ['pixel', 'coin', 'gold', 'currency'],
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI0ZGRkYwMCIvPgo8cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkZENzAwIi8+CjxyZWN0IHg9IjYiIHk9IjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkZGMDAiLz4KPHJlY3QgeD0iNiIgeT0iMTIiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkZGMDAiLz4KPC9zdmc+Cg=='
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
