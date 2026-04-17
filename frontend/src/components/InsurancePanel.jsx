import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Shield, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, large = false }) {
  const ref = useRef(null)
  const prev = useRef(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const from = prev.current
    prev.current = value
    let raf
    const start = performance.now()
    const dur = 1000
    function step(now) {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      const cur = from + (value - from) * ease
      node.textContent = prefix + cur.toFixed(decimals) + suffix
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, prefix, suffix, decimals])
  return (
    <span
      ref={ref}
      className={large
        ? 'text-5xl font-black tracking-tight leading-none'
        : 'text-2xl font-bold leading-none'}
    >
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  )
}

export default function InsurancePanel({ insurance, disrupted }) {
  if (!insurance) return null

  const {
    cargo_value, disruption_probability, base_premium,
    before_cost, after_cost, savings, savings_pct,
    weather_multiplier, perishable_multiplier,
  } = insurance

  const riskPct = Math.round((disruption_probability ?? 0) * 100)
  const gaugeColor = riskPct > 60 ? '#ef4444' : riskPct > 30 ? '#facc15' : '#22c55e'
  const gaugeData = [{ value: riskPct, fill: gaugeColor }]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass flex flex-col gap-5 p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${disrupted ? 'bg-danger/20' : 'bg-primary/20'}`}>
          <Shield size={15} className={disrupted ? 'text-danger' : 'text-primary'} />
        </div>
        <span className="text-sm font-semibold text-text">Insurance Hedge Panel</span>
        {disrupted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto text-xs bg-danger/20 text-danger border border-danger/30
                       px-2 py-0.5 rounded-full font-semibold"
          >
            HIGH RISK
          </motion.span>
        )}
      </div>

      {/* Risk Gauge */}
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="65%" outerRadius="100%"
              startAngle={225} endAngle={-45}
              data={gaugeData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                background={{ fill: '#1e293b' }}
                dataKey="value"
                cornerRadius={8}
                animationBegin={0}
                animationDuration={1200}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color: gaugeColor }}>{riskPct}%</span>
            <span className="text-[9px] text-muted font-semibold uppercase tracking-wide">RISK</span>
          </div>
        </div>

        {/* Multipliers */}
        <div className="flex-1 space-y-2">
          <MultiplierRow label="Weather" value={weather_multiplier} active={weather_multiplier > 1} icon="" />
          <MultiplierRow label="Perishable" value={perishable_multiplier} active={perishable_multiplier > 1} icon="" />
          <div className="flex justify-between text-xs pt-1 border-t border-border/50">
            <span className="text-muted">Cargo Value</span>
            <span className="text-text font-semibold">₹{cargo_value.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Base Premium</span>
            <span className="text-text">₹{(base_premium ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-3">
        <CostBox label="BEFORE REROUTE" value={before_cost} accent="danger" icon={TrendingUp} />
        <CostBox label="AFTER REROUTE"  value={after_cost}  accent="success" icon={TrendingDown} />
      </div>

      {/* Savings banner */}
      <motion.div
        key={savings_pct}
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className={`rounded-xl p-4 flex items-center justify-between
                   ${disrupted
                     ? 'bg-gradient-to-r from-success/20 to-success/5 border border-success/30 glow-green'
                     : 'bg-gradient-to-r from-surface to-bg border border-border/50'}`}
      >
        <div>
          <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">
            Est. Savings via Rerouting
          </div>
          <div className="gradient-text-green font-black text-3xl leading-none">
            ₹{(savings ?? 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black ${disrupted ? 'text-success' : 'text-muted'}`}>
            {savings_pct}%
          </div>
          <div className="text-xs text-muted">reduction</div>
        </div>
      </motion.div>

      {/* Animated savings bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted">
          <span>Hedge Reduction Progress</span>
          <span>{savings_pct}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${savings_pct}%` }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function MultiplierRow({ label, value, active, icon }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs">{icon}</span>
      <span className="text-xs text-muted w-16">{label}</span>
      <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${active ? 'bg-warning' : 'bg-muted'}`}
          style={{ width: active ? `${((value - 1) / 0.6) * 100}%` : '0%' }}
        />
      </div>
      <span className={`text-xs font-bold ${active ? 'text-warning' : 'text-muted'}`}>×{value}</span>
    </div>
  )
}

function CostBox({ label, value, accent, icon: Icon }) {
  const styles = {
    danger:  'border-danger/30 bg-danger/10',
    success: 'border-success/30 bg-success/10',
  }
  const textStyles = { danger: 'text-danger', success: 'text-success' }
  return (
    <div className={`rounded-xl border p-3 ${styles[accent]}`}>
      <div className="flex items-center gap-1 mb-2">
        <Icon size={11} className={textStyles[accent]} />
        <span className="text-[10px] text-muted font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-xl font-black ${textStyles[accent]}`}>
        ₹{(value ?? 0).toLocaleString('en-IN')}
      </div>
    </div>
  )
}
