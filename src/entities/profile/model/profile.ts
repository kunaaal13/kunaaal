import { decodeBase64 } from '@/shared/lib/base64'

export interface Profile {
  displayName: string
  fullName: string
  username: string
  /** Rotated under the name. First entry is the static fallback. */
  taglines: string[]
  /**
   * Current positions, most significant first. An array rather than a single
   * title because more than one can be true at once — the first is what
   * JSON-LD and the OG cards use.
   */
  roles: { title: string; company: string; url: string }[]
  /** What you're currently building, shown next to the roles. */
  building?: { name: string; url: string }
  location: string
  timeZone: string
  /** base64-encoded — see shared/lib/base64.ts for why. */
  emailB64: string
  website: string
  /** Booking link. Replaces a contact form — no endpoint, no inbox plumbing. */
  scheduling: string
  avatar: string
  /**
   * Short prose, one or two paragraphs, separated by a blank line. Inline
   * links and bold are supported.
   *
   * Deliberately not a list of accomplishments — those belong in Experience
   * and Projects, where they carry dates and context. This is the paragraph
   * someone reads first.
   */
  about: string
  keywords: string[]
  availableForWork: boolean
  dateCreated: string
}

export const PROFILE: Profile = {
  displayName: 'Kunal',
  fullName: 'Kunal Yadav',
  username: 'kunaaal13',
  // Three exactly — the flip animation has keyframes per line count, and only
  // 2 through 5 are defined. See app/styles/global.css.
  taglines: [
    'Software engineer.',
    'Building Morphic.',
    'Author of the Svelte adapter for TanStack Hotkeys.',
  ],
  roles: [
    { title: 'SDE 2', company: 'UIX Labs', url: 'https://uixlabs.co' },
    { title: 'Co-founder', company: 'Essel', url: 'https://essel.ai' },
  ],
  building: { name: 'Morphic', url: 'https://morphic.com' },
  location: 'Delhi, India',
  timeZone: 'Asia/Kolkata',
  // TODO(kunal): your LinkedIn lists mrkunalyadav7@gmail.com, but you gave me
  // kunaaal.rao@gmail.com for git. This is the latter — swap if the other is
  // the one you want people writing to.
  emailB64: 'a3VuYWFhbC5yYW9AZ21haWwuY29t',
  website: 'https://kunaaal.com', // TODO(kunal): confirm the domain
  scheduling: 'https://cal.com/kunaaa13/30min',
  // Head-and-shoulders crop of the illustrated portrait, square at 512px so a
  // 2x 144px circle still has pixels to spare. Served from public/ rather than
  // src/ assets because the header renders it as a plain <img> with an initials
  // fallback, and astro:assets would take the src out of our hands.
  avatar: '/avatar.jpg',
  availableForWork: true,
  about: `
Software engineer at [UIX Labs](https://uixlabs.co), where I build [Morphic](https://morphic.com) — a GenAI studio for film — and co-founder of [Essel](https://essel.ai). I wrote the [Svelte adapter for TanStack Hotkeys](https://github.com/TanStack/hotkeys/pull/45), so if you use keyboard shortcuts in a Svelte app, that's mine.

Most of my work comes down to the same two moves: make the complex flow legible, then make it fast. I learn by rebuilding things — React Query's cache from scratch, most recently. Freelancing alongside all of it since 2020.
`.trim(),
  keywords: [
    'Kunal Yadav',
    'kunaaal13',
    'software engineer',
    'frontend engineer',
    'Next.js',
    'React',
    'TypeScript',
    'UIX Labs',
    'Delhi',
  ],
  dateCreated: '2026-08-01',
}

/** Decoded only where it is actually rendered, never at module scope. */
export function getEmail(): string {
  return decodeBase64(PROFILE.emailB64)
}
