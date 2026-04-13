# ryoblox-api

Vercel Serverless API for Ryoblox Analytics.

## Endpoints

All endpoints accept `guild_id` as a required query param.  
`period` can be: `all` (default) · `week` · `month` · `today`

| Endpoint | Params | Description |
|---|---|---|
| `GET /api/ping` | — | Health check |
| `GET /api/stats` | `guild_id`, `period` | Total joins, unique players, timestamps |
| `GET /api/leaderboard` | `guild_id`, `period`, `limit` | Top players by joins |
| `GET /api/player` | `guild_id`, `username` | Single player joins + playtime |
| `GET /api/playtime` | `guild_id`, `limit` | Top players by playtime |
| `GET /api/revenue` | `guild_id`, `period` | Robux earnings + top buyers/items |
| `GET /api/today` | `guild_id` | Today's stats + top 5 |
| `GET /api/heatmap` | `guild_id`, `period` | 7×24 activity grid |

## Setup

1. Clone and push to GitHub
2. Import into a new Vercel project
3. Add env vars in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` ← service_role key (NOT anon)

## Local dev

```bash
npm install
cp .env.example .env   # fill in your keys
npx vercel dev         # runs at localhost:3000
```
