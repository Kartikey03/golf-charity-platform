import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowRight, Trophy, Heart, Coins, ChevronDown } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Animated counter
function Counter({ from = 0, to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(from)
  const rounded = useSpring(count, { duration: duration * 1000, bounce: 0 })
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    if (inView) count.set(to)
  }, [inView, to])

  useEffect(() => {
    return rounded.on('change', v => setDisplay(Math.round(v)))
  }, [rounded])

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

// Floating number ball
function FloatingBall({ number, delay, x, y }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5, type: 'spring' },
        y: { delay: delay + 0.5, duration: 3 + Math.random(), repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-dark-950 text-sm shadow-lg shadow-brand-500/40"
    >
      {number}
    </motion.div>
  )
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([])
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  useEffect(() => {
    fetch(`${API_URL}/api/charities`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setFeaturedCharities((data || []).filter(c => c.is_featured)))
      .catch(() => {})
  }, [])

  const balls = [
    { number: 12, delay: 0.6, x: 8, y: 25 },
    { number: 7, delay: 0.8, x: 85, y: 15 },
    { number: 33, delay: 1.0, x: 90, y: 60 },
    { number: 21, delay: 1.2, x: 5, y: 65 },
    { number: 45, delay: 1.4, x: 45, y: 80 },
  ]

  return (
    <div className="w-full overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-16 pb-24 overflow-hidden">

        {/* Layered background */}
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Floating balls decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {balls.map((b, i) => <FloatingBall key={i} {...b} />)}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        {/* Hero Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 cursor-default"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-2 w-2 rounded-full bg-brand-400"
              />
              <span className="text-sm text-white/80 font-medium">Monthly draws now active</span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight leading-tight mb-8"
          >
            Play your game.{' '}
            <br />
            <motion.span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #4ade80, #8b5cf6, #4ade80)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              Change their world.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-12"
          >
            The subscription platform that links your golf performance directly to charitable giving — and rewards you with huge monthly prize pools.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="btn-primary flex items-center gap-2 px-8 py-4 text-lg w-full sm:w-auto group"
              >
                Start Making an Impact
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/how-it-works" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto text-center">
                See How It Works
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section ref={statsRef} className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Members', value: 248, suffix: '+' },
            { label: 'Charity Partners', value: 12, suffix: '' },
            { label: 'Prizes Paid', value: 47, suffix: 'k', prefix: '£' },
            { label: 'Monthly Draws', value: 18, suffix: '' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-white mb-1">
                {stat.prefix || ''}<Counter to={stat.value} suffix={stat.suffix} delay={0.5 + i * 0.2} />
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-24 bg-dark-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-white mb-4">Everything you need to play with purpose</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Three pillars. One subscription. Endless impact.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Trophy size={28} />,
                iconBg: 'bg-brand-500/20',
                iconColor: 'text-brand-400',
                shadow: 'shadow-brand-500/20',
                title: 'Track Your Form',
                description: 'Log your latest 5 Stableford scores. No complicated handicaps, just pure performance tracking that feeds into our draw engine.',
                delay: 0,
              },
              {
                icon: <Coins size={28} />,
                iconBg: 'bg-accent-500/20',
                iconColor: 'text-accent-400',
                shadow: 'shadow-accent-500/20',
                title: 'Win Big',
                description: 'Every month, your scores enter a draw. Match 3, 4, or 5 numbers to win a share of the rolling jackpot.',
                delay: 0.1,
              },
              {
                icon: <Heart size={28} />,
                iconBg: 'bg-rose-500/20',
                iconColor: 'text-rose-400',
                shadow: 'shadow-rose-500/20',
                title: 'Support Causes',
                description: 'A minimum of 10% of your subscription goes directly to your chosen charity. Increase it anytime to maximise your impact.',
                delay: 0.2,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: card.delay, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <Card className={`h-full hover:shadow-xl ${card.shadow} transition-shadow duration-300`}>
                  <CardBody className="p-8 text-center sm:text-left flex flex-col items-center sm:items-start text-white">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center mb-6 ${card.iconColor}`}
                    >
                      {card.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                    <p className="text-white/60">{card.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Charities ── */}
      <AnimatePresence>
        {featuredCharities.length > 0 && (
          <section className="py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Spotlight Causes</h2>
                <p className="text-white/60 text-lg">These organisations are making a real difference.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCharities.map((charity, i) => (
                  <motion.div
                    key={charity.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link to={`/charities/${charity.slug || charity.id}`}>
                      <Card className="h-full group border-white/5 hover:border-brand-500/30 transition-colors duration-300">
                        <CardBody className="p-6 flex flex-col h-full">
                          <div className="w-full h-28 rounded-xl bg-dark-800 mb-5 flex items-center justify-center overflow-hidden">
                            {charity.logo_url
                              ? <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                              : <Heart className="text-white/20" size={36} />}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{charity.name}</h3>
                          <p className="text-white/60 text-sm flex-grow line-clamp-3 mb-4">{charity.description}</p>
                          <div className="mt-auto flex items-center text-brand-400 font-medium text-sm">
                            Learn more
                            <motion.span
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-1"
                            >
                              →
                            </motion.span>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <Link to="/charities" className="btn-secondary px-6 py-3 inline-flex items-center gap-2">
                  View All Charities <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-500/10 rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent-500/10 rounded-full pointer-events-none"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-dark-950 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to join the club?
          </h2>
          <p className="text-xl text-white/60 mb-10">
            Subscribe today for less than the cost of a sleeve of balls.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link to="/pricing" className="btn-accent px-8 py-4 text-lg inline-block">
              View Plans & Pricing
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  )
}
