import { motion } from 'framer-motion'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Dashboard />
    </motion.div>
  )
}
