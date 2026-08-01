import { SITE } from '@/shared/config/site'
import { SAME_AS } from '@/shared/config/social'
import { PROFILE, getEmail } from '@/entities/profile'
import type { Post } from '@/entities/post'

const PERSON_ID = `${SITE.url}/#person`
const SITE_ID = `${SITE.url}/#website`

/**
 * One Person node, referenced by @id everywhere else. Emitting the same person
 * inline on every page would give search engines several entities that merely
 * look alike; a single node with references keeps it one identity.
 */
export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PROFILE.fullName,
    alternateName: PROFILE.username,
    url: SITE.url,
    email: `mailto:${getEmail()}`,
    jobTitle: PROFILE.roles.map((role) => role.title),
    // schema.org accepts an array here, so both positions are represented
    // rather than silently dropping the second.
    worksFor: PROFILE.roles.map((role) => ({
      '@type': 'Organization',
      name: role.company,
      url: role.url,
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: PROFILE.location,
    },
    knowsAbout: PROFILE.keywords,
    sameAs: SAME_AS,
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { '@id': PERSON_ID },
  }
}

/** Home page: the person and the site, defined once. */
export function homeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(),
      websiteNode(),
      {
        '@type': 'ProfilePage',
        '@id': `${SITE.url}/#profile`,
        url: SITE.url,
        dateCreated: new Date(PROFILE.dateCreated).toISOString(),
        mainEntity: { '@id': PERSON_ID },
      },
    ],
  }
}

export function postGraph(post: Post, url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(),
      websiteNode(),
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        headline: post.data.title,
        description: post.data.description,
        datePublished: post.data.publishedAt.toISOString(),
        dateModified: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
        keywords: post.data.tags,
        url,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        isPartOf: { '@id': SITE_ID },
        mainEntityOfPage: url,
        ...(post.data.image ? { image: new URL(post.data.image, SITE.url).href } : {}),
      },
    ],
  }
}
