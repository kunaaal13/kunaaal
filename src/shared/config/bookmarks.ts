export interface Bookmark {
  title: string
  href: string
  description: string
  category: string
}

// TODO(kunal): curate. These are here so the page has shape — replace with
// links you would actually vouch for.
export const BOOKMARKS: Bookmark[] = [
  {
    title: 'Astro Docs',
    href: 'https://docs.astro.build',
    description:
      'Unusually good framework documentation — the upgrade guides in particular are honest about what breaks.',
    category: 'Reference',
  },
  {
    title: 'Svelte 5 Runes',
    href: 'https://svelte.dev/docs/svelte/what-are-runes',
    description:
      'The clearest explanation of why signals beat dependency arrays.',
    category: 'Reference',
  },
  {
    title: 'Web.dev — Core Web Vitals',
    href: 'https://web.dev/vitals',
    description:
      'The numbers worth optimising for, and the ones that are mostly noise.',
    category: 'Performance',
  },
  {
    title: 'Can I Use',
    href: 'https://caniuse.com',
    description:
      'The difference between "this shipped" and "this shipped everywhere".',
    category: 'Reference',
  },
  {
    title: 'Drizzle ORM',
    href: 'https://orm.drizzle.team',
    description: 'SQL you can read, with types that follow the schema.',
    category: 'Tools',
  },
]

export function groupBookmarks(items: Bookmark[] = BOOKMARKS) {
  const categories = [...new Set(items.map((b) => b.category))]
  return categories.map((category) => ({
    category,
    items: items.filter((b) => b.category === category),
  }))
}
