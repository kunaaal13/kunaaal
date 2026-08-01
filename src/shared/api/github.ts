export type ContributionLevel = 0 | 1 | 2 | 3 | 4

export interface ContributionDay {
  date: string
  count: number
  level: ContributionLevel
}

export interface Contributions {
  total: number
  /** Columns, oldest first. Each is up to 7 days, Sunday → Saturday. */
  weeks: ContributionDay[][]
  from: string
  to: string
}

const ENDPOINT = 'https://api.github.com/graphql'

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

const LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

/**
 * Fetches the contribution calendar at build time.
 *
 * The alternative — a client-side calendar component — costs a dependency plus
 * a request on every page view, to render data that changes once a day. Baking
 * it in means zero client JS and no rate-limit exposure; the tradeoff is that
 * it only refreshes on redeploy, so pair this with a scheduled build.
 *
 * Returns null on any failure. A missing graph is a missing section, never a
 * failed build.
 */
export async function getContributions(
  login: string,
  token = import.meta.env.GITHUB_TOKEN
): Promise<Contributions | null> {
  if (!token) {
    console.info(
      '[github] GITHUB_TOKEN not set — skipping the contributions graph.'
    )
    return null
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-build',
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
    })

    if (!response.ok) {
      console.warn(`[github] Contributions request failed: ${response.status}`)
      return null
    }

    const json = (await response.json()) as any
    if (json.errors?.length) {
      console.warn(`[github] GraphQL error: ${json.errors[0]?.message}`)
      return null
    }

    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar) return null

    const weeks: ContributionDay[][] = calendar.weeks.map((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))
    )

    const flat = weeks.flat()

    return {
      total: calendar.totalContributions,
      weeks,
      from: flat[0]?.date ?? '',
      to: flat.at(-1)?.date ?? '',
    }
  } catch (error) {
    console.warn('[github] Contributions fetch threw:', error)
    return null
  }
}
