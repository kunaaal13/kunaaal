/**
 * Contact details are stored base64-encoded so they are not sitting in the
 * HTML as plain text for the simplest scrapers to lift. This is obfuscation,
 * not security — anyone who wants the address can trivially decode it. The
 * point is only to raise the cost above "regex the page source".
 */

export function decodeBase64(value: string): string {
  if (typeof atob === 'function') return atob(value)
  return Buffer.from(value, 'base64').toString('utf8')
}

export function encodeBase64(value: string): string {
  if (typeof btoa === 'function') return btoa(value)
  return Buffer.from(value, 'utf8').toString('base64')
}
