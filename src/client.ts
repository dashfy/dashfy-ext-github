import type { APIRegistration, RequestOptions } from '@dashfy/types'
import { getErrorMessage, stringifyValue } from '@dashfy/utils'

import type {
  GitHubBranchDetails,
  GitHubCommitActivity,
  GithubContributions,
  GitHubContributor,
  GitHubIssue,
  GitHubOrganization,
  GitHubPullRequest,
  GitHubRepository,
  GitHubStatus,
  GitHubTrafficClones,
  GitHubTrafficViews,
  GitHubUser,
} from './types'

const DEFAULT_API_BASE_URL = 'https://api.github.com'
const DEFAULT_API_VERSION = '2022-11-28'
const DEFAULT_TIMEOUT = 10_000
const DEFAULT_USER_AGENT = '@dashfy/ext-github'
const DEFAULT_ACCEPT_HEADER = 'application/vnd.github+json'

export interface GitHubClientConfig {
  /**
   * GitHub API base URL
   * @default 'https://api.github.com'
   */
  baseUrl?: string
  /**
   * GitHub personal access token for authentication
   * Required for private repositories and higher rate limits
   * @see https://github.com/settings/tokens
   */
  token?: string
  /**
   * Request timeout in milliseconds
   * @default 10_000
   */
  timeout?: number
}

/**
 * Creates a GitHub API client for fetching repository data, user info, and statistics.
 *
 * @param config - Client configuration
 * @param config.baseUrl - GitHub API base URL (default: 'https://api.github.com')
 * @param config.token - Personal access token for authentication
 * @param config.timeout - Request timeout in milliseconds (default: 10_000)
 * @returns API registration function for Dashfy
 *
 * @example
 * ```ts
 * import { Dashfy } from '@dashfy/server'
 * import { createGitHubClient } from '@dashfy/ext-github'
 *
 * const dashfy = new Dashfy()
 *
 * // Basic registration (public repos only, limited rate)
 * dashfy.registerApi('github', createGitHubClient())
 *
 * // With personal access token (recommended)
 * dashfy.registerApi('github', createGitHubClient({
 *   token: process.env.GITHUB_TOKEN
 * }))
 * ```
 *
 * @see https://github.com/settings/tokens - Get your GitHub personal access token
 */
export function createGitHubClient(config: GitHubClientConfig): APIRegistration {
  const { baseUrl = DEFAULT_API_BASE_URL, token, timeout = DEFAULT_TIMEOUT } = config

  return ({ logger, request }) => {
    if (!request) {
      throw new Error(
        '@dashfy/ext-github requires the request helper. Make sure you are using @dashfy/server',
      )
    }

    /**
     * Build and execute a request to the GitHub API.
     */
    const buildRequest = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
      const url = new URL(path, baseUrl)

      const headers: Record<string, string> = {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: DEFAULT_ACCEPT_HEADER,
        'X-GitHub-Api-Version': DEFAULT_API_VERSION,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const stringValue = stringifyValue(value)

            if (stringValue !== '') {
              url.searchParams.set(key, stringValue)
            }
          }
        })
      }

      const requestOptions: RequestOptions = {
        url: url.toString(),
        method: 'GET',
        headers,
        timeout,
      }

      const paramsDebug = params ? `${JSON.stringify(params)}` : ''
      logger.info(`[github] Fetching ${url.toString()}${paramsDebug}`)

      try {
        const data = await request(requestOptions)
        return data as T
      } catch (error) {
        throw new Error(`GitHub API error: ${getErrorMessage(error)}`)
      }
    }

    return {
      /**
       * Get user profile information.
       */
      user: async ({ user }: { user: string }): Promise<GitHubUser> => {
        return buildRequest<GitHubUser>(`/users/${user}`)
      },

      /**
       * Get organization information.
       */
      organization: async ({
        organization,
      }: {
        organization: string
      }): Promise<GitHubOrganization> => {
        return buildRequest<GitHubOrganization>(`/orgs/${organization}`)
      },

      /**
       * Get repository information.
       */
      repository: async ({ repository }: { repository: string }): Promise<GitHubRepository> => {
        return buildRequest<GitHubRepository>(`/repos/${repository}`)
      },

      /**
       * Get repository branches with details and commit author info, sorted by most recent first.
       * 31 API calls per page (1 for branches list + 30 for commit details).
       */
      branches: async ({
        repository,
        perPage = 100,
      }: {
        repository: string
        perPage?: number
      }): Promise<{ branches: GitHubBranchDetails[] }> => {
        // 1 call - Already includes name, commit.sha, protected status
        const branches = await buildRequest<GitHubBranchDetails[]>(
          `/repos/${repository}/branches?per_page=${perPage}`,
        )

        const perPageDetails = 30

        // perPageDetails calls - Only fetch commit details (skip redundant branch details call)
        const branchesToFetchDetails = branches.slice(0, perPageDetails)
        const branchesWithDetails = await Promise.all(
          branchesToFetchDetails.map(async (branch) => {
            try {
              const commitData = await buildRequest<{
                author: { login: string; avatar_url: string; html_url: string } | null
                commit: {
                  author: { date: string }
                  committer: { date: string }
                }
              }>(`/repos/${repository}/commits/${branch.commit.sha}`)

              return {
                ...branch,
                commitAuthor: commitData.author,
                commitDate: commitData.commit.committer.date,
              }
            } catch {
              return branch
            }
          }),
        )

        // Sort branches by committer date (most recent first) to match GitHub's "Updated" column
        const sortedBranches = branchesWithDetails.sort((a, b) => {
          if (!a.commitDate) {
            return 1
          }
          if (!b.commitDate) {
            return -1
          }
          return new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime()
        })

        // Return sorted detailed branches first, then remaining basic branches
        const remainingBranches = branches.slice(perPageDetails)
        return { branches: [...sortedBranches, ...remainingBranches] }
      },

      /**
       * Get repository pull requests.
       */
      pullRequests: async ({
        repository,
        state = 'open',
      }: {
        repository: string
        state?: 'open' | 'closed' | 'all'
      }): Promise<{ pullRequests: GitHubPullRequest[] }> => {
        const pullRequests = await buildRequest<GitHubPullRequest[]>(`/repos/${repository}/pulls`, {
          state,
        })
        return { pullRequests }
      },

      /**
       * Get repository contributors statistics.
       */
      contributorsStats: async ({
        repository,
      }: {
        repository: string
      }): Promise<{ contributors: GitHubContributor[] }> => {
        const contributors = await buildRequest<GitHubContributor[]>(
          `/repos/${repository}/stats/contributors`,
        )
        return { contributors: contributors || [] }
      },

      /**
       * Get repository commit activity (last year, per week).
       */
      commitActivity: async ({
        repository,
      }: {
        repository: string
      }): Promise<{ buckets: GitHubCommitActivity[] }> => {
        const buckets = await buildRequest<GitHubCommitActivity[]>(
          `/repos/${repository}/stats/commit_activity`,
        )
        return { buckets: buckets || [] }
      },

      /**
       * Get repository traffic views (requires push access).
       */
      trafficViews: async ({ repository }: { repository: string }): Promise<GitHubTrafficViews> => {
        return buildRequest<GitHubTrafficViews>(`/repos/${repository}/traffic/views`)
      },

      /**
       * Get repository traffic clones (requires push access).
       */
      trafficClones: async ({
        repository,
      }: {
        repository: string
      }): Promise<GitHubTrafficClones> => {
        return buildRequest<GitHubTrafficClones>(`/repos/${repository}/traffic/clones`)
      },

      /**
       * Get GitHub status.
       */
      status: async (): Promise<GitHubStatus> => {
        const url = 'https://www.githubstatus.com/api/v2/status.json'

        const response = await request({
          url,
          method: 'GET',
          headers: { 'User-Agent': DEFAULT_USER_AGENT },
          timeout,
        })

        logger.info(`[github.status] Fetching ${url}`)

        const data = response as {
          status: { indicator: string; description: string }
          page: { updated_at: string }
        }

        const statusMap: Record<string, GitHubStatus['status']> = {
          none: 'good',
          minor: 'minor',
          major: 'major',
          critical: 'critical',
        }

        return {
          status: statusMap[data.status.indicator] ?? 'good',
          body: data.status.description,
          created_on: data.page.updated_at,
        }
      },

      /**
       * Get repository issues.
       */
      issues: async ({
        repository,
        state = 'open',
      }: {
        repository: string
        state?: 'open' | 'closed' | 'all'
      }): Promise<GitHubIssue[]> => {
        return buildRequest<GitHubIssue[]>(`/repos/${repository}/issues`, { state })
      },

      /**
       * Get user contributions (GitHub contribution graph data).
       * Uses the github-contributions-api by @grubersjoe.
       *
       * @see https://github.com/grubersjoe/github-contributions-api
       */
      contributions: async ({ user }: { user: string }): Promise<GithubContributions> => {
        const url = `https://github-contributions-api.jogruber.de/v4/${user}`

        const response = await request({
          url,
          method: 'GET',
          headers: { 'User-Agent': DEFAULT_USER_AGENT },
          timeout,
        })

        logger.info(`[github.contributions] Fetching ${url}`)

        const data = response as GithubContributions

        return {
          total: data.total,
          contributions: data.contributions,
        }
      },
    }
  }
}
