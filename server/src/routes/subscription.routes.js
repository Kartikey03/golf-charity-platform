
// =============================================
// server/src/routes/subscription.routes.js
// =============================================
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { stripe } from '../config/stripe.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Create Stripe checkout session
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      customer_email: req.user.email,
      metadata: { user_id: req.user.id, plan },
    })

    res.json({ url: session.url })
  } catch (err) { next(err) }
})

// Get current user subscription
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('subscriptions').select('*').eq('user_id', req.user.id).single()
    res.json(data)
  } catch (err) { next(err) }
})

// Cancel subscription
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const { data: sub } = await supabase
      .from('subscriptions').select('stripe_subscription_id').eq('user_id', req.user.id).single()

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
