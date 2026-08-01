import { SITE } from '@/shared/config/site'

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString()
}

/** "https://kunaaal.com/x?y=1" -> "kunaaal.com/x" — for display, not linking. */
export function urlToName(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Append UTM params to an outbound link without clobbering existing query. */
export function withUtm(
  href: string,
  params: Record<string, string> = { utm_source: SITE.domain }
): string {
  try {
    const url = new URL(href)
    for (const [key, value] of Object.entries(params)) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value)
    }
    return url.toString()
  } catch {
    // Relative or malformed hrefs are returned untouched rather than throwing.
    return href
  }
}
