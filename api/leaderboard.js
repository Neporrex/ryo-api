// GET /api/leaderboard?guild_id=...&period=all|week|month|today&limit=15
import { supabase, getSince, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, period = 'all', limit = 15 } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const since = getSince(period)

  let query = supabase
    .from('joins')
    .select('username')
    .eq('guild_id', guild_id)

  if (since) query = query.gte('ts', since)

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  // Aggregate client-side (Supabase JS doesn't support GROUP BY directly)
  const counts = {}
  for (const row of data) {
    const key = row.username.toLowerCase()
    counts[key] = (counts[key] || { username: row.username, joins: 0 })
    counts[key].joins++
  }

  const leaderboard = Object.values(counts)
    .sort((a, b) => b.joins - a.joins)
    .slice(0, Number(limit))

  return res.status(200).json({ period, leaderboard })
}
