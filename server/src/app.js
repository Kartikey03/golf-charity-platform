// =============================================
// server/src/app.js
// =============================================
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import scoresRoutes from './routes/scores.routes.js'
import drawRoutes from './routes/draw.routes.js'
import charityRoutes from './routes/charity.routes.js'
import winnersRoutes from './routes/winners.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { stripeWebhook } from './webhooks/stripe.webhook.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Stripe webhook needs raw body — mount BEFORE json middleware
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/auth', authRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/scores', scoresRoutes)
app.use('/api/draws', drawRoutes)
app.use('/api/charities', charityRoutes)
app.use('/api/winners', winnersRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export default app
