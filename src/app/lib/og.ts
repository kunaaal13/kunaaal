import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { SITE } from '@/shared/config/site'
import { PROFILE } from '@/entities/profile'

const require = createRequire(import.meta.url)

export const OG_SIZE = { width: 1200, height: 630 }

/**
 * Fonts are read from node_modules rather than fetched, so the build has no
 * network dependency and produces byte-identical output every time. satori
 * cannot fall back to system fonts, and the build host is not macOS — the
 * font has to travel with the project.
 *
 * woff, not woff2: satori does not decompress woff2.
 */
let fontCache: { name: string; data: Buffer; weight: 400 | 600 }[] | null = null

async function loadFonts() {
  if (fontCache) return fontCache

  const file = (weight: number) =>
    require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`)

  const [regular, semibold] = await Promise.all([
    readFile(file(400)),
    readFile(file(600)),
  ])

  fontCache = [
    { name: 'Inter', data: regular, weight: 400 as const },
    { name: 'Inter', data: semibold, weight: 600 as const },
  ]
  return fontCache
}

interface CardOptions {
  title: string
  description?: string
  /** Small label above the title, e.g. "Project" or a publish date. */
  eyebrow?: string
}

export interface ProjectCardOptions extends CardOptions {
  kind: 'project'
  status: 'live' | 'building' | 'archived'
  tech: string[]
}

export type OgOptions = CardOptions | ProjectCardOptions

/**
 * Built as plain objects rather than JSX so this stays a .ts file — satori
 * accepts the same shape either way.
 */
const text = (
  content: string,
  style: Record<string, unknown>
): Record<string, unknown> => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: content },
})

/** Empty flex node — satori requires an explicit display on every div. */
const spacer = () => ({ type: 'div', props: { style: { display: 'flex' } } })

function card({ title, description, eyebrow }: CardOptions) {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        // Faint grid, echoing the rules the site is built on.
        backgroundImage:
          'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        padding: '72px',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '20px' },
            children: [
              eyebrow
                ? text(eyebrow.toUpperCase(), {
                    fontSize: 22,
                    letterSpacing: '0.12em',
                    color: '#71717a',
                    fontWeight: 600,
                  })
                : spacer(),
              text(title, {
                fontSize: title.length > 48 ? 62 : 74,
                fontWeight: 600,
                color: '#09090b',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                // satori has no text-overflow, so long titles are clamped by
                // line count instead.
                display: 'block',
                lineClamp: 3,
              }),
              description
                ? text(description, {
                    fontSize: 30,
                    color: '#52525b',
                    lineHeight: 1.4,
                    display: 'block',
                    lineClamp: 2,
                  })
                : spacer(),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '2px solid #e4e4e7',
              paddingTop: '28px',
            },
            children: [
              text(PROFILE.fullName, {
                fontSize: 28,
                fontWeight: 600,
                color: '#09090b',
              }),
              text(SITE.domain, { fontSize: 26, color: '#71717a' }),
            ],
          },
        },
      ],
    },
  }
}

/**
 * Dark-mode tokens, resolved to hex.
 *
 * The stylesheet states these in oklch behind CSS variables; satori resolves
 * neither, so the values are duplicated here. Kept in one block with the token
 * name against each so the drift is at least visible when it happens.
 */
const DARK = {
  background: '#09090b', // zinc-950  --background
  surface: '#18181b', // zinc-900  --surface
  foreground: '#fafafa', // zinc-50   --foreground
  muted: '#a1a1aa', // zinc-400  --muted-foreground
  line: '#27272a', // zinc-800  --border / --line
} as const

const STATUS: Record<
  ProjectCardOptions['status'],
  { label: string; dot: string }
> = {
  live: { label: 'Live', dot: '#22c55e' }, // green-500
  building: { label: 'Building', dot: '#f59e0b' }, // amber-500
  archived: { label: 'Archived', dot: '#52525b' }, // --muted-foreground/50
}

/**
 * The project card, rendered at share size.
 *
 * Same vocabulary as `ProjectCard.astro` — striped monogram panel, status dot,
 * tech pills, a divider row along the bottom — turned on its side, because a
 * 1200x630 frame cannot hold the site's portrait card without shrinking
 * everything to nothing. The card's bottom link row becomes the attribution
 * row: an OG image travels without its page, so it has to say whose it is.
 */
function projectCard({
  title,
  description,
  status,
  tech,
}: ProjectCardOptions) {
  const status_ = STATUS[status]

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '40px',
        backgroundColor: DARK.background,
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              gap: '28px',
              padding: '20px',
              borderRadius: '24px',
              border: `1px solid ${DARK.line}`,
            },
            children: [
              // Cover: the monogram fallback, since no project ships a cover.
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '380px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    backgroundColor: DARK.surface,
                    // satori has no repeating-linear-gradient, so the stripe is
                    // one tile repeated by backgroundSize. The band has to run
                    // through the CENTRE of the tile rather than start at 0 —
                    // a corner-anchored sliver tiles into a dot grid, not
                    // stripes.
                    backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 42%, ${DARK.line} 42%, ${DARK.line} 58%, transparent 58%, transparent 100%)`,
                    backgroundSize: '16px 16px',
                  },
                  children: [
                    text(title.slice(0, 2).toLowerCase(), {
                      fontSize: 110,
                      color: '#71717a',
                      letterSpacing: '0.02em',
                    }),
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '18px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '9999px',
                                      backgroundColor: status_.dot,
                                    },
                                  },
                                },
                                text(status_.label, {
                                  fontSize: 24,
                                  fontWeight: 600,
                                  color: DARK.muted,
                                }),
                              ],
                            },
                          },
                          text(title, {
                            fontSize: title.length > 26 ? 52 : 64,
                            fontWeight: 600,
                            color: DARK.foreground,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                            display: 'block',
                            lineClamp: 2,
                          }),
                          description
                            ? text(description, {
                                fontSize: 27,
                                color: DARK.muted,
                                lineHeight: 1.4,
                                display: 'block',
                                lineClamp: 3,
                              })
                            : spacer(),
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', gap: '10px' },
                              children: tech.slice(0, 4).map((name) =>
                                text(name, {
                                  fontSize: 22,
                                  color: DARK.muted,
                                  padding: '7px 14px',
                                  borderRadius: '6px',
                                  border: `1px solid ${DARK.line}`,
                                })
                              ),
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderTop: `1px solid ${DARK.line}`,
                                paddingTop: '18px',
                              },
                              children: [
                                text(PROFILE.fullName, {
                                  fontSize: 24,
                                  fontWeight: 600,
                                  color: DARK.foreground,
                                }),
                                text(SITE.domain, {
                                  fontSize: 22,
                                  color: DARK.muted,
                                }),
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }
}

export async function renderOgImage(options: OgOptions): Promise<Buffer> {
  const fonts = await loadFonts()

  const tree =
    'kind' in options && options.kind === 'project'
      ? projectCard(options)
      : card(options)

  const svg = await satori(tree as never, {
    ...OG_SIZE,
    fonts: fonts.map((font) => ({
      name: font.name,
      data: font.data,
      weight: font.weight,
      style: 'normal' as const,
    })),
  })

  return Buffer.from(
    new Resvg(svg, {
      fitTo: { mode: 'width', value: OG_SIZE.width },
    })
      .render()
      .asPng()
  )
}
