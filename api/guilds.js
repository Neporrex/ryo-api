// GET /api/guilds
// Headers: Authorization: Bearer <discord_access_token>
// Returns user's Discord guilds that have Ryoblox installed (in guild_channels table)
import { supabase, setCors } from './_supabase.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  const token = auth.slice(7)

  try {
    // Fetch user's guilds from Discord
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!guildsRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const discordGuilds = await guildsRes.json()

    // Fetch all guild_ids that have Ryoblox configured
    const { data: ryobloxGuilds, error } = await supabase
      .from('guild_channels')
      .select('guild_id')

    if (error) return res.status(500).json({ error: error.message })

    const ryobloxSet = new Set(ryobloxGuilds.map(r => r.guild_id))

    // Filter user's guilds to only those with Ryoblox
    const guilds = discordGuilds
      .filter(g => ryobloxSet.has(g.id))
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null,
        owner: g.owner,
      }))

    return res.status(200).json({ guilds })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch guilds', detail: err.message })
  }
}
