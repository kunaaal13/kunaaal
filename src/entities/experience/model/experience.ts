import type { Period } from '@/shared/lib/date'
import { periodSortKey } from '@/shared/lib/date'

export interface Position {
  id: string
  title: string
  employmentPeriod: Period
  employmentType?: string
  /** Markdown-ish bullets. Rendered in the position body. */
  description?: string
  skills?: string[]
}

export interface Experience {
  id: string
  company: string
  companyUrl?: string
  location?: string
  locationType?: 'On-site' | 'Hybrid' | 'Remote'
  /** Newest first. */
  positions: Position[]
  isCurrent?: boolean
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'uix-labs',
    company: 'UIX Labs',
    companyUrl: 'https://uixlabs.co',
    location: 'Gurugram, India',
    locationType: 'Hybrid',
    isCurrent: true,
    positions: [
      {
        id: 'uix-sde2',
        title: 'SDE 2',
        employmentPeriod: { start: '11.2025' },
        employmentType: 'Full-time',
        description: `
Building [Morphic](https://morphic.com), a GenAI studio for film — train characters, edit images and video, generate shots.

- Own large parts of the SvelteKit studio: the generation canvas, workflow editor, and the collaborative document and chat surfaces.
- Built passwordless auth with one-time codes and passkeys, and the organisation model behind cross-org sharing and permissions.
- Shipped billing end to end — plans, seat-aware upgrades, credit limits and enterprise tiers.
- Work across to the backend for durable pipelines, where one render fans out across models and has to survive minutes of work without dropping it.
`.trim(),
        skills: [
          'SvelteKit',
          'Svelte 5',
          'TypeScript',
          'Temporal',
          'Tailwind CSS',
          'Google Cloud',
        ],
      },
      {
        id: 'uix-sde1',
        title: 'SDE 1',
        employmentPeriod: { start: '02.2025', end: '11.2025' },
        employmentType: 'Full-time',
        description: `
Air Cargo Management OS.

- Built a design system from scratch and the reusable UI modules on top of it.
- Built the RBAC layer for the frontend — routes, actions and individual fields all render against the user's role, so one codebase serves every persona from ground staff to network admins.
- Engineered schema-validated multi-step forms for the messiest workflows in the domain: conditional branches, cross-step dependencies and server-driven field rules, with validation that catches errors at the step where they happen.
- Shipped the other hard surfaces: dynamic tables, real-time capacity dashboards, automated route generation and a validation rules engine.
- Delivered a responsive frontend architecture spanning configuration, inventory and execution — the work that digitised an entire air cargo network.
`.trim(),
        skills: ['React', 'TypeScript', 'RBAC', 'shadcn/ui', 'Design Systems'],
      },
    ],
  },
  {
    id: 'mindpeers',
    company: 'MindPeers',
    companyUrl: 'https://mindpeers.co',
    location: 'Delhi, India',
    positions: [
      {
        id: 'mindpeers-swe',
        title: 'Software Developer',
        employmentPeriod: { start: '04.2024', end: '02.2025' },
        employmentType: 'Full-time',
        description: `
Mental health platform — therapy bookings, mindfulness tools and an HR analytics dashboard.

- Built a dedicated therapist portal for slot management, appointment tracking and profile customisation.
- Cut API calls by 65% and load time by 70% through caching and reworked data fetching.
- Led a modernisation pass — dependency upgrades and code optimisation — for a 45% smaller build and 30% faster initial load.
`.trim(),
        skills: ['React', 'Next.js', 'TypeScript', 'Performance'],
      },
    ],
  },
  {
    id: 'basil',
    company: 'Basil',
    companyUrl: 'https://basil.health',
    positions: [
      {
        id: 'basil-swe',
        title: 'Software Developer',
        employmentPeriod: { start: '02.2023', end: '04.2024' },
        employmentType: 'Full-time',
        description: `
- Built a real-time ordering system with live tracking, instant notifications and automated status updates.
- Developed an offline-first point-of-sale system with background sync — full operation through network outages, zero data loss.
- Shipped an e-commerce platform: dynamic catalog, search, cart, and payments with real-time inventory.
- Built the merchant dashboard — customisable visualisations, automated reporting and interactive filters.
`.trim(),
        skills: ['React', 'TypeScript', 'Offline-first', 'PostgreSQL'],
      },
    ],
  },
  {
    id: 'younglabs',
    company: 'Younglabs',
    companyUrl: 'https://www.younglabs.in',
    positions: [
      {
        id: 'younglabs-fullstack',
        title: 'Full Stack Developer Intern',
        employmentPeriod: { start: '05.2022', end: '11.2022' },
        employmentType: 'Internship',
        description: `
- Led frontend for a high-traffic application, reworking user flows and performance.
- Architected dashboard interfaces and interactive landing pages.
- Introduced a component design system that held visual consistency across projects.
- Integrated backend services and real-time data sync at scale.
`.trim(),
        skills: ['React', 'JavaScript', 'Node.js', 'Design Systems'],
      },
    ],
  },
]

export function getExperiences(): Experience[] {
  return [...EXPERIENCES].sort(
    (a, b) =>
      periodSortKey(b.positions[0].employmentPeriod) -
      periodSortKey(a.positions[0].employmentPeriod)
  )
}
