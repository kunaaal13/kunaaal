import type { SearchItem } from '@/features/command-menu'
import { getProjects } from '@/entities/project'
import { getPosts } from '@/entities/post'
import { NAV } from '@/shared/config/site'
import { SOCIAL_LINKS } from '@/shared/config/social'

/**
 * Composes the command-menu index from every content source.
 *
 * Lives in the app layer rather than inside the feature because it touches
 * `astro:content`, which is server-only — putting it in the feature's barrel
 * drags it into the island's client bundle and fails the build. The app layer
 * is also the right owner conceptually: it is the only layer that legitimately
 * knows about all the entities at once.
 *
 * Runs at build time; the result is passed to the island as a prop, so the
 * menu needs no runtime fetch and is usable the instant it opens.
 */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])

  return [
    ...NAV.map((item) => ({
      id: `page-${item.href}`,
      title: item.title,
      href: item.href,
      group: 'Pages' as const,
    })),
    {
      id: 'page-contact',
      title: 'Contact',
      href: '/contact',
      group: 'Pages' as const,
    },

    ...projects.map((project) => ({
      id: `project-${project.id}`,
      title: project.data.title,
      description: project.data.description,
      href: `/projects/${project.id}`,
      group: 'Projects' as const,
      keywords: project.data.tech,
    })),

    ...posts.map((post) => ({
      id: `post-${post.id}`,
      title: post.data.title,
      description: post.data.description,
      href: `/blog/${post.id}`,
      group: 'Blog' as const,
      keywords: post.data.tags,
    })),

    ...SOCIAL_LINKS.map((social) => ({
      id: `social-${social.name}`,
      title: social.title,
      description: social.handle,
      href: social.href,
      group: 'Social' as const,
    })),
  ]
}
