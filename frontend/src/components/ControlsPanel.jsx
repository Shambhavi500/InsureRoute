import { motion } from 'framer-motion'
import { useState } from 'react'
import { Zap, Settings, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'

export default function ControlsPanel({ params, onParamsChange, onInject, onRefresh, loading }) {
  const [expanded, setExpanded] = useState(false)

  function toggle(key) {
    onParamsChange({ ...params, [key]: !params[key] })
  }
  function slider(key, val) {
    onParamsChange({ ...params, [key]: val })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-primary" />
          <span className="text-sm font-semibold text-text">Simulation Controls</span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-muted hover:text-text transition-colors"
        >
          {expanded ? 'Less ↑' : 'More ↓'}
        </button>
      </div>

      {/* Primary action row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Inject disruption */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onInject}
          disabled={loading}
          className="relative overflow-hidden flex items-center justify-center gap-2
                     bg-gradient-to-r from-red-700 to-danger text-white
                     rounded-xl py-3 px-4 font-bold text-sm
                     shadow-lg shadow-danger/30 hover:shadow-danger/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-shadow duration-300"
        >
          <motion.span
            animate={loading ? { rotate: 360 } : {}}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={15} />
          </motion.span>
          Inject Disruption
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.button>

        {/* Refresh */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2
                     border border-primary/40 text-primary rounded-xl py-3 px-4
                     font-semibold text-sm hover:bg-primary/10
                     disabled:opacity-50 transition-all duration-200"
        >
          <motion.span
            animate={loading ? { rotate: 360 } : {}}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw size={14} />
          </motion.span>
          Refresh Data
        </motion.button>
      </div>

      {/* Toggle flags */}
      <div className="grid grid-cols-2 gap-3">
        <ToggleFlag
          label="Monsoon"
          value={params.monsoon}
          onChange={() => toggle('monsoon')}
          activeColor="text-blue-400"
        />
        <ToggleFlag
          label="Perishable"
          value={params.perishable}
          onChange={() => toggle('perishable')}
          activeColor="text-cyan-400"
        />
      </div>

      {/* Expanded sliders */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4 pt-2 border-t border-border/50"
        >
          <SliderRow
            label="Anomaly Threshold"
            value={params.threshold}
            min={-0.5} max={0} step={0.01}
            format={v => v.toFixed(2)}
            onChange={v => slider('threshold', v)}
          />
          <SliderRow
            label="Weather Multiplier"
            value={params.weatherMult}
            min={1.0} max={2.0} step={0.1}
            format={v => `×${v.toFixed(1)}`}
            onChange={v => slider('weatherMult', v)}
          />
          <SliderRow
            label="Perishable Multiplier"
            value={params.perishMult}
            min={1.0} max={2.5} step={0.1}
            format={v => `×${v.toFixed(1)}`}
            onChange={v => slider('perishMult', v)}
          />
          <SliderRow
            label="Cargo Value (₹)"
            value={params.cargoValue}
            min={10000} max={500000} step={5000}
            format={v => `₹${Math.round(v).toLocaleString('en-IN')}`}
            onChange={v => slider('cargoValue', +v)}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

function ToggleFlag({ label, value, onChange, activeColor }) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border
                  transition-all duration-200 text-sm font-medium
                  ${value
                    ? 'border-primary/40 bg-primary/10 ' + activeColor
                    : 'border-border/50 bg-surface/50 text-muted hover:border-primary/20'}`}
    >
      <span>{label}</span>
      {value
        ? <ToggleRight size={18} className="text-primary" />
        : <ToggleLeft  size={18} className="text-muted" />
      }
    </button>
  )
}

function SliderRow({ label, value, min, max, step, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-primary font-semibold font-mono">{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(+e.target.value)}
          style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, #334155 ${pct}%)` }}
        />
      </div>
    </div>
  )
}
