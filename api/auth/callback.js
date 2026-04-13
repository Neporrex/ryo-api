const https = require('https')
const querystring = require('querystring')

const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://ryoblox.vercel.app/dashboard'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ryoblox.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

function postRequest(url, body) {
  return new Promise((resolve, reject) => {
    const data = querystring.stringify(body)
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (response) => {
      let chunks = ''
      response.on('data', (c) => (chunks += c))
      response.on('end', () => {
        try { resolve(JSON.parse(chunks)) }
        catch { resolve({ error: 'Invalid JSON from Discord' }) }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { code } = req.query

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing DISCORD env vars' })
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing code' })
  }

  try {
    const tokenData = await postRequest('https://discord.com/api/oauth2/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    })

    if (tokenData.error) {
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error,
      })
    }

    return res.status(200).json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Token exchange failed', detail: err.message })
  }
}
