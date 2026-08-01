/**
 * Glyphs that Simple Icons cannot serve.
 *
 * Two reasons a mark ends up here:
 *
 * 1. Simple Icons dropped it — LinkedIn was removed upstream after a trademark
 *    request.
 * 2. Simple Icons is single-path and monochrome by design, so any logo whose
 *    identity *is* its colours cannot be represented. Gmail's current mark is
 *    four coloured panels; flattened to one path it collapses into a solid red
 *    envelope that reads as the pre-2020 logo.
 */

export interface LocalIcon {
  title: string
  /** Defaults to the 24×24 Simple Icons grid. */
  viewBox?: string
  /** Single-path monochrome mark, painted with currentColor or `hex`. */
  path?: string
  hex?: string
  /** Multi-path mark that carries its own colours. */
  paths?: { d: string; fill: string }[]
}

export const LOCAL_ICONS: Record<string, LocalIcon> = {
  siLinkedin: {
    title: 'LinkedIn',
    hex: '0A66C2',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },

  /** Gmail's current mark — the four-colour envelope, not the flat red one. */
  gmail: {
    title: 'Gmail',
    viewBox: '0 0 512 384',
    paths: [
      { fill: '#4285f4', d: 'M34.91 384h81.454V186.18L0 98.91v250.18C0 368.4 15.6 384 34.91 384z' },
      { fill: '#34a853', d: 'M395.636 384h81.455c19.31 0 34.909-15.6 34.909-34.91V98.91L395.636 186.18z' },
      { fill: '#fbbc04', d: 'M395.636 34.91v151.27L512 98.91V52.364c0-43.164-49.28-67.782-83.782-41.891z' },
      { fill: '#ea4335', d: 'M116.364 186.18V34.91L256 139.64 395.636 34.91v151.27L256 290.91z' },
      { fill: '#c5221f', d: 'M0 52.364V98.91l116.364 87.27V34.91L83.782 10.473C49.28-15.418 0 9.2 0 52.364z' },
    ],
  },
}
