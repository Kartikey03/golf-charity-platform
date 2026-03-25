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

// Verify and sync subscription status from Stripe (for local dev without webhooks)
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    // Find the customer in Stripe by email
    const customers = await stripe.customers.list({ email: req.user.email, limit: 1 })
    
    if (customers.data.length === 0) {
      return res.json({ status: 'none' })
    }

    const customer = customers.data[0]
    
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return res.json({ status: 'none' })
    }

    const stripeSub = subscriptions.data[0]
    const plan = stripeSub.items.data[0]?.price?.id === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'

    // Delete any existing subscription for this user, then insert fresh
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', req.user.id)

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: req.user.id,
        plan: plan,
        status: 'active',
        stripe_customer_id: customer.id,
        stripe_subscription_id: stripeSub.id,
        stripe_price_id: stripeSub.items.data[0]?.price?.id,
        amount_pence: stripeSub.items.data[0]?.price?.unit_amount || 0,
        currency: stripeSub.items.data[0]?.price?.currency || 'inr',
        current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Subscription upsert error:', error)
      throw error
    }

    res.json(data)
  } catch (err) { next(err) }
})

// Get current user subscription
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('subscriptions').select('*').eq('user_id', req.user.id).single()
    res.json(data || { status: 'none' })
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
