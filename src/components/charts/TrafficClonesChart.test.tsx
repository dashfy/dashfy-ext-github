import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TrafficClonesChart, TrafficClonesHistogram, TrafficClonesLine } from './TrafficClonesChart'

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

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')

const TEST_REPOSITORY = 'facebook/react'

describe('TrafficClonesChart', () => {
  const mockTrafficClones = {
    count: 500,
    uniques: 200,
    clones: [
      { timestamp: '2024-01-01T00:00:00Z', count: 50, uniques: 20 },
      { timestamp: '2024-01-02T00:00:00Z', count: 75, uniques: 30 },
      { timestamp: '2024-01-03T00:00:00Z', count: 100, uniques: 40 },
    ],
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch traffic clones',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Failed to fetch traffic clones')).toBeTruthy()
  })

  it('should render chart with data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })

  it('should display total clones count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('500')).toBeTruthy()
    expect(screen.getByText('Total Clones')).toBeTruthy()
  })

  it('should display unique cloners count', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('200')).toBeTruthy()
    expect(screen.getByText('Unique Cloners')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} title="React Clones" />)

    expect(screen.getByText('React Clones')).toBeTruthy()
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <TrafficClonesChart api="customApi" endpoint="customEndpoint" repository={TEST_REPOSITORY} />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'trafficClones',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should render area chart by default', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })

  it('should render bar chart when type is bar', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockTrafficClones,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} type="bar" />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })

  it('should handle empty clones', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 0, uniques: 0, clones: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
    // Both count and uniques are 0
    expect(screen.getAllByText('0')).toHaveLength(2)
  })

  it('should handle null clones', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 0, uniques: 0, clones: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })
})

describe('TrafficClonesLine', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 100, uniques: 50, clones: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesLine repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(TrafficClonesLine.displayName).toBe('TrafficClonesLine')
  })
})

describe('TrafficClonesHistogram', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { count: 100, uniques: 50, clones: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<TrafficClonesHistogram repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Clones')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(TrafficClonesHistogram.displayName).toBe('TrafficClonesHistogram')
  })
})
