import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Branches } from './Branches'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')

const TEST_REPOSITORY = 'facebook/react'

describe('Branches', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Branches')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch branches',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText(/Failed to fetch branches/i)).toBeTruthy()
  })

  it('should render branches list', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        branches: [
          {
            name: 'main',
            commit: { sha: 'abc123' },
            protected: true,
            commitAuthor: { login: 'octocat', avatar_url: 'https://example.com/avatar' },
            commitDate: '2024-01-15T10:00:00Z',
          },
          {
            name: 'develop',
            commit: { sha: 'def456' },
            protected: false,
            commitAuthor: { login: 'user2', avatar_url: 'https://example.com/avatar2' },
            commitDate: '2024-01-14T10:00:00Z',
          },
        ],
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText('main')).toBeTruthy()
    expect(screen.getByText('develop')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} title="React Branches" />)

    expect(screen.getByText('React Branches')).toBeTruthy()
  })

  it('should show branch count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        branches: [
          { name: 'main', commit: { sha: 'abc123' }, protected: true },
          { name: 'develop', commit: { sha: 'def456' }, protected: false },
          { name: 'feature', commit: { sha: 'ghi789' }, protected: false },
        ],
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText('3')).toBeTruthy()
  })

  it('should show empty state when no branches', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No branches found')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches api="customApi" endpoint="customEndpoint" repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY, perPage: 30 },
    })
  })

  it('should pass perPage parameter', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches perPage={50} repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'branches',
      params: { repository: TEST_REPOSITORY, perPage: 50 },
    })
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should handle null branches data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { branches: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Branches repository={TEST_REPOSITORY} />)

    expect(screen.getByText('No branches found')).toBeTruthy()
  })
})
