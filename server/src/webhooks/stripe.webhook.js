import { stripe } from '../config/stripe.js'
import { supabase } from '../config/supabase.js'

export async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata.user_id
      const plan = session.metadata.plan

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: plan,
        status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        amount_pence: session.amount_total,
        currency: session.currency || 'inr',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + (plan === 'yearly' ? 365 : 30) * 86400000
        ).toISOString(),
      }, { onConflict: 'user_id' })
      break
    }
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const status = sub.status === 'active' ? 'active'
        : sub.status === 'canceled' ? 'cancelled'
        : sub.status === 'past_due' ? 'past_due' : 'lapsed'

      await supabase.from('subscriptions')
        .update({ status, cancel_at_period_end: sub.cancel_at_period_end })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  res.json({ received: true })
}
