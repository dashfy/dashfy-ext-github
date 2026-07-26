import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PullRequests } from './PullRequests'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')

const TEST_REPOSITORY = 'react/react'

describe('PullRequests', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Pull Requests')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch pull requests',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText(/Failed to fetch pull requests/i)).toBeTruthy()
  })

  it('should render pull requests list', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        pullRequests: [
          {
            id: 1,
            number: 1,
            title: 'Fix critical bug',
            state: 'open',
            draft: false,
            user: {
              login: 'octocat',
              avatar_url: 'https://example.com/avatar',
              html_url: 'https://github.com/octocat',
            },
            created_at: '2024-01-15T10:00:00Z',
            html_url: 'https://github.com/react/react/pull/1',
            head: { ref: 'fix-bug' },
            base: { ref: 'main' },
            labels: [],
          },
          {
            id: 2,
            number: 2,
            title: 'Add new feature',
            state: 'open',
            draft: false,
            user: {
              login: 'user2',
              avatar_url: 'https://example.com/avatar2',
              html_url: 'https://github.com/user2',
            },
            created_at: '2024-01-14T10:00:00Z',
            html_url: 'https://github.com/react/react/pull/2',
            head: { ref: 'feature' },
            base: { ref: 'main' },
            labels: [],
          },
        ],
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Fix critical bug')).toBeTruthy()
    expect(screen.getByText('Add new feature')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} title="React PRs" />)

    expect(screen.getByText('React PRs')).toBeTruthy()
  })

  it('should show PR count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        pullRequests: [
          {
            id: 1,
            number: 1,
            title: 'PR 1',
            state: 'open',
            draft: false,
            user: {
              login: 'user1',
              avatar_url: 'https://example.com/avatar1',
              html_url: 'https://github.com/user1',
            },
            created_at: '2024-01-15T10:00:00Z',
            html_url: 'https://github.com/react/react/pull/1',
            head: { ref: 'branch1' },
            base: { ref: 'main' },
            labels: [],
          },
          {
            id: 2,
            number: 2,
            title: 'PR 2',
            state: 'open',
            draft: false,
            user: {
              login: 'user2',
              avatar_url: 'https://example.com/avatar2',
              html_url: 'https://github.com/user2',
            },
            created_at: '2024-01-14T10:00:00Z',
            html_url: 'https://github.com/react/react/pull/2',
            head: { ref: 'branch2' },
            base: { ref: 'main' },
            labels: [],
          },
        ],
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('2')).toBeTruthy()
  })

  it('should show empty state when no pull requests', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No open pull requests')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests api="customApi" endpoint="customEndpoint" repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY, state: 'open' },
    })
  })

  it('should pass state parameter', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} state="closed" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'pullRequests',
      params: { repository: TEST_REPOSITORY, state: 'closed' },
    })
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should handle null pullRequests data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { pullRequests: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No open pull requests')).toBeTruthy()
  })

  it('should display PR number with hash', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        pullRequests: [
          {
            id: 12345,
            number: 12345,
            title: 'Test PR',
            state: 'open',
            draft: false,
            user: {
              login: 'octocat',
              avatar_url: 'https://example.com/avatar',
              html_url: 'https://github.com/octocat',
            },
            created_at: '2024-01-15T10:00:00Z',
            html_url: 'https://github.com/react/react/pull/12345',
            head: { ref: 'test-branch' },
            base: { ref: 'main' },
            labels: [],
          },
        ],
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<PullRequests repository={TEST_REPOSITORY} />)

    expect(screen.getByText('#12345')).toBeTruthy()
  })
})
