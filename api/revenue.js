// GET /api/revenue?guild_id=...&period=all|week|month|today
import { supabase, getSince, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, period = 'all' } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const since = getSince(period)

  let query = supabase
    .from('revenue')
    .select('username, robux, item, ts')
    .eq('guild_id', guild_id)

  if (since) query = query.gte('ts', since)

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  const total_robux = data.reduce((sum, r) => sum + r.robux, 0)
  const count = data.length

  // Top buyers
  const buyers = {}
  for (const r of data) {
    const key = r.username.toLowerCase()
    if (!buyers[key]) buyers[key] = { username: r.username, robux: 0, purchases: 0 }
    buyers[key].robux += r.robux
    buyers[key].purchases++
  }
  const top_buyers = Object.values(buyers)
    .sort((a, b) => b.robux - a.robux)
    .slice(0, 5)

  // Top items
  const items = {}
  for (const r of data) {
    if (!r.item) continue
    if (!items[r.item]) items[r.item] = { item: r.item, robux: 0, sales: 0 }
    items[r.item].robux += r.robux
    items[r.item].sales++
  }
  const top_items = Object.values(items)
    .sort((a, b) => b.robux - a.robux)
    .slice(0, 5)

  return res.status(200).json({ period, total_robux, count, top_buyers, top_items })
}
