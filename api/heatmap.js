// GET /api/heatmap?guild_id=...&period=all|week|month|today
import { supabase, getSince, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, period = 'all' } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const since = getSince(period)

  let query = supabase
    .from('joins')
    .select('ts')
    .eq('guild_id', guild_id)

  if (since) query = query.gte('ts', since)

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  // Build 7x24 grid [dow][hour]
  // dow: 0=Sun ... 6=Sat
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0))

  for (const row of data) {
    const d = new Date(row.ts)
    const dow = d.getUTCDay()
    const hr = d.getUTCHours()
    grid[dow][hr]++
  }

  return res.status(200).json({ period, grid })
}
