// =============================================
// server/src/services/drawEngine.service.js
// =============================================
import { supabase } from '../config/supabase.js'

export async function generateDrawNumbers(drawType = 'random') {
  if (drawType === 'random') {
    return pickRandom(5, 1, 45)
  }

  const { data: scores } = await supabase.from('golf_scores').select('score')
  if (!scores?.length) return pickRandom(5, 1, 45)

  const freq = {}
  for (const { score } of scores) {
    freq[score] = (freq[score] || 0) + 1
  }

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

export async function processDraw(drawPeriodId) {
  const { data: draw } = await supabase
    .from('draw_periods').select('*').eq('id', drawPeriodId).single()

  if (!draw || !draw.drawn_numbers) throw new Error('Draw not configured')

  const drawnSet = new Set(draw.drawn_numbers)

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
 * Auto-create winner_verifications entries with prize split per tier.
 * Called only for official (non-simulation) draws.
 */
export async function createWinnerVerifications(drawPeriodId, results, draw) {
  if (!results?.length) return 0

  const tierWinners = {
    '5-match': results.filter(r => r.tier === '5-match'),
    '4-match': results.filter(r => r.tier === '4-match'),
    '3-match': results.filter(r => r.tier === '3-match'),
  }

  const tierPools = {
    '5-match': draw.jackpot_amount || 0,
    '4-match': draw.pool_4match || 0,
    '3-match': draw.pool_3match || 0,
  }

  const insertions = []

  for (const [tier, winners] of Object.entries(tierWinners)) {
    if (!winners.length) continue
    const prizePerWinner = Math.floor(tierPools[tier] / winners.length)

    for (const { entry } of winners) {
      insertions.push({
        draw_entry_id: entry.id,
        user_id: entry.user_id,
        draw_period_id: drawPeriodId,
        prize_amount: prizePerWinner,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (insertions.length) {
    const { error } = await supabase
      .from('winner_verifications')
      .upsert(insertions, { onConflict: 'draw_entry_id' })
    if (error) console.error('Error creating winner verifications:', error)
  }

  return insertions.length
}

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

/**
 * Get total rolled-over jackpot from previous published draws
 * where no 5-match winner was found.
 */
export async function getRolledOverJackpot() {
  const { data } = await supabase
    .from('draw_periods')
    .select('jackpot_amount')
    .eq('jackpot_rolled_over', true)
    .eq('status', 'published')

  return data?.reduce((sum, d) => sum + (d.jackpot_amount || 0), 0) || 0
}
