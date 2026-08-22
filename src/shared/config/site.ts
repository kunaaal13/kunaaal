const url = import.meta.env.PUBLIC_SITE_URL ?? 'https://kunaaal.dev'

export const SITE = {
  url,
  domain: new URL(url).hostname,
  name: 'Kunal',
  title: 'Kunal — Software Engineer',
  description:
    'Software engineer building for the web and macOS. Projects, writing, and the tools I use.',
  locale: 'en',
  themeColor: { light: '#ffffff', dark: '#09090b' },
  /** Repo behind this site. Set to null to hide the footer source link. */
  sourceRepo: 'https://github.com/kunaaal13/kunaaal',
} as const

export const NAV = [
  { title: 'Projects', href: '/projects' },
  { title: 'Blog', href: '/blog' },
  { title: 'Work', href: '/work' },
  { title: 'Gear', href: '/gear' },
] as const

export const MOBILE_NAV = [{ title: 'Home', href: '/' }, ...NAV] as const
