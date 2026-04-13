const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://ryoblox.vercel.app/dashboard'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ryoblox.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'Missing code' })

  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    })

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      return res.status(400).json({ 
        error: tokenData.error_description || tokenData.error,
        debug_client_id: CLIENT_ID ? 'set' : 'MISSING',
        debug_secret: CLIENT_SECRET ? 'set' : 'MISSING',
        debug_redirect: REDIRECT_URI,
      })
    }

    return res.status(200).json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      debug_has_token: !!tokenData.access_token,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Token exchange failed', detail: err.message })
  }
