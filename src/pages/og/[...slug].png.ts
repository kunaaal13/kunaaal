import type { APIRoute, GetStaticPaths } from 'astro'
import { renderOgImage, type OgOptions } from '@/app/lib/og'
import { getProjects } from '@/entities/project'
import { getPosts } from '@/entities/post'
import { SITE } from '@/shared/config/site'
import { PROFILE } from '@/entities/profile'
import { formatDate } from '@/shared/lib/date'

type Card = OgOptions

/**
 * One image per shareable page, rendered at build time. Doing this at runtime
 * would mean rasterising on every crawler hit for content that never changes.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])

  const cards: { slug: string; card: Card }[] = [
    {
      slug: 'default',
      card: {
        title: PROFILE.fullName,
        description: SITE.description,
        eyebrow: PROFILE.roles
          .map((role) => `${role.title} · ${role.company}`)
          .join('  |  '),
      },
    },
    ...projects.map((project) => ({
      slug: `projects/${project.id}`,
      card: {
        kind: 'project' as const,
        title: project.data.title,
        description: project.data.description,
        status: project.data.status,
        tech: project.data.tech,
      },
    })),
    ...posts.map((post) => ({
      slug: `blog/${post.id}`,
      card: {
        title: post.data.title,
        description: post.data.description,
        eyebrow: formatDate(post.data.publishedAt),
      },
    })),
  ]

  return cards.map(({ slug, card }) => ({
    params: { slug },
    props: { card },
    // Rasterisation dominates build time. Reuse PNGs until card data or the
    // route's module graph changes.
    cacheKey: JSON.stringify(card),
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage((props as { card: Card }).card)

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
