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
        note: 'The notch on this thing is what Better Notch exists for.',
      },
      {
        name: 'LG UltraFine 27UP850K',
        href: 'https://www.lg.com/in/monitors/lg-27up850n-w',
        detail: '27" 4K IPS',
        note: 'One USB-C cable and the desk is set up — display, power, peripherals.',
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
        note: 'Where my agents live — every Pi session runs out of a Warp pane.',
      },
      {
        name: 'Pi',
        href: 'https://pi.dev',
        detail: 'Coding agent harness',
        note: 'Small enough to understand and open enough that the models, tools, UI and workflow are mine to replace.',
      },
    ],
  },
  {
    category: 'Daily drivers',
    items: [
      {
        name: 'Dia',
        href: 'https://diabrowser.com',
        detail: 'Browser',
        note: 'Tabs tuck into a sidebar and the page gets the whole screen.',
      },
      {
        name: 'Raycast',
        href: 'https://raycast.com',
        detail: 'Launcher',
        note: 'Launcher, clipboard history and window management — three utilities I no longer install.',
      },
      {
        name: 'Linear',
        href: 'https://linear.app',
        detail: 'Issues',
        note: 'Filing an issue costs five seconds, so things actually get filed.',
      },
      {
        name: 'Slack',
        href: 'https://slack.com',
        detail: 'Work chat',
        note: 'Where every decision eventually surfaces, whatever tool it started in.',
      },
      {
        name: 'Figma',
        href: 'https://figma.com',
        detail: 'Design',
        note: 'Exact values straight from the file instead of guessing off a screenshot.',
      },
      {
        name: 'Mole',
        href: 'https://github.com/tw93/Mole',
        detail: 'Cleanup',
        note: 'Finds the caches and build artefacts that quietly eat a disk.',
      },
    ],
  },
]
