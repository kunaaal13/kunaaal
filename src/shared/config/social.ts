export interface SocialProfile {
  title: string
  handle: string
  href: string
  /** Simple Icons export key. */
  icon: string
  /**
   * Paint the mark in its brand colour.
   *
   * Off for GitHub and X: their brands are near-black, so a literal brand fill
   * disappears against a dark background. Those marks are monochrome by design,
   * so inheriting currentColor is both correct and legible in either theme.
   */
  brandColor?: boolean
  /** Include in the JSON-LD `sameAs` array for entity disambiguation. */
  sameAs?: boolean
}

export const SOCIAL = {
  github: {
    title: 'GitHub',
    handle: 'kunaaal13',
    href: 'https://github.com/kunaaal13',
    icon: 'siGithub',
    sameAs: true,
  },
  x: {
    title: 'X',
    handle: '@kunaaal13',
    href: 'https://x.com/kunaaal13',
    icon: 'siX',
    sameAs: true,
  },
  linkedin: {
    title: 'LinkedIn',
    handle: 'kunaaal13',
    href: 'https://linkedin.com/in/kunaaal13',
    icon: 'siLinkedin',
    brandColor: true,
    sameAs: true,
  },
} satisfies Record<string, SocialProfile>

export type SocialName = keyof typeof SOCIAL

export type SocialLink = SocialProfile & { name: SocialName }

/**
 * Annotated rather than inferred. `satisfies` keeps each entry's literal type,
 * which means optional fields the entry omits are absent from the union — so
 * `link.brandColor` would not type-check even though the interface declares it.
 * Widening to SocialLink restores the full shape.
 */
export const SOCIAL_LINKS: SocialLink[] = Object.entries(SOCIAL).map(
  ([name, profile]) => ({ name: name as SocialName, ...profile })
)

export const SAME_AS = SOCIAL_LINKS.filter((s) => s.sameAs).map((s) => s.href)
