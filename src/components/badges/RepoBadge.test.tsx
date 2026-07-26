import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RepoBadge } from './RepoBadge'

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
    format: vi.fn((v: unknown, formatStr?: string) =>
      formatStr === 'relative' ? '2 days ago' : String(v),
    ),
  })
})

const { useApiSubscription } = await import('@getdashfy/ui')

describe('RepoBadge', () => {
  const mockRepoData = {
    name: 'react',
    full_name: 'react/react',
    html_url: 'https://github.com/react/react',
    description:
      'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    stargazers_count: 220000,
    forks_count: 45000,
    open_issues_count: 1200,
    language: 'JavaScript',
    default_branch: 'main',
    subscribers_count: 6700,
    size: 250000,
    updated_at: '2024-01-15T10:00:00Z',
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('Repository')).toBeTruthy()
    expect(screen.getByText('react/react')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Repository not found',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('Repository not found')).toBeTruthy()
  })

  it('should render repository data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('react')).toBeTruthy()
    expect(
      screen.getByText(
        'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
      ),
    ).toBeTruthy()
  })

  it('should display repository stats', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('issues')).toBeTruthy()
    expect(screen.getByText('forks')).toBeTruthy()
    expect(screen.getByText('stars')).toBeTruthy()
    expect(screen.getByText('1200')).toBeTruthy() // open_issues_count
    expect(screen.getByText('45000')).toBeTruthy() // forks_count
    expect(screen.getByText('220000')).toBeTruthy() // stargazers_count
  })

  it('should display repository details', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('language')).toBeTruthy()
    expect(screen.getByText('JavaScript')).toBeTruthy()
    expect(screen.getByText('default branch')).toBeTruthy()
    expect(screen.getByText('main')).toBeTruthy()
    expect(screen.getByText('Subscribers')).toBeTruthy()
    expect(screen.getByText('Size')).toBeTruthy()
    expect(screen.getByText('updated')).toBeTruthy()
    expect(screen.getByText('2 days ago')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" title="React Repository" />)

    expect(screen.getByText('React Repository')).toBeTruthy()
  })

  it('should show repository name as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('Repository')).toBeTruthy()
    expect(screen.getByText('react/react')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge api="customApi" endpoint="customEndpoint" repository="react/react" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: 'react/react' },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockRepoData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'repository',
      params: { repository: 'react/react' },
    })
  })

  it('should not show description when not available', () => {
    const repoWithoutDescription = { ...mockRepoData, description: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: repoWithoutDescription,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(
      screen.queryByText(
        'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
      ),
    ).toBeNull()
  })

  it('should show N/A when language is not available', () => {
    const repoWithoutLanguage = { ...mockRepoData, language: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: repoWithoutLanguage,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<RepoBadge repository="react/react" />)

    expect(screen.getByText('N/A')).toBeTruthy()
  })
})
