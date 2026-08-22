/**
 * One-time helper: turns a Spotify client ID + secret into a refresh token.
 *
 *   bun run spotify:token
 *
 * Spins up a throwaway server on the redirect URI, opens the consent screen,
 * catches the authorization code and exchanges it. Prints the refresh token,
 * then exits. Nothing here ships — the site only ever uses the refresh token,
 * server-to-server, from /api/spotify.
 *
 * The dev server must be stopped first: both want port 4321, and the redirect
 * URI registered with Spotify has to match exactly.
 */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'

const PORT = Number(process.env.SPOTIFY_CALLBACK_PORT ?? 4321)
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`
const SCOPE = 'user-read-recently-played'

/** Minimal .env reader — avoids a dependency for a script run once. */
function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (!match) continue
      const [, key, raw] = match
      if (env[key]) continue // real environment wins
      env[key] = raw.trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    // No .env is fine as long as the vars are exported.
  }
  return env
}

const env = loadEnv()
const CLIENT_ID = env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '\n  Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.\n' +
      '  Add both to .env, then run this again.\n'
  )
  process.exit(1)
}

// Guards against a stray request to /callback completing the exchange.
const state = randomBytes(16).toString('hex')

const authorizeUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    // Force the consent screen so re-running always returns a refresh token;
    // Spotify omits it on silent re-authorization.
    show_dialog: 'true',
  })

async function exchange(code) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(
      `${body.error ?? response.status}: ${body.error_description ?? 'token exchange failed'}`
    )
  }
  return body
}

const page = (title, detail) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
  `<body style="font:15px/1.6 ui-monospace,monospace;display:grid;place-items:center;height:100vh;margin:0;background:#09090b;color:#fafafa">` +
  `<div style="text-align:center"><h1 style="font-size:1.25rem;font-weight:500">${title}</h1>` +
  `<p style="color:#a1a1aa">${detail}</p></div>`

let settled = false

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end()
    return
  }

  const send = (status, html) => {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  }

  const error = url.searchParams.get('error')
  if (error) {
    send(400, page('Authorization denied', error))
    finish(1, `\n  Spotify returned: ${error}\n`)
    return
  }

  if (url.searchParams.get('state') !== state) {
    send(400, page('State mismatch', 'Run the script again.'))
    return
  }

  const code = url.searchParams.get('code')
  if (!code) {
    send(400, page('No code returned', 'Run the script again.'))
    return
  }

  try {
    const token = await exchange(code)
    send(200, page('Done', 'Refresh token printed in your terminal.'))
    finish(
      0,
      '\n  Add this to .env:\n\n' +
        `  SPOTIFY_REFRESH_TOKEN="${token.refresh_token}"\n\n` +
        `  Scope granted: ${token.scope}\n` +
        '  It does not expire unless you revoke access.\n'
    )
  } catch (err) {
    send(500, page('Exchange failed', String(err.message)))
    finish(1, `\n  ${err.message}\n`)
  }
})

function finish(code, message) {
  if (settled) return
  settled = true
  console.log(message)
  server.close(() => process.exit(code))
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n  Port ${PORT} is busy — stop the dev server first:\n` +
        '    bunx astro dev stop\n\n' +
        '  Or use another port, registering the matching redirect URI in the\n' +
        '  Spotify dashboard first:\n' +
        `    SPOTIFY_CALLBACK_PORT=4331 bun run spotify:token\n`
    )
    process.exit(1)
  }
  throw err
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    '\n  Redirect URI (must be registered in the Spotify dashboard):\n' +
      `    ${REDIRECT_URI}\n\n` +
      '  Opening the consent screen. If it does not open, visit:\n' +
      `    ${authorizeUrl}\n`
  )

  const open =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'
  spawn(open, [authorizeUrl], { stdio: 'ignore', detached: true }).unref()
})

// Do not leave a server listening if the browser is never opened.
setTimeout(() => finish(1, '\n  Timed out after 5 minutes.\n'), 5 * 60_000).unref()
