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
const NOW_PLAYING_URL =
  'https://api.spotify.com/v1/me/player/currently-playing'

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

export async function getNowPlaying(env: SpotifyEnv): Promise<NowPlaying> {
  const silent: NowPlaying = { isPlaying: false }

  try {
    const token = await getAccessToken(env)
    if (!token) return silent

    const response = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 means nothing is playing; 202 means the device is waking up.
    if (response.status === 204 || response.status === 202) return silent
    if (!response.ok) return silent

    const data = (await response.json()) as any
    if (!data?.item) return silent

    /*
     * Pick the widest artwork, by width rather than array position.
     *
     * Spotify orders images largest-first — typically 640, 300, 64 — so
     * `.at(-1)` returns the 64px thumbnail. That looked fine in the 40px pill
     * and turned to mush the moment the card expanded the disc to 280px
     * (560px on a retina screen). Sorting by width also survives Spotify
     * changing the order or returning a shorter list.
     */
    const images: { url: string; width?: number }[] =
      data.item.album?.images ?? []
    const artwork = images.reduce<{ url: string; width?: number } | undefined>(
      (widest, image) =>
        (image.width ?? 0) > (widest?.width ?? 0) ? image : widest,
      undefined
    )

    return {
      isPlaying: Boolean(data.is_playing),
      title: data.item.name,
      artist: data.item.artists?.map((a: any) => a.name).join(', '),
      album: data.item.album?.name,
      albumArt: artwork?.url,
      songUrl: data.item.external_urls?.spotify,
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms ?? 0,
    }
  } catch {
    // A failing music widget must never take down the page it sits on.
    return silent
  }
}
