# Deploying the GRSS Realtime Backend to Render

Replaces the retired Railway deployment. **Frontend stays on Vercel** — only the
dedicated Socket.io server (`realtime/server.ts`) moves to Render.

```
Browser ──HTTPS──> Vercel (Next.js UI + /api/* + Mongo)
   │
   └────WSS──────> Render (grss-realtime, Socket.io + GameEngine + Mongo)
                     ▲ both share the SAME MongoDB and the SAME SESSION_SECRET
```

---

## 1. Update the existing service

A service already exists at `grss-field-analyst.onrender.com` (Oregon region).
`render.yaml` is named to match it, so a Blueprint sync **updates** that service
rather than creating a second one. Push this branch, then in the Render
dashboard: **Blueprints → sync**, or set the fields below by hand under
**Settings**.

Region cannot be changed after a service is created. If you later want lower
latency for players outside the US, that means creating a new service in a
closer region and repointing `NEXT_PUBLIC_SOCKET_URL`.

Prefer clicking through manually? **New → Web Service**, then:

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `npm ci --include=dev && npm run build:realtime` |
| Start command | `node realtime/dist/realtime/server.js` |
| Health check path | `/health` |
| Instances | **1** (see §5) |
| Plan | Starter or higher (paid = no spin-down) |

> `--include=dev` is not optional. Render sets `NODE_ENV=production`, which makes
> npm skip devDependencies — dropping `@types/jsonwebtoken` and failing `tsc`.

## 2. Environment variables (Render dashboard)

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | same Atlas URI the Vercel app uses |
| `SESSION_SECRET` | **must match Vercel byte-for-byte** — otherwise every socket is rejected as "Invalid or expired session" |
| `CLIENT_URL` | `https://<your-app>.vercel.app,https://*.vercel.app` |

**Do not set `PORT`** — Render injects it. **Do not set `SOCKET_PORT`** — it is a
local-dev-only variable and is now ignored in favour of `PORT`.

`CLIENT_URL` is comma-separated and supports one `*` per hostname label, so the
`https://*.vercel.app` entry keeps Vercel preview deployments working. Drop that
entry if you want to lock down to production only.

## 3. MongoDB Atlas

Atlas blocks unknown IPs. Render's egress addresses differ from Railway's, so
**Atlas → Network Access** must be updated or the service boots but never
reaches the DB (`/health` will report `"status":"degraded"`).

- Quick path: allow `0.0.0.0/0` (fine when the URI has a strong password).
- Tighter: paste the static outbound IPs from Render → your service → *Connect*.

## 4. Point the frontend at Render

In **Vercel → Settings → Environment Variables**:

```
NEXT_PUBLIC_SOCKET_URL = https://grss-field-analyst.onrender.com
CLIENT_URL             = https://<your-app>.vercel.app
```

Then **redeploy Vercel**. `NEXT_PUBLIC_*` values are inlined at build time, so an
env change alone does nothing until you rebuild. Without it the client falls back
to `https://<your-app>.vercel.app:4001` and every connection fails.

Use the `https://` URL, not `wss://` — Socket.io upgrades on its own. The CSP in
`next.config.ts` already allows `https://*.onrender.com` and `wss://*.onrender.com`.

## 5. One instance only — important

`GameEngine` holds authoritative game state **in memory**. Two instances = two
divergent engines, players split between them, and broken scoring. Keep
`numInstances: 1` and never enable autoscaling on this service.

This also sidesteps sticky-session problems: Render has no sticky sessions, which
would otherwise break Socket.io's HTTP long-polling handshake.

## 6. Verify

```bash
curl https://grss-field-analyst.onrender.com/health   # {"status":"ok","db":1,...}
curl https://grss-field-analyst.onrender.com/ready    # 200 once Mongo is connected
```

- `/health` — liveness. Returns **200 even when Mongo is down**, on purpose: a
  transient Atlas blip must not make Render restart the service and drop every
  socket mid-event. Read `status` / `db` in the body for the real DB state.
- `/ready` — strict. 503 until Mongo is reachable. For your monitoring only;
  do **not** point Render's health check here.

Then open the app, log in, and confirm in DevTools → Network → WS that the
connection shows `101 Switching Protocols` and stays open. `connections` in
`/health` should track the number of players.

## 7. Running a live event

- **Turn off Auto-Deploy** before an event (service → Settings). A push to `main`
  otherwise redeploys and disconnects everyone mid-game.
- Deploys are survivable but disruptive: the server persists a snapshot on
  `SIGTERM` and rehydrates on boot, and clients reconnect automatically
  (infinite retries, 3–10s backoff) then emit `request_full_sync`. Scores and
  phase survive; the few seconds of downtime are still visible to players.
- Watch **Logs** for `CORS: rejected origin ...` — that means `CLIENT_URL` does
  not match the origin the browser actually sent.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails, `TS7016 ... 'jsonwebtoken'` | Build command missing `--include=dev` |
| Deploy hangs then "no open ports detected" | `SOCKET_PORT` set in Render env — remove it |
| All sockets rejected, "Invalid or expired session" | `SESSION_SECRET` differs from Vercel |
| `connect_error` in browser, CORS in Render logs | `CLIENT_URL` wrong / has a trailing slash |
| Connects then instantly drops | Frontend not rebuilt after setting `NEXT_PUBLIC_SOCKET_URL` |
| `/health` says `"db":0` or `"db":2` | Atlas Network Access is not allowing Render's IPs |

`db` values: `0` disconnected, `1` connected, `2` connecting, `3` disconnecting.

## Legacy files

`railway.json`, `nixpacks.toml` and `Dockerfile` are Railway leftovers. Render
ignores them. Safe to delete once the Render deploy is confirmed healthy — or
keep the `Dockerfile` if you would rather switch the service to Docker later.
