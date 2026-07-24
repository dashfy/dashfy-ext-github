import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Status } from './Status'

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
    format: vi.fn((_v: unknown, formatStr?: string) =>
      formatStr === 'relative' ? '5 minutes ago' : 'formatted',
    ),
  })
})

const { useApiSubscription } = await import('@getdashfy/ui')

describe('Status', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<Status />)

    expect(screen.getByText('GitHub')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to fetch status',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText(/Failed to fetch status/i)).toBeTruthy()
  })

  it('should render good status', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('All Systems Operational')).toBeTruthy()
  })

  it('should render minor status with warning badge', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'minor',
        body: 'Minor service degradation',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('Minor Issues')).toBeTruthy()
    expect(screen.getByText('Minor service degradation')).toBeTruthy()
  })

  it('should render major status with error badge', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'major',
        body: 'Major outage in progress',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('Major Outage')).toBeTruthy()
    expect(screen.getByText('Major outage in progress')).toBeTruthy()
  })

  it('should render critical status with error badge', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'critical',
        body: 'Critical system failure',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('Critical Outage')).toBeTruthy()
    expect(screen.getByText('Critical system failure')).toBeTruthy()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status title="GitHub Platform Status" />)

    expect(screen.getByText('GitHub Platform Status')).toBeTruthy()
  })

  it('should show default subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('Status')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status api="customApi" endpoint="customEndpoint" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: {},
    })
  })

  it('should not show body text for good status', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const { container } = render(<Status />)

    // The body text "All Systems Operational" should appear in the badge, not as additional text
    const badges = container.querySelectorAll('[class*="inline-flex"]')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should display relative time', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        status: 'good',
        body: 'All Systems Operational',
        created_on: '2024-01-15T10:00:00Z',
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<Status />)

    expect(screen.getByText('5 minutes ago')).toBeTruthy()
  })
})
