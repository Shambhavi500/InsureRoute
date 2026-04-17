import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { AlertTriangle, Clock, TrendingUp, PiggyBank } from 'lucide-react'

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 1, className = '' }) {
  const ref = useRef(null)
  const prev = useRef(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const from = prev.current
    prev.current = value
    const ctrl = animate(from, value, {
      duration: 0.9,
      ease: [0.4, 0, 0.2, 1],
      onUpdate(v) {
        node.textContent = prefix + v.toFixed(decimals) + suffix
      },
    })
    return () => ctrl.stop()
  }, [value, prefix, suffix, decimals])

  return <span ref={ref} className={className}>{prefix}{value.toFixed(decimals)}{suffix}</span>
}

const CARDS = [
  {
    key: 'sla',
    label: 'SLA Breach Rate',
    suffix: '%',
    icon: AlertTriangle,
    grad: 'from-red-900/40 to-red-800/10',
    border: 'border-red-500/20',
    iconBg: 'bg-danger/20',
    iconColor: 'text-danger',
    textColor: 'text-danger',
    desc: 'of total shipments',
    threshold: (v) => v > 10 ? 'danger' : v > 5 ? 'warning' : 'success',
  },
  {
    key: 'delay',
    label: 'Avg Delay',
    suffix: '%',
    prefix: '+',
    icon: Clock,
    grad: 'from-yellow-900/40 to-yellow-800/10',
    border: 'border-yellow-500/20',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
    textColor: 'text-warning',
    desc: 'vs scheduled transit',
    threshold: (v) => v > 15 ? 'danger' : v > 7 ? 'warning' : 'success',
  },
  {
    key: 'risk',
    label: 'Current Risk',
    suffix: '%',
    icon: TrendingUp,
    grad: 'from-blue-900/40 to-blue-800/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    textColor: 'text-primary',
    desc: 'disruption probability',
    threshold: (v) => v > 60 ? 'danger' : v > 30 ? 'warning' : 'success',
  },
  {
    key: 'savings',
    label: 'Cost Savings',
    suffix: '%',
    icon: PiggyBank,
    grad: 'from-green-900/40 to-green-800/10',
    border: 'border-green-500/20',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    textColor: 'text-success',
    desc: 'via rerouting hedge',
    threshold: () => 'success',
  },
]

const LEVEL_STYLES = {
  danger:  'text-danger',
  warning: 'text-warning',
  success: 'text-success',
}

export default function KPICards({ kpis }) {
  if (!kpis) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const value = kpis[card.key] ?? 0
        const level = card.threshold(value)
        const Icon  = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`glass glass-hover p-5 flex flex-col gap-3 bg-gradient-to-br ${card.grad} ${card.border}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                <Icon size={14} className={card.iconColor} />
              </div>
            </div>

            {/* Main value */}
            <div className={`text-4xl font-black leading-none ${LEVEL_STYLES[level]}`}>
              <AnimatedNumber
                value={value}
                prefix={card.prefix || ''}
                suffix={card.suffix}
                decimals={1}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{card.desc}</span>
              <MiniSparkle level={level} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function MiniSparkle({ level }) {
  const colors = { danger: 'bg-danger', warning: 'bg-warning', success: 'bg-success' }
  return (
    <div className="flex gap-0.5 items-end h-5">
      {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${colors[level]} opacity-60`}
          style={{ height: `${h * 2}px` }}
          animate={{ scaleY: [1, 0.6, 1] }}
          transition={{ delay: i * 0.12, duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  )
}
