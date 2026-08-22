export interface NowPlaying {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumArt?: string
  songUrl?: string
  /** Milliseconds, for the progress bar. */
  progressMs?: number
  durationMs?: number
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const RECENTLY_PLAYED_URL =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1'

interface SpotifyEnv {
  clientId?: string
  clientSecret?: string
  refreshToken?: string
}

/**
 * Exchanges the long-lived refresh token for a short-lived access token.
 * Spotify has no client-credentials path to a user's playback state, so the
 * refresh token must live server-side — which is why this endpoint exists at
 * all rather than the widget calling Spotify directly.
 */
async function getAccessToken(env: SpotifyEnv): Promise<string | null> {
  const { clientId, clientSecret, refreshToken } = env
  if (!clientId || !clientSecret || !refreshToken) return null

  const basic = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) return null
  const data = (await response.json()) as { access_token?: string }
  return data.access_token ?? null
}

interface SpotifyTrack {
  name?: string
  artists?: { name?: string }[]
  album?: {
    name?: string
    images?: { url: string; width?: number }[]
  }
  external_urls?: { spotify?: string }
  duration_ms?: number
}

/** Convert Spotify's track shape into the small client-facing contract. */
function toNowPlaying(
  track: SpotifyTrack | undefined,
  isPlaying: boolean,
  progressMs = 0
): NowPlaying | null {
  if (!track?.name) return null

  /*
   * Pick the widest artwork, by width rather than array position.
   *
   * Spotify orders images largest-first — typically 640, 300, 64 — so
   * `.at(-1)` returns the 64px thumbnail. Sorting by width also survives
   * Spotify changing the order or returning a shorter list.
   */
  const artwork = (track.album?.images ?? []).reduce<
    { url: string; width?: number } | undefined
  >(
    (widest, image) =>
      (image.width ?? 0) > (widest?.width ?? 0) ? image : widest,
    undefined
  )

  return {
    isPlaying,
    title: track.name,
    artist: track.artists
      ?.map((artist) => artist.name)
      .filter(Boolean)
      .join(', '),
    album: track.album?.name,
    albumArt: artwork?.url,
    songUrl: track.external_urls?.spotify,
    progressMs,
    durationMs: track.duration_ms ?? 0,
  }
}

async function getLatestTrack(token: string): Promise<NowPlaying | null> {
  const response = await fetch(RECENTLY_PLAYED_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    items?: { track?: SpotifyTrack }[]
  }

  // Widget intentionally treats latest history item as active. This keeps the
  // endpoint to one Spotify request and gives the card stable content.
  return toNowPlaying(data.items?.[0]?.track, true)
}

export async function getNowPlaying(env: SpotifyEnv): Promise<NowPlaying> {
  const silent: NowPlaying = { isPlaying: false }

  try {
    const token = await getAccessToken(env)
    if (!token) return silent

    return (await getLatestTrack(token)) ?? silent
  } catch {
    // A failing music widget must never take down the page it sits on.
    return silent
  }
}
