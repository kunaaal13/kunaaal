export interface SearchItem {
  id: string
  title: string
  description?: string
  href: string
  group: 'Pages' | 'Projects' | 'Blog' | 'Social'
  /** Extra terms to match on that are not shown in the UI. */
  keywords?: string[]
}

/**
 * Scores a query against an item. Returns 0 for no match.
 *
 * Deliberately simple — the index is a few dozen items, so a real fuzzy
 * matcher would cost more bytes than it saves keystrokes. Ranking only needs
 * to be good enough that an exact prefix beats a mid-string hit.
 */
export function score(item: SearchItem, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1

  const title = item.title.toLowerCase()
  if (title === q) return 100
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60

  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return 40
  if (item.description?.toLowerCase().includes(q)) return 20

  // Subsequence match, so "btnch" still finds "BetterNotch".
  let i = 0
  for (const char of title) {
    if (char === q[i]) i++
    if (i === q.length) return 10
  }

  return 0
}

export function search(items: SearchItem[], query: string): SearchItem[] {
  return items
    .map((item) => ({ item, s: score(item, query) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ item }) => item)
}

export function groupResults(items: SearchItem[]) {
  const order: SearchItem['group'][] = ['Pages', 'Projects', 'Blog', 'Social']
  return order
    .map((group) => ({ group, items: items.filter((i) => i.group === group) }))
    .filter((g) => g.items.length > 0)
}
