// GET /api/ping
import { setCors } from './_supabase.js'

export default function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  return res.status(200).json({ status: 'ok', ts: new Date().toISOString() })
}
