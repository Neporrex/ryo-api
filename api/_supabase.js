import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[ryoblox-api] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function getSince(period) {
  const now = new Date()
  if (period === 'today') {
    const d = new Date(now)
    d.setUTCHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (period === 'week') {
    return new Date(now - 6 * 86400000).toISOString()
  }
  if (period === 'month') {
    return new Date(now - 29 * 86400000).toISOString()
  }
  return null
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ryoblox.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}
