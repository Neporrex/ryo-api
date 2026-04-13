// GET /api/today?guild_id=...
import { supabase, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id } = req.query

  if (!guild_id) return res.status(400).json({ error: 'Missing guild_id' })

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('joins')
    .select('username, ts')
    .eq('guild_id', guild_id)
    .gte('ts', today.toISOString())

  if (error) return res.status(500).json({ error: error.message })

  const total = data.length
  const unique = new Set(data.map(r => r.username.toLowerCase())).size

  // Top 5
  const counts = {}
  for (const r of data) {
    const key = r.username.toLowerCase()
    if (!counts[key]) counts[key] = { username: r.username, joins: 0 }
    counts[key].joins++
  }
  const top = Object.values(counts)
    .sort((a, b) => b.joins - a.joins)
    .slice(0, 5)

  return res.status(200).json({ date: today.toISOString().split('T')[0], total, unique, top })
}
