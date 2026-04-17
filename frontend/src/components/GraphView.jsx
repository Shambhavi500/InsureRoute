import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { MapPin, Navigation } from 'lucide-react'

// ── Map Indian hubs to a 2D canvas (lon/lat → SVG x/y) ──────────────────────
const LON_MIN = 68, LON_MAX = 96
const LAT_MIN = 8,  LAT_MAX = 34

function project(lon, lat, W, H, pad = 32) {
  const x = pad + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (W - pad * 2)
  const y = pad + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - pad * 2)
  return { x, y }
}

export default function GraphView({ nodes = [], edges = [], route = null }) {
  const W = 700, H = 380

  // Build lookup: id → position
  const posMap = useMemo(() => {
    const m = {}
    nodes.forEach(n => { m[n.id] = project(n.lon, n.lat, W, H) })
    return m
  }, [nodes])

  const pathSet = useMemo(() => {
    if (!route?.path) return new Set()
    const s = new Set()
    for (let i = 0; i < route.path.length - 1; i++) {
      s.add(`${route.path[i]}|${route.path[i + 1]}`)
      s.add(`${route.path[i + 1]}|${route.path[i]}`)
    }
    return s
  }, [route])

  const routeNodeSet = useMemo(() => new Set(route?.path ?? []), [route])
  const disrupted    = route?.disruption_detected ?? false

  // ── Edge colour ──────────────────────────────────────────────────────────
  function edgeColor(src, tgt) {
    if (pathSet.has(`${src}|${tgt}`)) return disrupted ? '#ef4444' : '#3b82f6'
    return 'rgba(51,65,85,0.5)'
  }
  function edgeWidth(src, tgt) { return pathSet.has(`${src}|${tgt}`) ? 2.5 : 0.8 }

  // ── Node colour ──────────────────────────────────────────────────────────
  function nodeColor(id) {
    if (id === route?.origin)      return '#facc15'
    if (id === route?.destination) return '#22c55e'
    if (routeNodeSet.has(id))      return disrupted ? '#ef4444' : '#3b82f6'
    return '#334155'
  }
  function nodeGlow(id) {
    if (id === route?.origin || id === route?.destination) return 'drop-shadow(0 0 6px #facc15)'
    if (routeNodeSet.has(id)) return disrupted ? 'drop-shadow(0 0 6px #ef4444)' : 'drop-shadow(0 0 6px #3b82f6)'
    return 'none'
  }

  return (
    <div className="glass p-4 flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={15} className="text-primary" />
          <span className="text-sm font-semibold text-text">Supply Chain Network</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <Legend color="#facc15" label="Origin" />
          <Legend color="#22c55e" label="Destination" />
          <Legend color={disrupted ? '#ef4444' : '#3b82f6'} label={disrupted ? 'Disrupted' : 'Active Route'} />
          <Legend color="#334155" label="Hub" />
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-[#0a0f1e]"
           style={{ minHeight: '380px' }}>
        {/* Subtle grid */}
        <svg className="absolute inset-0 opacity-10" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Main SVG */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%" height="100%"
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6"
                    refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={disrupted ? '#ef4444' : '#3b82f6'} opacity="0.8" />
            </marker>
          </defs>

          {/* ── Edges ── */}
          {edges.map((e, i) => {
            const s = posMap[e.source], t = posMap[e.target]
            if (!s || !t) return null
            const isActive = pathSet.has(`${e.source}|${e.target}`)
            return (
              <motion.line
                key={i}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={edgeColor(e.source, e.target)}
                strokeWidth={edgeWidth(e.source, e.target)}
                strokeLinecap="round"
                markerEnd={isActive ? 'url(#arrow)' : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.004, duration: 0.3 }}
              />
            )
          })}

          {/* ── Animated route path glow ── */}
          {route?.path && route.path.map((id, i) => {
            if (i === route.path.length - 1) return null
            const next = route.path[i + 1]
            const s = posMap[id], t = posMap[next]
            if (!s || !t) return null
            return (
              <motion.line
                key={`glow-${i}`}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={disrupted ? '#ef4444' : '#3b82f6'}
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.2}
                animate={{ opacity: [0.1, 0.35, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            )
          })}

          {/* ── Nodes ── */}
          {nodes.map((n) => {
            const p = posMap[n.id]
            if (!p) return null
            const isKey = routeNodeSet.has(n.id)
            return (
              <g key={n.id} className="graph-node">
                {/* Outer pulse ring for key nodes */}
                {isKey && (
                  <motion.circle
                    cx={p.x} cy={p.y} r={12}
                    fill="none"
                    stroke={nodeColor(n.id)}
                    strokeWidth={1}
                    animate={{ r: [8, 14], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.circle
                  cx={p.x} cy={p.y}
                  r={isKey ? 7 : 4}
                  fill={nodeColor(n.id)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
                />
                {isKey && (
                  <text
                    x={p.x} y={p.y - 11}
                    textAnchor="middle"
                    fontSize="9"
                    fill="rgba(148,163,184,0.9)"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    {n.label.replace(' Hub', '').replace(' DC', '')}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Route info overlay */}
        {route && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-3 left-3 glass px-3 py-2 text-xs space-y-0.5"
          >
            <div className="text-muted">Active Route</div>
            <div className="text-text font-semibold">
              {route.origin?.replace('_', ' ')} → {route.destination?.replace('_', ' ')}
            </div>
            <div className="flex gap-3 text-muted">
              <span>Time: {route.total_time_hrs}h</span>
              <span>Dist: {route.total_distance_km}km</span>
              <span>Cost: INR {(route.total_cost_inr ?? 0).toLocaleString('en-IN')}</span>
            </div>
            {route.rerouted && (
              <div className="text-warning font-semibold flex items-center gap-1">
                Rerouted ({route.hops} hops)
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}
