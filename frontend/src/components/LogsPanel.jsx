import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { Terminal, Wifi } from 'lucide-react'

const TYPE_STYLES = {
  disruption: { dot: 'bg-danger',  text: 'text-danger',  badge: 'bg-danger/15 text-danger'  },
  reroute:    { dot: 'bg-warning', text: 'text-warning', badge: 'bg-warning/15 text-warning' },
  savings:    { dot: 'bg-success', text: 'text-success', badge: 'bg-success/15 text-success' },
  info:       { dot: 'bg-primary', text: 'text-primary', badge: 'bg-primary/15 text-primary' },
  model:      { dot: 'bg-purple-400', text: 'text-purple-400', badge: 'bg-purple-400/15 text-purple-400' },
}

export default function LogsPanel({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          <span className="text-sm font-semibold text-text">Live Event Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{logs.length} events</span>
          <div className="status-dot bg-success" />
        </div>
      </div>

      {/* Log stream */}
      <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => {
            const s = TYPE_STYLES[log.type] ?? TYPE_STYLES.info
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="log-entry py-1.5 rounded-r flex items-start gap-3 group"
              >
                {/* Dot timeline */}
                <div className="flex-shrink-0 flex flex-col items-center mt-1.5 gap-0.5">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {i < logs.length - 1 && (
                    <div className="w-px flex-1 bg-border/30 min-h-3" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${s.badge}`}>
                      {log.type}
                    </span>
                    <span className="text-xs text-text leading-tight">{log.message}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted font-mono">{log.time}</span>
                    {log.value && (
                      <span className={`text-[10px] font-bold ${s.text}`}>{log.value}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pt-2 border-t border-border/40 flex items-center gap-2 text-[10px] text-muted">
        <Wifi size={10} className="text-success" />
        <span>Streaming live simulation events · auto-scroll active</span>
      </div>
    </motion.div>
  )
}
