import { describe, expect, it, vi } from 'vitest'

import { createGitHubClient } from './client'
import type {
  GitHubBranchDetails,
  GitHubCommitActivity,
  GithubContributions,
  GitHubContributor,
  GitHubPullRequest,
  GitHubStatus,
} from './types'

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe('createGitHubClient', () => {
  it('should create a client with default config', () => {
    const client = createGitHubClient({})
    expect(client).toBeDefined()
    expect(typeof client).toBe('function')
  })

  it('should create a client with custom config', () => {
    const client = createGitHubClient({
      baseUrl: 'https://api.github.example.com',
      token: 'test-token',
      timeout: 5000,
    })
    expect(client).toBeDefined()
  })

  it('should throw error when request helper is not provided', () => {
    const client = createGitHubClient({})
    expect(() => {
      client({ logger: mockLogger, request: undefined })
    }).toThrow('@getdashfy/ext-github requires the request helper')
  })

  describe('user endpoint', () => {
    it('should fetch user data', async () => {
      const mockUser = {
        login: 'octocat',
        name: 'The Octocat',
        avatar_url: 'https://avatars.githubusercontent.com/u/583231',
        public_repos: 8,
        followers: 10000,
      }
      const mockRequest = vi.fn().mockResolvedValue(mockUser)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.user!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/users/octocat',
          method: 'GET',
        }),
      )
      expect(result).toEqual(mockUser)
    })

    it('should include authorization header when token is provided', async () => {
      const mockRequest = vi.fn().mockResolvedValue({})
      const client = createGitHubClient({ token: 'test-token' })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.user!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      )
    })
  })

  describe('organization endpoint', () => {
    it('should fetch organization data', async () => {
      const mockOrg = {
        login: 'github',
        name: 'GitHub',
        description: 'How people build software',
        public_repos: 500,
      }
      const mockRequest = vi.fn().mockResolvedValue(mockOrg)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.organization!({ organization: 'github' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/orgs/github',
        }),
      )
      expect(result).toEqual(mockOrg)
    })
  })

  describe('repository endpoint', () => {
    it('should fetch repository data', async () => {
      const mockRepo = {
        full_name: 'facebook/react',
        description: 'A declarative, efficient, and flexible JavaScript library',
        stargazers_count: 200000,
        forks_count: 40000,
      }
      const mockRequest = vi.fn().mockResolvedValue(mockRepo)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.repository!({ repository: 'facebook/react' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/repos/facebook/react',
        }),
      )
      expect(result).toEqual(mockRepo)
    })
  })

  describe('branches endpoint', () => {
    it('should fetch branches with commit details', async () => {
      const mockBranches = [
        { name: 'main', commit: { sha: 'abc123' }, protected: true },
        { name: 'develop', commit: { sha: 'def456' }, protected: false },
      ]
      const mockCommit = {
        author: {
          login: 'octocat',
          avatar_url: 'https://example.com/avatar',
          html_url: 'https://github.com/octocat',
        },
        commit: {
          author: { date: '2024-01-15T10:00:00Z' },
          committer: { date: '2024-01-15T10:00:00Z' },
        },
      }
      const mockRequest = vi.fn().mockResolvedValueOnce(mockBranches).mockResolvedValue(mockCommit)

      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.branches!({ repository: 'facebook/react', perPage: 30 })) as {
        branches: GitHubBranchDetails[]
      }

      expect(result.branches).toHaveLength(2)
      expect(result.branches[0]).toHaveProperty('commitAuthor')
      expect(result.branches[0]).toHaveProperty('commitDate')
    })

    it('should handle branch fetch errors gracefully', async () => {
      const mockBranches = [{ name: 'main', commit: { sha: 'abc123' }, protected: true }]
      const mockRequest = vi
        .fn()
        .mockResolvedValueOnce(mockBranches)
        .mockRejectedValueOnce(new Error('Commit not found'))

      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.branches!({ repository: 'facebook/react' })) as {
        branches: GitHubBranchDetails[]
      }

      // Should return branch without commit details when fetch fails
      expect(result.branches).toHaveLength(1)
      expect(result.branches[0]?.name).toBe('main')
    })
  })

  describe('pullRequests endpoint', () => {
    it('should fetch pull requests', async () => {
      const mockPRs = [
        { number: 1, title: 'Fix bug', state: 'open', user: { login: 'octocat' } },
        { number: 2, title: 'Add feature', state: 'open', user: { login: 'octocat' } },
      ]
      const mockRequest = vi.fn().mockResolvedValue(mockPRs)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.pullRequests!({ repository: 'facebook/react' })) as {
        pullRequests: GitHubPullRequest[]
      }

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/repos/facebook/react/pulls'),
        }),
      )
      expect(result.pullRequests).toEqual(mockPRs)
    })

    it('should support state filter', async () => {
      const mockRequest = vi.fn().mockResolvedValue([])
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.pullRequests!({ repository: 'facebook/react', state: 'closed' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('state=closed'),
        }),
      )
    })
  })

  describe('contributorsStats endpoint', () => {
    it('should fetch contributors statistics', async () => {
      const mockContributors = [
        { author: { login: 'octocat' }, total: 100, weeks: [] },
        { author: { login: 'user2' }, total: 50, weeks: [] },
      ]
      const mockRequest = vi.fn().mockResolvedValue(mockContributors)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.contributorsStats!({ repository: 'facebook/react' })) as {
        contributors: GitHubContributor[]
      }

      expect(result.contributors).toEqual(mockContributors)
    })

    it('should return empty array when no contributors', async () => {
      const mockRequest = vi.fn().mockResolvedValue(null)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.contributorsStats!({ repository: 'facebook/react' })) as {
        contributors: GitHubContributor[]
      }

      expect(result.contributors).toEqual([])
    })
  })

  describe('commitActivity endpoint', () => {
    it('should fetch commit activity', async () => {
      const mockActivity = [
        { week: 1704067200, total: 10, days: [1, 2, 3, 0, 2, 1, 1] },
        { week: 1704672000, total: 15, days: [2, 3, 2, 3, 2, 2, 1] },
      ]
      const mockRequest = vi.fn().mockResolvedValue(mockActivity)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.commitActivity!({ repository: 'facebook/react' })) as {
        buckets: GitHubCommitActivity[]
      }

      expect(result.buckets).toEqual(mockActivity)
    })
  })

  describe('trafficViews endpoint', () => {
    it('should fetch traffic views', async () => {
      const mockViews = {
        count: 1000,
        uniques: 500,
        views: [{ timestamp: '2024-01-01T00:00:00Z', count: 100, uniques: 50 }],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockViews)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.trafficViews!({ repository: 'facebook/react' })

      expect(result).toEqual(mockViews)
    })
  })

  describe('trafficClones endpoint', () => {
    it('should fetch traffic clones', async () => {
      const mockClones = {
        count: 500,
        uniques: 200,
        clones: [{ timestamp: '2024-01-01T00:00:00Z', count: 50, uniques: 20 }],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockClones)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.trafficClones!({ repository: 'facebook/react' })

      expect(result).toEqual(mockClones)
    })
  })

  describe('status endpoint', () => {
    it('should fetch GitHub status', async () => {
      const mockResponse = {
        status: { indicator: 'none', description: 'All Systems Operational' },
        page: { updated_at: '2024-01-15T10:00:00Z' },
      }
      const mockRequest = vi.fn().mockResolvedValue(mockResponse)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.status!()

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://www.githubstatus.com/api/v2/status.json',
        }),
      )
      expect(result).toEqual({
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      })
    })

    it('should map status indicators correctly', async () => {
      const testCases = [
        { indicator: 'none', expected: 'good' },
        { indicator: 'minor', expected: 'minor' },
        { indicator: 'major', expected: 'major' },
        { indicator: 'critical', expected: 'critical' },
      ]

      for (const { indicator, expected } of testCases) {
        const mockResponse = {
          status: { indicator, description: 'Test' },
          page: { updated_at: '2024-01-15T10:00:00Z' },
        }
        const mockRequest = vi.fn().mockResolvedValue(mockResponse)
        const client = createGitHubClient({})
        const api = client({ logger: mockLogger, request: mockRequest })

        const result = (await api.status!()) as GitHubStatus

        expect(result.status).toBe(expected)
      }
    })
  })

  describe('issues endpoint', () => {
    it('should fetch issues', async () => {
      const mockIssues = [
        { number: 1, title: 'Bug report', state: 'open' },
        { number: 2, title: 'Feature request', state: 'open' },
      ]
      const mockRequest = vi.fn().mockResolvedValue(mockIssues)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.issues!({ repository: 'facebook/react' })

      expect(result).toEqual(mockIssues)
    })
  })

  describe('contributions endpoint', () => {
    it('should fetch user contributions', async () => {
      const mockContributions = {
        total: { '2024': 365, '2023': 200 },
        contributions: [
          { date: '2024-01-01', count: 5, level: 4 },
          { date: '2024-01-02', count: 3, level: 3 },
          { date: '2024-01-03', count: 0, level: 0 },
        ],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockContributions)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = await api.contributions!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://github-contributions-api.jogruber.de/v4/octocat',
          method: 'GET',
          headers: expect.objectContaining({
            'User-Agent': '@getdashfy/ext-github',
          }),
        }),
      )
      expect(result).toEqual({
        total: mockContributions.total,
        contributions: mockContributions.contributions,
      })
    })

    it('should log the request URL', async () => {
      const mockContributions = {
        total: {},
        contributions: [],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockContributions)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.contributions!({ user: 'testuser' })

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[github.contributions] Fetching https://github-contributions-api.jogruber.de/v4/testuser',
      )
    })

    it('should use custom timeout', async () => {
      const mockContributions = {
        total: {},
        contributions: [],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockContributions)
      const client = createGitHubClient({ timeout: 5000 })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.contributions!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        }),
      )
    })

    it('should return contributions with correct structure', async () => {
      const mockContributions = {
        total: { '2024': 100, '2023': 50 },
        contributions: [
          { date: '2024-01-15', count: 10, level: 4 },
          { date: '2024-01-16', count: 5, level: 2 },
        ],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockContributions)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.contributions!({ user: 'octocat' })) as GithubContributions

      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('contributions')
      expect(result.total).toEqual({ '2024': 100, '2023': 50 })
      expect(result.contributions).toHaveLength(2)
      expect(result.contributions[0]).toHaveProperty('date')
      expect(result.contributions[0]).toHaveProperty('count')
      expect(result.contributions[0]).toHaveProperty('level')
    })

    it('should handle empty contributions', async () => {
      const mockContributions = {
        total: {},
        contributions: [],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockContributions)
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.contributions!({ user: 'newuser' })) as GithubContributions

      expect(result.total).toEqual({})
      expect(result.contributions).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should throw error on API failure', async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error('Network error'))
      const client = createGitHubClient({})
      const api = client({ logger: mockLogger, request: mockRequest })

      await expect(api.user!({ user: 'octocat' })).rejects.toThrow(
        'GitHub API error: Network error',
      )
    })
  })

  describe('custom baseUrl', () => {
    it('should use custom base URL', async () => {
      const mockRequest = vi.fn().mockResolvedValue({})
      const client = createGitHubClient({ baseUrl: 'https://github.enterprise.com' })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.user!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://github.enterprise.com/users/octocat',
        }),
      )
    })
  })

  describe('timeout configuration', () => {
    it('should use custom timeout', async () => {
      const mockRequest = vi.fn().mockResolvedValue({})
      const client = createGitHubClient({ timeout: 5000 })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.user!({ user: 'octocat' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        }),
      )
    })
  })
})
