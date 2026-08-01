import type { APIRoute } from 'astro'
import { getNowPlaying } from '@/features/spotify-now-playing'

// Needs a runtime: the refresh token must never reach the browser.
export const prerender = false

export const GET: APIRoute = async () => {
  const track = await getNowPlaying({
    clientId: import.meta.env.SPOTIFY_CLIENT_ID,
    clientSecret: import.meta.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: import.meta.env.SPOTIFY_REFRESH_TOKEN,
  })

  return new Response(JSON.stringify(track), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // The widget polls every 30s, so most requests are served from cache
      // and never reach Spotify. stale-while-revalidate keeps it responsive
      // during the refresh.
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
    },
  })
}
