export interface TechItem {
  title: string
  href: string
  /** Simple Icons export key. Omit for tools with no brand glyph. */
  icon?: string
  categories: TechCategory[]
}

export const TECH_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend & Data',
  'Infra & Tooling',
  'Design',
] as const

export type TechCategory = (typeof TECH_CATEGORIES)[number]

/**
 * Ordered by category, then by how central each item is to how I actually
 * work — not alphabetically. A stack list is a claim about what you reach for.
 */
export const TECH_STACK: TechItem[] = [
  // Languages
  { title: 'TypeScript', href: 'https://www.typescriptlang.org', icon: 'siTypescript', categories: ['Languages'] },
  { title: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', icon: 'siJavascript', categories: ['Languages'] },
  { title: 'Swift', href: 'https://www.swift.org', icon: 'siSwift', categories: ['Languages'] },
  { title: 'SQL', href: 'https://www.postgresql.org/docs/current/sql.html', icon: 'siPostgresql', categories: ['Languages'] },

  // Frontend
  { title: 'Svelte', href: 'https://svelte.dev', icon: 'siSvelte', categories: ['Frontend'] },
  { title: 'SvelteKit', href: 'https://svelte.dev/docs/kit', icon: 'siSvelte', categories: ['Frontend'] },
  { title: 'React', href: 'https://react.dev', icon: 'siReact', categories: ['Frontend'] },
  { title: 'Next.js', href: 'https://nextjs.org', icon: 'siNextdotjs', categories: ['Frontend'] },
  { title: 'Astro', href: 'https://astro.build', icon: 'siAstro', categories: ['Frontend'] },
  { title: 'Tailwind CSS', href: 'https://tailwindcss.com', icon: 'siTailwindcss', categories: ['Frontend'] },
  { title: 'TanStack', href: 'https://tanstack.com', icon: 'siReactquery', categories: ['Frontend'] },
  { title: 'SwiftUI', href: 'https://developer.apple.com/xcode/swiftui', icon: 'siSwift', categories: ['Frontend'] },

  // Backend & Data
  { title: 'Node.js', href: 'https://nodejs.org', icon: 'siNodedotjs', categories: ['Backend & Data'] },
  { title: 'Bun', href: 'https://bun.sh', icon: 'siBun', categories: ['Backend & Data'] },
  { title: 'Express', href: 'https://expressjs.com', icon: 'siExpress', categories: ['Backend & Data'] },
  { title: 'Hono', href: 'https://hono.dev', icon: 'siHono', categories: ['Backend & Data'] },
  { title: 'Temporal', href: 'https://temporal.io', icon: 'siTemporal', categories: ['Backend & Data'] },
  { title: 'PostgreSQL', href: 'https://www.postgresql.org', icon: 'siPostgresql', categories: ['Backend & Data'] },
  { title: 'Drizzle', href: 'https://orm.drizzle.team', icon: 'siDrizzle', categories: ['Backend & Data'] },
  { title: 'Supabase', href: 'https://supabase.com', icon: 'siSupabase', categories: ['Backend & Data'] },
  { title: 'Redis', href: 'https://redis.io', icon: 'siRedis', categories: ['Backend & Data'] },

  // Infra & Tooling
  { title: 'Google Cloud', href: 'https://cloud.google.com', icon: 'siGooglecloud', categories: ['Infra & Tooling'] },
  { title: 'Cloudflare', href: 'https://workers.cloudflare.com', icon: 'siCloudflare', categories: ['Infra & Tooling'] },
  { title: 'Vercel', href: 'https://vercel.com', icon: 'siVercel', categories: ['Infra & Tooling'] },
  { title: 'Docker', href: 'https://www.docker.com', icon: 'siDocker', categories: ['Infra & Tooling'] },
  { title: 'Turborepo', href: 'https://turbo.build', icon: 'siTurborepo', categories: ['Infra & Tooling'] },
  { title: 'Sentry', href: 'https://sentry.io', icon: 'siSentry', categories: ['Infra & Tooling'] },
  { title: 'Vitest', href: 'https://vitest.dev', icon: 'siVitest', categories: ['Infra & Tooling'] },
  { title: 'Storybook', href: 'https://storybook.js.org', icon: 'siStorybook', categories: ['Infra & Tooling'] },
  { title: 'Git', href: 'https://git-scm.com', icon: 'siGit', categories: ['Infra & Tooling'] },
  { title: 'Claude Code', href: 'https://claude.ai/code', icon: 'siAnthropic', categories: ['Infra & Tooling'] },

  // Design
  { title: 'Figma', href: 'https://figma.com', icon: 'siFigma', categories: ['Design'] },
  { title: 'Motion', href: 'https://motion.dev', icon: 'siFramer', categories: ['Design'] },
]

/** Group in declared category order, skipping any category with no items. */
export function groupByCategory(items: TechItem[] = TECH_STACK) {
  return TECH_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.categories.includes(category)),
  })).filter((group) => group.items.length > 0)
}
