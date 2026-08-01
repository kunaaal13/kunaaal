import { getCollection, type CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'blog'>

const isVisible = (entry: Post) => import.meta.env.DEV || !entry.data.draft

/** Newest first. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', isVisible)
  return entries.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  )
}

/** Every tag across all posts, with counts, most-used first. */
export async function getTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPosts()
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/** Flag posts published or updated within the last 30 days. */
export function isRecent(post: Post, days = 30): boolean {
  const stamp = post.data.updatedAt ?? post.data.publishedAt
  return Date.now() - stamp.getTime() < days * 24 * 60 * 60 * 1000
}
