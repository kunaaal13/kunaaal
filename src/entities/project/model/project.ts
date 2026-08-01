import { getCollection, type CollectionEntry } from 'astro:content'

export type Project = CollectionEntry<'projects'>
export type ProjectStatus = Project['data']['status']

/** Drafts are visible while developing so you can preview before publishing. */
const isVisible = (entry: Project) =>
  import.meta.env.DEV || !entry.data.draft

/** Featured first, then by explicit order, then alphabetically as a tiebreak. */
function compare(a: Project, b: Project): number {
  if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1
  if (a.data.order !== b.data.order) return a.data.order - b.data.order
  return a.data.title.localeCompare(b.data.title)
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects', isVisible)
  return entries.sort(compare)
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured)
}

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; dot: string }
> = {
  live: { label: 'Live', dot: 'bg-success' },
  building: { label: 'Building', dot: 'bg-warning' },
  archived: { label: 'Archived', dot: 'bg-muted-foreground/50' },
}
