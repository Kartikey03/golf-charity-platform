import { motion } from 'framer-motion'

export function Card({ children, className = '', animate = false, delay = 0 }) {
  const base = (
    <div className={`glass-card ${className}`}>
      {children}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={`glass-card ${className}`}
      >
        {children}
      </motion.div>
    )
  }

  return base
}

export function HoverCard({ children, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`glass-card cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-white/10 bg-black/20 rounded-b-2xl ${className}`}>
      {children}
    </div>
  )
}
