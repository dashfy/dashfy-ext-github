import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  CommitActivityChart,
  CommitActivityHistogram,
  CommitActivityLine,
} from './CommitActivityChart'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

vi.mock('@dashfy/utils', async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    format: vi.fn((v: unknown, formatStr?: string) =>
      formatStr === 'short' ? `Week ${String(v)}` : String(v),
    ),
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

const { useApiSubscription } = await import('@dashfy/ui')

const TEST_REPOSITORY = 'facebook/react'

describe('CommitActivityChart', () => {
  const mockCommitActivity = {
    buckets: [
      { week: 1704067200, total: 10, days: [1, 2, 3, 0, 2, 1, 1] },
      { week: 1704672000, total: 15, days: [2, 3, 2, 3, 2, 2, 1] },
      { week: 1705276800, total: 20, days: [3, 3, 3, 3, 3, 3, 2] },
    ],
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch commit activity',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Failed to fetch commit activity')).toBeTruthy()
  })

  it('should render chart with data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} title="React Commits" />)

    expect(screen.getByText('React Commits')).toBeTruthy()
  })

  it('should show repository as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText(TEST_REPOSITORY)).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <CommitActivityChart
        api="customApi"
        endpoint="customEndpoint"
        repository={TEST_REPOSITORY}
      />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'commitActivity',
      params: { repository: TEST_REPOSITORY },
    })
  })

  it('should render area chart by default', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    // Should render without errors
    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should render bar chart when type is bar', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockCommitActivity,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} type="bar" />)

    // Should render without errors
    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should handle empty buckets', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { buckets: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should handle null buckets', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { buckets: null },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityChart repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })
})

describe('CommitActivityLine', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { buckets: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityLine repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(CommitActivityLine.displayName).toBe('CommitActivityLine')
  })
})

describe('CommitActivityHistogram', () => {
  it('should render chart component', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { buckets: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CommitActivityHistogram repository={TEST_REPOSITORY} />)

    expect(screen.getByText('Commit Activity')).toBeTruthy()
  })

  it('should have correct displayName', () => {
    expect(CommitActivityHistogram.displayName).toBe('CommitActivityHistogram')
  })
})
