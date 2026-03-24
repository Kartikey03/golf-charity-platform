
// =============================================
// server/src/services/drawEngine.service.js
// THE CORE DRAW LOGIC
// =============================================
import { supabase } from '../config/supabase.js'

/**
 * Generate draw numbers.
 * - random: picks 5 unique random ints from score range 1-45
 * - algorithmic: weighted by frequency of scores across all active users
 */
export async function generateDrawNumbers(drawType = 'random') {
  if (drawType === 'random') {
    return pickRandom(5, 1, 45)
  }

  // Algorithmic: fetch all active users' latest 5 scores
  const { data: scores } = await supabase
    .from('golf_scores')
    .select('score')

  if (!scores?.length) return pickRandom(5, 1, 45)

  // Build frequency map
  const freq = {}
  for (const { score } of scores) {
    freq[score] = (freq[score] || 0) + 1
  }

  // Weighted random selection (bias toward most frequent scores)
  const pool = []
  for (let i = 1; i <= 45; i++) {
    const weight = freq[i] || 1
    for (let w = 0; w < weight; w++) pool.push(i)
  }

  const picked = new Set()
  while (picked.size < 5) {
    picked.add(pool[Math.floor(Math.random() * pool.length)])
  }
  return [...picked].sort((a, b) => a - b)
}

function pickRandom(count, min, max) {
  const nums = new Set()
  while (nums.size < count) nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  return [...nums].sort((a, b) => a - b)
}

/**
 * Process draw: match user scores against drawn numbers, calculate winners
 */
export async function processDraw(drawPeriodId) {
  const { data: draw } = await supabase
    .from('draw_periods').select('*').eq('id', drawPeriodId).single()

  if (!draw || !draw.drawn_numbers) throw new Error('Draw not configured')

  const drawnSet = new Set(draw.drawn_numbers)

  // Get all draw entries for this period
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*, profiles(full_name, email)')
    .eq('draw_period_id', drawPeriodId)

  const results = []
  for (const entry of entries) {
    if (!entry.scores_snapshot?.length) continue

    const matches = entry.scores_snapshot.filter(s => drawnSet.has(s)).length
    let tier = null
    if (matches >= 5) tier = '5-match'
    else if (matches === 4) tier = '4-match'
    else if (matches === 3) tier = '3-match'

    await supabase.from('draw_entries').update({
      match_count: matches,
      is_winner: !!tier,
      prize_tier: tier,
    }).eq('id', entry.id)

    if (tier) results.push({ entry, tier, matches })
  }

  return results
}

/**
 * Calculate prize pool from active subscriber count
 */
export async function calculatePrizePool(subscriberCount, plan = 'monthly') {
  const { data: config } = await supabase
    .from('prize_pool_config').select('*').limit(1).single()

  const sub = config[`plan_${plan}_pence`]
  const poolPct = config.pool_contribution_pct / 100
  const total = subscriberCount * sub * poolPct

  return {
    jackpot: Math.floor(total * (config.match5_pct / 100)),
    pool4: Math.floor(total * (config.match4_pct / 100)),
    pool3: Math.floor(total * (config.match3_pct / 100)),
    total,
  }
}
