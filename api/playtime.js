// GET /api/playtime?guild_id=...&limit=10
import { supabase, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, limit = 10 } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const { data, error } = await supabase
    .from('playtimes')
    .select('username, seconds')
    .eq('guild_id', guild_id)

  if (error) return res.status(500).json({ error: error.message })

  // Aggregate by username
  const totals = {}
  for (const row of data) {
    const key = row.username.toLowerCase()
    if (!totals[key]) totals[key] = { username: row.username, seconds: 0 }
    totals[key].seconds += row.seconds
  }

  const leaderboard = Object.values(totals)
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, Number(limit))

  return res.status(200).json({ leaderboard })
}
