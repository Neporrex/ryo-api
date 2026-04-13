// GET /api/player?guild_id=...&username=...
import { supabase, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { guild_id, username } = req.query

  if (!guild_id || !username) return res.status(400).json({ error: 'Missing guild_id or username' })

  // Joins
  const { data: joins, error: joinsErr } = await supabase
    .from('joins')
    .select('ts')
    .eq('guild_id', guild_id)
    .ilike('username', username)
    .order('ts', { ascending: true })

  if (joinsErr) return res.status(500).json({ error: joinsErr.message })

  // Playtime
  const { data: playtimes, error: ptErr } = await supabase
    .from('playtimes')
    .select('seconds')
    .eq('guild_id', guild_id)
    .ilike('username', username)

  if (ptErr) return res.status(500).json({ error: ptErr.message })

  const totalSeconds = playtimes.reduce((sum, r) => sum + r.seconds, 0)
  const timestamps = joins.map(r => r.ts)

  return res.status(200).json({
    username,
    total_joins: joins.length,
    playtime_seconds: totalSeconds,
    timestamps,
  })
}
