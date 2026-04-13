// GET /api/stats?guild_id=...&period=all|week|month|today
import { supabase, getSince, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, period = 'all' } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const since = getSince(period)

  let query = supabase
    .from('joins')
    .select('username, ts')
    .eq('guild_id', guild_id)
    .order('ts', { ascending: true })

  if (since) query = query.gte('ts', since)

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  const total = data.length
  const unique = new Set(data.map(r => r.username.toLowerCase())).size
  const timestamps = data.map(r => r.ts)

  return res.status(200).json({ period, total, unique, timestamps })
}
