/**
 * Periods are written as "MM.YYYY" or "YYYY", with the end omitted for
 * anything ongoing. Keeping them as strings rather than Dates means the
 * content files stay readable and never carry a spurious day-of-month.
 */

export interface Period {
  start: string
  end?: string
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * "02.2025" -> "Feb 2025", "2025" -> "2025".
 *
 * Periods are stored numerically so they sort and diff without parsing month
 * names, but "02.2025 — 11.2025" reads like a version string. Names are
 * unambiguous at a glance and sidestep the US/EU ordering question entirely.
 */
export function formatPeriod(value: string): string {
  const [a, b] = value.split('.')
  if (b === undefined) return a
  const month = MONTHS[Number(a) - 1]
  return month ? `${month} ${b}` : value
}

/** "05.2025" -> Date. Year-only values resolve to Jan (start) or Dec (end). */
function parsePeriod(value: string, edge: 'start' | 'end'): Date {
  const [a, b] = value.split('.')
  if (b !== undefined) return new Date(Number(b), Number(a) - 1, 1)
  return new Date(Number(a), edge === 'end' ? 11 : 0, 1)
}

/** Human duration between two period strings: "3m", "1y", "2y 4m". */
export function formatDuration({ start, end }: Period): string {
  const from = parsePeriod(start, 'start')
  const to = end ? parsePeriod(end, 'end') : new Date()

  // +1 so a role spanning Jan–Jan reads as 1 month, not 0.
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1

  if (months <= 0) return ''
  if (months < 12) return `${months}m`

  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`
}

/** Sort key so ongoing items (no end) sort newest-first alongside dated ones. */
export function periodSortKey({ end }: Period): number {
  return (end ? parsePeriod(end, 'end') : new Date()).getTime()
}

export function formatDate(
  value: Date | string,
  opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(
    date
  )
}

export function toISODate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}
