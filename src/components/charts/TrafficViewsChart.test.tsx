import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TrafficViewsChart, TrafficViewsHistogram, TrafficViewsLine } from './TrafficViewsChart'

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

describe('TrafficViewsChart', () => {
  const mockTrafficViews = {
    count: 1000,
    uniques: 500,
    views: [
      { timestamp: '2024-01-01T00:00:00Z', count: 100, uniques: 50 },
      { timestamp: '2024-01-02T00:00:00Z', count: 150, uniques: 75 },
      { timestamp: '2024-01-03T00:00:00Z', count: 200, uniques: 100 },
    ],
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch traffic views',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Failed to fetch traffic views')).toBeTruthy()
  })

  it('should render chart with data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })

  it('should display total views count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('1000')).toBeTruthy()
    expect(screen.getByText('Total Views')).toBeTruthy()
  })

  it('should display unique visitors count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('500')).toBeTruthy()
    // The chart legend renders the same label, so match the summary paragraph only
    expect(screen.getByText('Unique Visitors', { selector: 'p' })).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} title="React Visitors" />)

    expect(screen.getByText('React Visitors')).toBeTruthy()
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <TrafficViewsChart api="customApi" endpoint="customEndpoint" repository={TEST_REPOSITORY} />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'trafficViews',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should render area chart by default', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })

  it('should render bar chart when type is bar', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficViews,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} type="bar" />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })

  it('should handle empty views', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 0, uniques: 0, views: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
    // Both count and uniques are 0
    expect(screen.getAllByText('0')).toHaveLength(2)
  })

  it('should handle null views', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 0, uniques: 0, views: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })
})

describe('TrafficViewsLine', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 100, uniques: 50, views: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsLine repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(TrafficViewsLine.displayName).toBe('TrafficViewsLine')
  })
})

describe('TrafficViewsHistogram', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 100, uniques: 50, views: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficViewsHistogram repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Visitors')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(TrafficViewsHistogram.displayName).toBe('TrafficViewsHistogram')
  })
})
