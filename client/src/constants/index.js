// =============================================
// client/src/constants/index.js
// =============================================
export const PLANS = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: 100,
    currency: '£',
    interval: 'month',
    stripeKey: typeof process !== 'undefined' ? process.env.STRIPE_PRICE_MONTHLY : (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY : undefined),
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    price: 1000,
    currency: '£',
    interval: 'year',
    badge: 'Save 17%',
    stripeKey: typeof process !== 'undefined' ? process.env.STRIPE_PRICE_YEARLY : (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_STRIPE_PRICE_YEARLY : undefined),
  },
}

export const PRIZE_TIERS = {
  '5-match': { label: '5 Number Match', poolPct: 40, isJackpot: true },
  '4-match': { label: '4 Number Match', poolPct: 35, isJackpot: false },
  '3-match': { label: '3 Number Match', poolPct: 25, isJackpot: false },
}

export const SCORE_MIN = 1
export const SCORE_MAX = 45
export const MAX_SCORES = 5
export const MIN_CHARITY_PCT = 10
