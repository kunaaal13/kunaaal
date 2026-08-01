import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { getPosts } from '@/entities/post'
import { SITE } from '@/shared/config/site'
import { PROFILE } from '@/entities/profile'

export const GET: APIRoute = async (context) => {
  const posts = await getPosts()

  return rss({
    title: `${PROFILE.fullName} — Writing`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
    customData: `<language>${SITE.locale}</language>`,
  })
}
