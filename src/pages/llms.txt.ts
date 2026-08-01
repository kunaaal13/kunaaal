import type { APIRoute } from 'astro'
import { getProjects } from '@/entities/project'
import { getPosts } from '@/entities/post'
import { getExperiences } from '@/entities/experience'
import { SITE } from '@/shared/config/site'
import { PROFILE } from '@/entities/profile'
import { formatDate } from '@/shared/lib/date'

/**
 * /llms.txt — a plain-text index for language models, following llmstxt.org.
 *
 * Generated from the same collections the pages render, so it cannot drift.
 * Email is deliberately omitted: the point is to describe the site, not to
 * publish a contact address in the one file guaranteed to be machine-read.
 */
export const GET: APIRoute = async () => {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])
  const experiences = getExperiences()
  const url = (path: string) => new URL(path, SITE.url).href

  const lines: string[] = [
    `# ${PROFILE.fullName}`,
    '',
    `> ${PROFILE.roles.map((r) => `${r.title} at ${r.company}`).join('; ')}${
      PROFILE.building ? `. Building ${PROFILE.building.name}` : ''
    }. Based in ${PROFILE.location}.`,
    '',
    ...PROFILE.about.split('\n').filter(Boolean),
    '',
    '## Projects',
    '',
    ...projects.map(
      (p) =>
        `- [${p.data.title}](${url(`/projects/${p.id}`)}): ${p.data.description} (${p.data.status}; ${p.data.tech.join(', ')})`
    ),
    '',
    '## Writing',
    '',
    ...posts.map(
      (p) =>
        `- [${p.data.title}](${url(`/blog/${p.id}`)}): ${p.data.description} (${formatDate(p.data.publishedAt)})`
    ),
    '',
    '## Experience',
    '',
    ...experiences.flatMap((experience) =>
      experience.positions.map((position) => {
        const { start, end } = position.employmentPeriod
        return `- ${position.title}, ${experience.company} (${start} — ${end ?? 'Present'})`
      })
    ),
    '',
    '## Pages',
    '',
    `- [Projects](${url('/projects')})`,
    `- [Writing](${url('/blog')})`,
    `- [Work](${url('/work')})`,
    `- [Gear](${url('/gear')})`,
    `- [Bookmarks](${url('/bookmarks')})`,
    `- [Contact](${url('/contact')})`,
    `- [RSS](${url('/rss.xml')})`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
