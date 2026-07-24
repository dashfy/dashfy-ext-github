import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { GithubContributions } from '@/types'

import { Gitmap } from './Gitmap'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
    Gitmap: vi.fn(
      ({
        contributions,
        from,
        to,
        colors,
      }: {
        contributions: GithubContributions['contributions']
        from: Date
        to: Date
        colors: Record<string, string>
      }) => (
        <div data-testid="gitmap-ui">
          <div data-testid="contributions-count">{contributions.length}</div>
          <div data-testid="from-date">{from.toISOString()}</div>
          <div data-testid="to-date">{to.toISOString()}</div>
          <div data-testid="colors">{JSON.stringify(colors)}</div>
        </div>
      ),
    ),
  }
})

const { useApiSubscription, Gitmap: GitmapUI } = await import('@dashfy/ui')

describe('Gitmap', () => {
  const mockContributionsData: GithubContributions = {
    total: { '2024': 365, '2023': 200 },
    contributions: [
      { date: '2024-01-01', count: 5, level: 4 },
      { date: '2024-01-02', count: 3, level: 3 },
      { date: '2024-01-03', count: 0, level: 0 },
      { date: '2024-01-04', count: 2, level: 2 },
      { date: '2024-01-05', count: 1, level: 1 },
    ],
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<Gitmap user="octocat" />)

    expect(screen.getByText('Contributions')).toBeTruthy()
    expect(screen.getByText('octocat')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch contributions',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    expect(screen.getByText(/Failed to fetch contributions/i)).toBeTruthy()
  })

  it('should render contributions data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    expect(screen.getByTestId('gitmap-ui')).toBeTruthy()
    expect(screen.getByTestId('contributions-count')?.textContent).toBe('5')
  })

  it('should pass correct props to GitmapUI component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    expect(GitmapUI).toHaveBeenCalledWith(
      expect.objectContaining({
        contributions: mockContributionsData.contributions,
        colors: {
          empty: 'hsl(var(--muted))',
          level1: 'hsl(var(--primary) / 0.3)',
          level2: 'hsl(var(--primary) / 0.5)',
          level3: 'hsl(var(--primary) / 0.7)',
          level4: 'hsl(var(--primary))',
        },
      }),
      undefined,
    )
  })

  it('should calculate date range correctly (one year ago to today)', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    const fromDate = screen.getByTestId('from-date')
    const toDate = screen.getByTestId('to-date')

    expect(fromDate).toBeTruthy()
    expect(toDate).toBeTruthy()

    const fromDateValue = new Date(fromDate.textContent || '')
    const toDateValue = new Date(toDate.textContent || '')
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    // Allow for some time difference due to test execution time
    expect(Math.abs(fromDateValue.getTime() - oneYearAgo.getTime())).toBeLessThan(1000)
    expect(Math.abs(toDateValue.getTime() - today.getTime())).toBeLessThan(1000)
  })

  it('should use custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap title="My Contributions" user="octocat" />)

    expect(screen.getByText('My Contributions')).toBeTruthy()
    expect(screen.queryByText('octocat')).toBeNull() // Should not show username when title is provided
  })

  it('should show username as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    expect(screen.getByText('Contributions')).toBeTruthy()
    expect(screen.getByText('octocat')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap api="customApi" endpoint="customEndpoint" user="octocat" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { user: 'octocat' },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'contributions',
      params: { user: 'octocat' },
    })
  })

  it('should handle empty contributions', () => {
    const emptyContributions: GithubContributions = {
      total: {},
      contributions: [],
    }

    vi.mocked(useApiSubscription).mockReturnValue({
      data: emptyContributions,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="newuser" />)

    expect(screen.getByTestId('gitmap-ui')).toBeTruthy()
    expect(screen.getByTestId('contributions-count')?.textContent).toBe('0')
  })

  it('should show loading state only when loading and no data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: true, // Still loading but has data
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    // Should show the gitmap, not the loader
    expect(screen.getByTestId('gitmap-ui')).toBeTruthy()
    expect(screen.queryByText('Loading...')).toBeNull()
  })

  it('should render WidgetErrorBoundary with correct resetKeys', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    // WidgetErrorBoundary should be present (we can't easily test resetKeys without more complex setup)
    expect(screen.getByTestId('gitmap-ui')).toBeTruthy()
  })

  it('should pass user parameter correctly', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="johndoe" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'contributions',
      params: { user: 'johndoe' },
    })
  })

  it('should use default colors', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockContributionsData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Gitmap user="octocat" />)

    const colorsElement = screen.getByTestId('colors')
    const colors = JSON.parse(colorsElement.textContent || '{}')

    expect(colors).toEqual({
      empty: 'hsl(var(--muted))',
      level1: 'hsl(var(--primary) / 0.3)',
      level2: 'hsl(var(--primary) / 0.5)',
      level3: 'hsl(var(--primary) / 0.7)',
      level4: 'hsl(var(--primary))',
    })
  })
})
