import { motion } from 'framer-motion'
import { Shield, Activity, Wifi, WifiOff, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar({ isLive, isMock, disrupted }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative z-20 flex items-center justify-between px-6 py-3
                 border-b border-border/50 bg-bg/80 backdrop-blur-xl"
    >
      {/* ── Left: Logo ── */}
      <div className="flex items-center gap-3">
        <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl
                        ${disrupted ? 'bg-danger/20 glow-red' : 'bg-primary/20 glow-blue'} transition-all duration-700`}>
          <Shield size={18} className={disrupted ? 'text-danger' : 'text-primary'} />
          {disrupted && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full
                           border-2 border-bg animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight gradient-text">InsureRoute</h1>
          <p className="text-xs text-muted leading-none">Route Smarter. Hedge Better.</p>
        </div>
      </div>

      {/* ── Center: Status pills ── */}
      <div className="hidden md:flex items-center gap-2">
        <StatusPill
          label={disrupted ? 'DISRUPTION' : 'OPERATIONAL'}
          color={disrupted ? 'danger' : 'success'}
          pulse
        />
        <StatusPill label="ML ACTIVE" color="primary" />
        <StatusPill label="GRAPH ENGINE" color="primary" />
      </div>

      {/* ── Right: Connection + clock ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          {isMock
            ? <><WifiOff size={13} className="text-warning" /><span className="text-warning">Mock Mode</span></>
            : <><Wifi size={13} className="text-success" /><span className="text-success">Live API</span></>
          }
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          <span className="font-mono">{time.toLocaleTimeString()}</span>
        </div>
        <div className={`status-dot ${isLive ? 'bg-success' : 'bg-muted'}`} />
      </div>
    </motion.nav>
  )
}

function StatusPill({ label, color, pulse }) {
  const colors = {
    danger:  'bg-danger/15  text-danger  border-danger/30',
    success: 'bg-success/15 text-success border-success/30',
    primary: 'bg-primary/15 text-primary border-primary/30',
  }
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${colors[color]}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />}
      {label}
    </div>
  )
}
