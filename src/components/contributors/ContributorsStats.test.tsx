import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ContributorsStats } from './ContributorsStats'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

vi.mock('@getdashfy/utils', async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    format: vi.fn((v: number) => String(v)),
  })
})

const { useApiSubscription } = await import('@getdashfy/ui')

const TEST_REPOSITORY = 'facebook/react'

describe('ContributorsStats', () => {
  const mockContributors = {
    contributors: [
      {
        author: {
          id: 1,
          login: 'octocat',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231',
          html_url: 'https://github.com/octocat',
        },
        total: 100,
        weeks: [],
      },
      {
        author: {
          id: 2,
          login: 'user2',
          avatar_url: 'https://avatars.githubusercontent.com/u/2',
          html_url: 'https://github.com/user2',
        },
        total: 50,
        weeks: [],
      },
      {
        author: {
          id: 3,
          login: 'user3',
          avatar_url: 'https://avatars.githubusercontent.com/u/3',
          html_url: 'https://github.com/user3',
        },
        total: 25,
        weeks: [],
      },
    ],
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Contributors')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch contributors',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Failed to fetch contributors')).toBeTruthy()
  })

  it('should render contributors list', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('octocat')).toBeTruthy()
    expect(screen.getByText('user2')).toBeTruthy()
    expect(screen.getByText('user3')).toBeTruthy()
  })

  it('should display commit counts', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('100 commits')).toBeTruthy()
    expect(screen.getByText('50 commits')).toBeTruthy()
    expect(screen.getByText('25 commits')).toBeTruthy()
  })

  it('should show contributor count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('3')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} title="React Contributors" />)

    expect(screen.getByText('React Contributors')).toBeTruthy()
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should show empty state when no contributors', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { contributors: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No contributors found')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <ContributorsStats api="customApi" endpoint="customEndpoint" repository={TEST_REPOSITORY} />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'contributorsStats',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should render contributor avatars', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByAltText('octocat')).toBeTruthy()
    expect(screen.getByAltText('user2')).toBeTruthy()
    expect(screen.getByAltText('user3')).toBeTruthy()
  })

  it('should sort contributors by commit count (descending)', () => {
    // Provide unsorted data
    const unsortedContributors = {
      contributors: [
        {
          author: {
            id: 1,
            login: 'least-commits',
            avatar_url: 'https://example.com/1',
            html_url: 'https://github.com/least-commits',
          },
          total: 10,
          weeks: [],
        },
        {
          author: {
            id: 2,
            login: 'most-commits',
            avatar_url: 'https://example.com/2',
            html_url: 'https://github.com/most-commits',
          },
          total: 100,
          weeks: [],
        },
        {
          author: {
            id: 3,
            login: 'middle-commits',
            avatar_url: 'https://example.com/3',
            html_url: 'https://github.com/middle-commits',
          },
          total: 50,
          weeks: [],
        },
      ],
    }

    vi.mocked(useApiSubscription).mockReturnValue({
      data: unsortedContributors,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    const commitTexts = screen.getAllByText(/^\d+ commits$/)
    expect(commitTexts[0]?.textContent).toBe('100 commits')
    expect(commitTexts[1]?.textContent).toBe('50 commits')
    expect(commitTexts[2]?.textContent).toBe('10 commits')
  })

  it('should handle null contributors data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { contributors: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<ContributorsStats repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No contributors found')).toBeTruthy()
  })
})
