export interface GearItem {
  name: string
  detail?: string
  href?: string
  /** Why it earns its place — the part worth reading. */
  note?: string
}

export interface GearGroup {
  category: string
  items: GearItem[]
}

export const GEAR: GearGroup[] = [
  {
    category: 'Machine',
    items: [
      {
        name: 'MacBook Pro 14"',
        detail: 'M4 Pro · 12-core · 24 GB',
        note: 'The notch on this thing is what BetterNotch exists for.',
      },
      {
        name: 'LG UltraFine 27UP850K',
        href: 'https://www.lg.com/in/monitors/lg-27up850n-w',
        detail: '27" 4K IPS',
        note: 'One USB-C cable for picture, power and peripherals. 95% DCI-P3 and DisplayHDR 400, which is enough to trust colour without pretending it is a reference display.',
      },
      {
        name: 'AirPods Pro 2',
        detail: 'Audio',
        note: 'Noise cancelling is the actual feature. Transparency mode for the rest of the day.',
      },
    ],
  },
  {
    category: 'Editor & terminal',
    items: [
      {
        name: 'Zed',
        href: 'https://zed.dev',
        detail: 'Editor',
        note: 'Fast enough that I stopped noticing the editor, which is the whole point.',
      },
      {
        name: 'Warp',
        href: 'https://warp.dev',
        detail: 'Terminal',
      },
      {
        name: 'Claude Code',
        href: 'https://claude.ai/code',
        note: 'Does the parts of a task I already know how to do.',
      },
    ],
  },
  {
    category: 'Daily drivers',
    items: [
      { name: 'Dia', href: 'https://diabrowser.com', detail: 'Browser' },
      { name: 'Raycast', href: 'https://raycast.com', detail: 'Launcher' },
      { name: 'Linear', href: 'https://linear.app', detail: 'Issues' },
      { name: 'Slack', href: 'https://slack.com', detail: 'Work chat' },
      { name: 'Figma', href: 'https://figma.com', detail: 'Design' },
      {
        name: 'Mole',
        href: 'https://github.com/tw93/Mole',
        detail: 'Cleanup',
        note: 'Finds the caches and build artefacts that quietly eat a disk.',
      },
    ],
  },
]
