import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Trash2, Plus, 
  Move, RotateCw, Scale, Palette, 
  Square, Circle, Triangle, Type, 
  Play, Pause, Volume2, Code2, Eye, EyeOff,
  Box, Gamepad2, Layers, Sparkles, Lightbulb, Sparkles as SparklesIcon
} from 'lucide-react'
import { transpileCSharpToJS, validateCSharpSyntax } from '../../utils/csharpTranspiler'

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true, onRemove, onAdd, enabled = true, onToggleEnabled }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-700 last:border-b-0">
      <div className="flex items-center justify-between p-3 bg-slate-750 hover:bg-slate-700 transition-colors">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: enabled ? 'rgb(226 232 240)' : 'rgb(100 116 139)' }}
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
          {onToggleEnabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleEnabled(!enabled)
              }}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              title={enabled ? "Disable component" : "Enable component"}
            >
              <Eye className={`h-4 w-4 ${enabled ? 'text-slate-400' : 'text-slate-600'}`} />
            </button>
          )}
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

const COMPONENT_TYPES = [
  { id: 'sprite', name: 'Sprite', icon: Palette, description: 'Visual rendering component' },
  { id: 'collider', name: 'Collider', icon: Box, description: 'Collision detection' },
  { id: 'rigidbody', name: 'Rigidbody', icon: Gamepad2, description: 'Physics simulation' },
  { id: 'animation', name: 'Animation', icon: RotateCw, description: 'Sprite animation controller' },
  { id: 'emitter', name: 'Particle Emitter', icon: Sparkles, description: 'Particle effects' },
  { id: 'script', name: 'Script', icon: Code2, description: 'Custom behavior code' },
  { id: 'audioSource', name: 'Audio Source', icon: Volume2, description: 'Sound playback' },
  { id: 'text', name: 'Text', icon: Type, description: 'Text rendering' },
  { id: 'tilemap', name: 'Tilemap', icon: Layers, description: 'Tile-based map' },
]

const AddComponentMenu = ({ selectedEntity, onAddComponent }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const availableComponents = COMPONENT_TYPES.filter(
    comp => !selectedEntity.components?.[comp.id]
  )

  const handleAddComponent = (componentId) => {
    const defaults = {
      sprite: { fill: '#34d399' },
      collider: { type: 'aabb', isTrigger: false, layer: 0 },
      rigidbody: { vx: 0, vy: 0, gravity: 0, friction: 0, angularVelocity: 0, torque: 0, angularDrag: 0 },
      animation: { current: '', speed: 10 },
      emitter: { rate: 10, speed: 80, life: 0.6, size: 2, color: '#ffffff', gravity: 0 },
      script: { code: '' },
      audioSource: { volume: 1, loop: false, playOnAwake: true, assetId: null },
      text: { value: 'New Text', size: 24, color: '#065f46' },
      tilemap: { tileWidth: 32, tileHeight: 32, cols: 10, rows: 10, data: [] },
    }
    
    onAddComponent?.(componentId, defaults[componentId] || {})
    setIsOpen(false)
  }

  return (
    <div className="p-4 relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-base font-medium text-slate-300 hover:text-white enhanced-button shadow-md hover:shadow-lg transition-colors"
      >
        <Plus className="h-5 w-5" />
        Add Component
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 max-h-64 overflow-auto"
          >
            {availableComponents.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                All components added
              </div>
            ) : (
              availableComponents.map((comp) => {
                const Icon = comp.icon
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleAddComponent(comp.id)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-xs text-slate-400">{comp.description}</div>
                    </div>
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ScriptEditorSection = ({ script, updateComponent, onRemoveComponent }) => {
  const [language, setLanguage] = useState(script.language || 'javascript')
  const [code, setCode] = useState(script.originalCode || script.code || '')
  const [errors, setErrors] = useState([])
  const textareaRef = useRef(null)

  useEffect(() => {
    const currentCode = script.originalCode || script.code || ''
    setCode(currentCode)
    setLanguage(script.language || 'javascript')
  }, [script.code, script.language, script.originalCode])

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    
    if (language === 'csharp') {
      const validationErrors = validateCSharpSyntax(newCode)
      setErrors(validationErrors)
    } else {
      setErrors([])
    }
  }

  const handleSave = () => {
    let finalCode = code
    
    if (language === 'csharp') {
      try {
        finalCode = transpileCSharpToJS(code)
        setErrors([])
      } catch (error) {
        setErrors([`Transpilation error: ${error.message}`])
        return
      }
    }
    
    updateComponent('script', { 
      code: finalCode,
      language: language,
      originalCode: language === 'csharp' ? code : undefined
    })
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      textareaRef.current?.select()
    }
  }

  const csharpExamples = [
    {
      name: 'Move with Arrow Keys',
      code: `public void OnUpdate(string event, object payload, object api) {
    float speed = 120.0f;
    if (api.input.down("left")) api.moveBy(-speed * payload.dt, 0);
    if (api.input.down("right")) api.moveBy(speed * payload.dt, 0);
    if (api.input.down("up")) api.moveBy(0, -speed * payload.dt);
    if (api.input.down("down")) api.moveBy(0, speed * payload.dt);
}`
    },
    {
      name: 'Play Sound on Click',
      code: `public void OnClick(string event, object payload, object api) {
    api.audio.play("asset-click", new { volume = 0.6 });
}`
    }
  ]

  const jsExamples = [
    {
      name: 'Move with Arrow Keys',
      code: `function onUpdate(event, payload, api) {
  const speed = 120;
  if (api.input.down('left')) api.moveBy(-speed * payload.dt, 0);
  if (api.input.down('right')) api.moveBy(speed * payload.dt, 0);
  if (api.input.down('up')) api.moveBy(0, -speed * payload.dt);
  if (api.input.down('down')) api.moveBy(0, speed * payload.dt);
}`
    },
    {
      name: 'Play Sound on Click',
      code: `function onClick(event, payload, api) {
  api.audio.play('asset-click', { volume: 0.6 });
}`
    }
  ]

  return (
    <CollapsibleSection
      title="Script"
      icon={Code2}
      enabled={script.enabled !== false}
      onToggleEnabled={(enabled) => updateComponent('script', { enabled })}
      onRemove={() => onRemoveComponent('script')}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <InputField label="Language" className="flex-1">
            <SelectInput
              value={language}
              onChange={(value) => {
                setLanguage(value)
                updateComponent('script', { language: value })
              }}
              options={[
                { value: 'javascript', label: 'JavaScript' },
                { value: 'csharp', label: 'C#' }
              ]}
            />
          </InputField>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors ml-2"
          >
            Save (Ctrl+Enter)
          </button>
        </div>

        {errors.length > 0 && (
          <div className="p-2 bg-red-900/30 border border-red-700 rounded text-xs text-red-400">
            {errors.map((error, i) => (
              <div key={i}>⚠ {error}</div>
            ))}
          </div>
        )}

        <InputField label="Code">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-64 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-200 font-mono enhanced-input enhanced-scrollbar resize-y min-h-[200px] max-h-[400px]"
            placeholder={language === 'csharp' 
              ? "// Enter your C# script code here...\npublic void OnUpdate(string event, object payload, object api) {\n  // Called every frame\n}"
              : "// Enter your JavaScript code here...\nfunction onUpdate(event, payload, api) {\n  // Called every frame\n}"
            }
            spellCheck={false}
          />
        </InputField>

        <div className="flex flex-wrap gap-2">
          <div className="text-xs text-slate-400">Examples:</div>
          {(language === 'csharp' ? csharpExamples : jsExamples).map((ex, i) => (
            <button
              key={i}
              onClick={() => handleCodeChange(ex.code)}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {ex.name}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3" />
            <span>Tip: Use Ctrl+Enter to save, Ctrl+A to select all</span>
          </div>
          {language === 'csharp' && (
            <div className="text-emerald-400 flex items-center gap-1.5">
              <SparklesIcon className="h-3 w-3" />
              <span>C# code will be automatically transpiled to JavaScript</span>
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
}

const ModernInspector = ({ selectedEntity, onUpdateEntity, onRemoveComponent, onAddComponent, project, onImportAsset }) => {
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
  const animation = selectedEntity.components?.animation || {}
  const emitter = selectedEntity.components?.emitter || {}
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
        enabled={true}
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
          enabled={sprite.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('sprite', { enabled })}
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
          icon={Box}
          enabled={collider.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('collider', { enabled })}
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
          icon={Gamepad2}
          enabled={rigidbody.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('rigidbody', { enabled })}
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
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Acceleration X">
                <NumberInput
                  value={rigidbody.ax || 0}
                  onChange={(value) => updateComponent('rigidbody', { ax: value })}
                  step={0.1}
                />
              </InputField>
              <InputField label="Acceleration Y">
                <NumberInput
                  value={rigidbody.ay || 0}
                  onChange={(value) => updateComponent('rigidbody', { ay: value })}
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
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Angular Velocity">
                <NumberInput
                  value={rigidbody.angularVelocity || 0}
                  onChange={(value) => updateComponent('rigidbody', { angularVelocity: value })}
                  step={0.1}
                />
              </InputField>
              <InputField label="Torque">
                <NumberInput
                  value={rigidbody.torque || 0}
                  onChange={(value) => updateComponent('rigidbody', { torque: value })}
                  step={0.1}
                />
              </InputField>
            </div>
            <InputField label="Angular Drag">
              <SliderInput
                value={rigidbody.angularDrag || 0}
                onChange={(value) => updateComponent('rigidbody', { angularDrag: value })}
                min={0}
                max={10}
                step={0.1}
              />
            </InputField>
          </div>
        </CollapsibleSection>
      )}

      {/* Animation Section */}
      {animation && (
        <CollapsibleSection
          title="Animation"
          icon={RotateCw}
          enabled={animation.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('animation', { enabled })}
          onRemove={() => onRemoveComponent('animation')}
        >
          <div className="space-y-3">
            <InputField label="Current Animation">
              <TextInput
                value={animation.current || ''}
                onChange={(value) => updateComponent('animation', { current: value })}
                placeholder="Animation name"
              />
            </InputField>
            <InputField label="Speed (FPS)">
              <NumberInput
                value={animation.speed || 10}
                onChange={(value) => updateComponent('animation', { speed: value })}
                min={1}
                max={60}
                step={1}
              />
            </InputField>
            <div className="text-xs text-slate-500 p-2 bg-slate-800 rounded">
              <strong>Note:</strong> Animation requires a sprite with a spritesheet. Use the Timeline panel to configure animation frames.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Particle Emitter Section */}
      {emitter && (
        <CollapsibleSection
          title="Particle Emitter"
          icon={Sparkles}
          enabled={emitter.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('emitter', { enabled })}
          onRemove={() => onRemoveComponent('emitter')}
        >
          <div className="space-y-3">
            <InputField label="Emission Rate (particles/sec)">
              <NumberInput
                value={emitter.rate || 10}
                onChange={(value) => updateComponent('emitter', { rate: value })}
                min={0}
                max={1000}
                step={1}
              />
            </InputField>
            <InputField label="Particle Speed">
              <NumberInput
                value={emitter.speed || 80}
                onChange={(value) => updateComponent('emitter', { speed: value })}
                min={0}
                max={500}
                step={1}
              />
            </InputField>
            <InputField label="Particle Lifetime (sec)">
              <NumberInput
                value={emitter.life || 0.6}
                onChange={(value) => updateComponent('emitter', { life: value })}
                min={0.1}
                max={10}
                step={0.1}
              />
            </InputField>
            <InputField label="Particle Size">
              <NumberInput
                value={emitter.size || 2}
                onChange={(value) => updateComponent('emitter', { size: value })}
                min={1}
                max={50}
                step={0.5}
              />
            </InputField>
            <InputField label="Particle Color">
              <ColorInput
                value={emitter.color || '#ffffff'}
                onChange={(value) => updateComponent('emitter', { color: value })}
              />
            </InputField>
            <InputField label="Gravity">
              <NumberInput
                value={emitter.gravity || 0}
                onChange={(value) => updateComponent('emitter', { gravity: value })}
                min={-100}
                max={100}
                step={1}
              />
            </InputField>
            <InputField label="One Shot">
              <ToggleInput
                checked={emitter.oneShot || false}
                onChange={(value) => updateComponent('emitter', { oneShot: value })}
              />
            </InputField>
            {emitter.oneShot && (
              <div className="text-xs text-slate-500 p-2 bg-slate-800 rounded">
                One-shot emitters will be removed after the burst completes.
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Script Section */}
      {script && (
        <ScriptEditorSection
          script={script}
          updateComponent={updateComponent}
          onRemoveComponent={onRemoveComponent}
        />
      )}

      {/* Audio Source Section */}
      {audioSource && (
        <CollapsibleSection
          title="Audio Source"
          icon={Volume2}
          enabled={audioSource.enabled !== false}
          onToggleEnabled={(enabled) => updateComponent('audioSource', { enabled })}
          onRemove={() => onRemoveComponent('audioSource')}
        >
          <div className="space-y-3">
            <InputField label="Audio Asset">
              <SelectInput
                value={audioSource.assetId || ''}
                onChange={(value) => updateComponent('audioSource', { assetId: value || null })}
                options={[
                  { value: '', label: 'None' },
                  ...(project?.assets?.filter(a => a.type === 'audio') || []).map(a => ({
                    value: a.id,
                    label: a.name
                  }))
                ]}
              />
            </InputField>
            <div className="relative">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && onImportAsset) {
                      onImportAsset(file).then((asset) => {
                        if (asset) {
                          updateComponent('audioSource', { assetId: asset.id })
                        }
                      })
                    }
                    e.target.value = ''
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Volume2 className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <div className="text-sm text-slate-300">Drop audio file or click to browse</div>
                <div className="text-xs text-slate-500 mt-1">Supports: MP3, WAV, OGG</div>
              </div>
            </div>
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
            <InputField label="Play on Awake">
              <ToggleInput
                checked={audioSource.playOnAwake !== false}
                onChange={(value) => updateComponent('audioSource', { playOnAwake: value })}
              />
            </InputField>
          </div>
        </CollapsibleSection>
      )}

      {/* Add Component Button */}
      <AddComponentMenu
        selectedEntity={selectedEntity}
        onAddComponent={onAddComponent}
      />
    </div>
  )
}

export default ModernInspector
