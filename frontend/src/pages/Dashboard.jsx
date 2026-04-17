import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar        from '../components/Navbar'
import KPICards      from '../components/KPICards'
import GraphView     from '../components/GraphView'
import InsurancePanel from '../components/InsurancePanel'
import ControlsPanel from '../components/ControlsPanel'
import LogsPanel     from '../components/LogsPanel'
import { fetchData, injectDisruption, MOCK_NODES, MOCK_EDGES } from '../services/api'
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts'

// ── Log helpers ──────────────────────────────────────────────────────────────
let logId = 0
function makeLog(type, message, value) {
  return {
    id: ++logId,
    type,
    message,
    value,
    time: new Date().toLocaleTimeString(),
  }
}

const INITIAL_LOGS = [
  makeLog('info',   'InsureRoute system initialised', null),
  makeLog('model',  'Isolation Forest loaded (n=200, contamination=0.08)', null),
  makeLog('info',   'Graph engine ready — 50 nodes, Dijkstra active', null),
  makeLog('info',   'Streaming live data from simulation pipeline', null),
]

// ── Risk trend history ───────────────────────────────────────────────────────
const MAX_TREND = 30

// ── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [isMock,    setIsMock]    = useState(false)
  const [logs,      setLogs]      = useState(INITIAL_LOGS)
  const [trend,     setTrend]     = useState([])
  const [disrupted, setDisrupted] = useState(false)

  const [params, setParams] = useState({
    origin:      'Pune_Hub',
    destination: 'Mumbai_Hub',
    cargoValue:  70000,
    monsoon:     true,
    perishable:  true,
    threshold:   -0.15,
    weatherMult: 1.4,
    perishMult:  1.6,
  })

  const addLog = useCallback((type, msg, val) => {
    setLogs(prev => [...prev.slice(-49), makeLog(type, msg, val)])
  }, [])

  // ── Fetch tick ─────────────────────────────────────────────────────────────
  const fetchTick = useCallback(async (forceInject = false) => {
    setLoading(true)
    try {
      const { data: d, mock } = forceInject
        ? await injectDisruption(params)
        : await fetchData(params)

      setData(d)
      setIsMock(mock)

      const isDisrupted = d.route?.disruption_detected ?? false
      setDisrupted(isDisrupted)

      // Trend
      setTrend(prev => [
        ...prev.slice(-(MAX_TREND - 1)),
        { t: new Date().toLocaleTimeString(), risk: Math.round((d.kpis?.risk ?? 0) * 10) / 10 },
      ])

      // Logs
      if (forceInject) {
        addLog('disruption', `Disruption injected at ${params.origin.replace('_', ' ')}`, `Score: ${d.anomaly_score?.toFixed(3)}`)
        addLog('reroute',    `Alternate route via ${(d.route?.path ?? [])[1]?.replace('_', ' ') ?? 'hub'}`, null)
        addLog('savings',    'Hedge cost recalculated after reroute', `₹${(d.insurance?.savings ?? 0).toLocaleString('en-IN')} saved`)
      } else if (isDisrupted) {
        addLog('disruption', 'Anomaly detected in transit data', `P=${(d.insurance?.disruption_probability * 100).toFixed(1)}%`)
      } else {
        const tips = [
          `Shipment ${params.origin.replace('_', ' ')} → ${params.destination.replace('_', ' ')} on track`,
          `Delay ratio: ${d.raw?.delay_ratio?.toFixed(2) ?? '—'}`,
          `Weather severity: ${((d.raw?.weather_severity ?? 0) * 100).toFixed(0)}%`,
          `Pricing engine updated — hedge ₹${(d.insurance?.before_cost ?? 0).toLocaleString('en-IN')}`,
        ]
        addLog('info', tips[logId % tips.length], null)
      }
    } catch (e) {
      addLog('info', 'Pipeline tick error — retrying', null)
    } finally {
      setLoading(false)
    }
  }, [params, addLog])

  // ── Initial fetch + 3s auto-refresh ───────────────────────────────────────
  useEffect(() => { fetchTick() }, [])
  useEffect(() => {
    const t = setInterval(() => fetchTick(), 3000)
    return () => clearInterval(t)
  }, [fetchTick])

  const ins = data?.insurance
  const kpis = data?.kpis
  const route = data?.route
  const nodes = data?.nodes ?? MOCK_NODES
  const edges = data?.edges ?? MOCK_EDGES

  return (
    <div className="min-h-screen bg-bg flex flex-col relative z-10">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-8 transition-all duration-1000
                        ${disrupted ? 'bg-danger/10' : 'bg-primary/8'}`} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar isLive disrupted={disrupted} isMock={isMock} />

      <main className="flex-1 px-4 md:px-6 py-5 space-y-5 max-w-[1600px] mx-auto w-full">

        {/* ── Disruption alert ── */}
        <AnimatePresence>
          {disrupted && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="border-pulse-red border border-danger/40 bg-danger/10 rounded-xl
                         px-5 py-3 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-danger animate-ping flex-shrink-0" />
              <div>
                <span className="text-danger font-bold text-sm">DISRUPTION DETECTED</span>
                <span className="text-danger/70 text-sm ml-2">
                  {params.origin.replace(/_/g,' ')} → {params.destination.replace(/_/g,' ')} ·
                  Risk {((ins?.disruption_probability ?? 0) * 100).toFixed(1)}% ·
                  Hedge ₹{(ins?.before_cost ?? 0).toLocaleString('en-IN')} → ₹{(ins?.after_cost ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="ml-auto text-xs text-danger/60">Reroute applied</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI row ── */}
        <KPICards kpis={kpis} />

        {/* ── Risk trend sparkline ── */}
        {trend.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                Risk Trend (last {trend.length} ticks)
              </span>
              <span className={`text-xs font-bold ${(trend.at(-1)?.risk ?? 0) > 60 ? 'text-danger' : 'text-success'}`}>
                {trend.at(-1)?.risk ?? 0}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={trend} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={disrupted ? '#ef4444' : '#3b82f6'} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={disrupted ? '#ef4444' : '#3b82f6'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#64748b' }}
                  formatter={v => [`${v}%`, 'Risk']}
                />
                <Area
                  type="monotone" dataKey="risk"
                  stroke={disrupted ? '#ef4444' : '#3b82f6'}
                  strokeWidth={2}
                  fill="url(#riskGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Main grid: Graph + Insurance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <GraphView nodes={nodes} edges={edges} route={route} />
          <InsurancePanel insurance={ins} disrupted={disrupted} />
        </div>

        {/* ── Bottom row: Controls + Logs ── */}
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5">
          <ControlsPanel
            params={params}
            onParamsChange={setParams}
            onInject={() => fetchTick(true)}
            onRefresh={() => fetchTick(false)}
            loading={loading}
          />
          <LogsPanel logs={logs} />
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-[11px] text-muted/50 py-2">
          InsureRoute · Smart Supply Chain Disruption Detection & Dynamic Insurance Pricing · Hackathon 2025
          {isMock && <span className="ml-2 text-warning">· Running in Mock Mode (start FastAPI backend)</span>}
        </div>
      </main>
    </div>
  )
}
