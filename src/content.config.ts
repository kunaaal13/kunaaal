import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Schemas are strict on purpose: a typo in frontmatter should fail the build,
 * not render a half-empty card in production.
 */

const period = z.object({
  /** "MM.YYYY" or "YYYY". */
  start: z.string().regex(/^(\d{2}\.)?\d{4}$/, 'Use "MM.YYYY" or "YYYY"'),
  /** Omit while ongoing. */
  end: z
    .string()
    .regex(/^(\d{2}\.)?\d{4}$/, 'Use "MM.YYYY" or "YYYY"')
    .optional(),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line. Shown on the card and in search results. */
    description: z.string(),
    /** Path under /public. Cards fall back to a generated monogram if absent. */
    cover: z.string().optional(),
    status: z.enum(['live', 'building', 'archived']),
    tech: z.array(z.string()).default([]),
    links: z
      .object({
        // Zod 4 moved format validators to the top level: z.url(), not
        // z.string().url().
        live: z.url().optional(),
        github: z.url().optional(),
      })
      .default({}),
    period,
    /** Surface on the homepage. */
    featured: z.boolean().default(false),
    /** Lower sorts first within the featured/non-featured groups. */
    order: z.number().default(999),
    draft: z.boolean().default(false),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { projects, blog }
