import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Trash2, Plus, 
  Move, RotateCw, Scale, Palette, 
  Square, Circle, Triangle, Type, 
  Play, Pause, Volume2, Code2
} from 'lucide-react'

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true, onRemove, onAdd }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-700 last:border-b-0">
      <div className="flex items-center justify-between p-3 bg-slate-750 hover:bg-slate-700 transition-colors">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </button>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={onAdd}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              title="Add component"
            >
              <Plus className="h-4 w-4 text-slate-400" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 hover:bg-red-600 rounded-lg transition-colors"
              title="Remove component"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const InputField = ({ label, children, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
)

const NumberInput = ({ value, onChange, min, max, step = 1, className = '' }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    min={min}
    max={max}
    step={step}
    className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${className}`}
  />
)

const SliderInput = ({ value, onChange, min, max, step = 1, className = '' }) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      className={`flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider ${className}`}
    />
    <span className="text-xs text-slate-400 w-12 text-right">
      {Math.round(value * 100) / 100}
    </span>
  </div>
)

const ColorInput = ({ value, onChange, className = '' }) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-8 h-8 bg-slate-700 border border-slate-600 rounded cursor-pointer ${className}`}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
    />
  </div>
)

const ToggleInput = ({ checked, onChange, className = '' }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
      checked ? 'bg-emerald-600' : 'bg-slate-600'
    } ${className}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const SelectInput = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

const TextInput = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${className}`}
  />
)

const ModernInspector = ({ selectedEntity, onUpdateEntity, onRemoveComponent, onAddComponent }) => {
  if (!selectedEntity) {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-500 mb-2">
          <Square className="h-12 w-12 mx-auto mb-3 opacity-50" />
        </div>
        <h3 className="text-sm font-medium text-slate-400 mb-1">No Selection</h3>
        <p className="text-xs text-slate-500">Select an object to edit its properties</p>
      </div>
    )
  }

  const transform = selectedEntity.components?.transform || {}
  const sprite = selectedEntity.components?.sprite || {}
  const collider = selectedEntity.components?.collider || {}
  const rigidbody = selectedEntity.components?.rigidbody || {}
  const script = selectedEntity.components?.script || {}
  const audioSource = selectedEntity.components?.audioSource || {}

  const updateComponent = (componentType, updates) => {
    onUpdateEntity(selectedEntity.id, {
      ...selectedEntity,
      components: {
        ...selectedEntity.components,
        [componentType]: {
          ...selectedEntity.components[componentType],
          ...updates
        }
      }
    })
  }

  return (
    <div className="h-full overflow-auto enhanced-scrollbar">
      {/* Entity Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-750">
        <div className="flex items-center gap-2 mb-2">
          <Square className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">Entity Properties</h2>
        </div>
        <TextInput
          value={selectedEntity.name || 'Untitled Entity'}
          onChange={(value) => onUpdateEntity(selectedEntity.id, { ...selectedEntity, name: value })}
          placeholder="Entity Name"
        />
        <div className="mt-2 text-xs text-slate-500">
          ID: {selectedEntity.id}
        </div>
      </div>

      {/* Transform Section */}
      <CollapsibleSection
        title="Transform"
        icon={Move}
        onRemove={() => onRemoveComponent('transform')}
      >
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Position X">
            <NumberInput
              value={transform.x || 0}
              onChange={(value) => updateComponent('transform', { x: value })}
              step={1}
            />
          </InputField>
          <InputField label="Position Y">
            <NumberInput
              value={transform.y || 0}
              onChange={(value) => updateComponent('transform', { y: value })}
              step={1}
            />
          </InputField>
          <InputField label="Width">
            <NumberInput
              value={transform.w || 100}
              onChange={(value) => updateComponent('transform', { w: value })}
              min={1}
              step={1}
            />
          </InputField>
          <InputField label="Height">
            <NumberInput
              value={transform.h || 100}
              onChange={(value) => updateComponent('transform', { h: value })}
              min={1}
              step={1}
            />
          </InputField>
          <InputField label="Rotation">
            <NumberInput
              value={transform.rotation || 0}
              onChange={(value) => updateComponent('transform', { rotation: value })}
              min={-360}
              max={360}
              step={1}
            />
          </InputField>
          <InputField label="Scale">
            <SliderInput
              value={transform.scale || 1}
              onChange={(value) => updateComponent('transform', { scale: value })}
              min={0.1}
              max={3}
              step={0.1}
            />
          </InputField>
        </div>
      </CollapsibleSection>

      {/* Sprite Section */}
      {sprite && (
        <CollapsibleSection
          title="Sprite"
          icon={Palette}
          onRemove={() => onRemoveComponent('sprite')}
        >
          <div className="space-y-3">
            <InputField label="Fill Color">
              <ColorInput
                value={sprite.fill || '#34d399'}
                onChange={(value) => updateComponent('sprite', { fill: value })}
              />
            </InputField>
            <InputField label="Opacity">
              <SliderInput
                value={sprite.opacity || 1}
                onChange={(value) => updateComponent('sprite', { opacity: value })}
                min={0}
                max={1}
                step={0.01}
              />
            </InputField>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Flip X">
                <ToggleInput
                  checked={sprite.flipX || false}
                  onChange={(value) => updateComponent('sprite', { flipX: value })}
                />
              </InputField>
              <InputField label="Flip Y">
                <ToggleInput
                  checked={sprite.flipY || false}
                  onChange={(value) => updateComponent('sprite', { flipY: value })}
                />
              </InputField>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Collider Section */}
      {collider && (
        <CollapsibleSection
          title="Collider"
          icon={Square}
          onRemove={() => onRemoveComponent('collider')}
        >
          <div className="space-y-3">
            <InputField label="Shape">
              <SelectInput
                value={collider.type || 'aabb'}
                onChange={(value) => updateComponent('collider', { type: value })}
                options={[
                  { value: 'aabb', label: 'Rectangle' },
                  { value: 'circle', label: 'Circle' },
                  { value: 'polygon', label: 'Polygon' }
                ]}
              />
            </InputField>
            <InputField label="Is Trigger">
              <ToggleInput
                checked={collider.isTrigger || false}
                onChange={(value) => updateComponent('collider', { isTrigger: value })}
              />
            </InputField>
            <InputField label="Layer">
              <NumberInput
                value={collider.layer || 0}
                onChange={(value) => updateComponent('collider', { layer: value })}
                min={0}
                max={31}
                step={1}
              />
            </InputField>
          </div>
        </CollapsibleSection>
      )}

      {/* Rigidbody Section */}
      {rigidbody && (
        <CollapsibleSection
          title="Rigidbody"
          icon={Move}
          onRemove={() => onRemoveComponent('rigidbody')}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Velocity X">
                <NumberInput
                  value={rigidbody.vx || 0}
                  onChange={(value) => updateComponent('rigidbody', { vx: value })}
                  step={0.1}
                />
              </InputField>
              <InputField label="Velocity Y">
                <NumberInput
                  value={rigidbody.vy || 0}
                  onChange={(value) => updateComponent('rigidbody', { vy: value })}
                  step={0.1}
                />
              </InputField>
            </div>
            <InputField label="Gravity">
              <SliderInput
                value={rigidbody.gravity || 0}
                onChange={(value) => updateComponent('rigidbody', { gravity: value })}
                min={-50}
                max={50}
                step={0.1}
              />
            </InputField>
            <InputField label="Friction">
              <SliderInput
                value={rigidbody.friction || 0}
                onChange={(value) => updateComponent('rigidbody', { friction: value })}
                min={0}
                max={1}
                step={0.01}
              />
            </InputField>
          </div>
        </CollapsibleSection>
      )}

      {/* Script Section */}
      {script && (
        <CollapsibleSection
          title="Script"
          icon={Code2}
          onRemove={() => onRemoveComponent('script')}
        >
          <InputField label="Code">
            <textarea
              value={script.code || ''}
              onChange={(e) => updateComponent('script', { code: e.target.value })}
              className="w-full h-48 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 font-mono enhanced-input enhanced-scrollbar resize-y min-h-[120px] max-h-[300px]"
              placeholder="// Enter your script code here..."
            />
          </InputField>
          <div className="text-xs text-slate-500 mt-1">
            Tip: Use Ctrl+Enter to save, Ctrl+A to select all
          </div>
        </CollapsibleSection>
      )}

      {/* Audio Source Section */}
      {audioSource && (
        <CollapsibleSection
          title="Audio Source"
          icon={Volume2}
          onRemove={() => onRemoveComponent('audioSource')}
        >
          <div className="space-y-3">
            <InputField label="Volume">
              <SliderInput
                value={audioSource.volume || 1}
                onChange={(value) => updateComponent('audioSource', { volume: value })}
                min={0}
                max={1}
                step={0.01}
              />
            </InputField>
            <InputField label="Loop">
              <ToggleInput
                checked={audioSource.loop || false}
                onChange={(value) => updateComponent('audioSource', { loop: value })}
              />
            </InputField>
          </div>
        </CollapsibleSection>
      )}

      {/* Add Component Button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-base font-medium text-slate-300 hover:text-white enhanced-button shadow-md hover:shadow-lg">
          <Plus className="h-5 w-5" />
          Add Component
        </button>
      </div>
    </div>
  )
}

export default ModernInspector
