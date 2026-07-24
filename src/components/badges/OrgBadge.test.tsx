import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { OrgBadge } from './OrgBadge'

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

describe('OrgBadge', () => {
  const mockOrgData = {
    login: 'vercel',
    name: 'Vercel',
    avatar_url: 'https://avatars.githubusercontent.com/u/14985020',
    html_url: 'https://github.com/vercel',
    description: 'Develop. Preview. Ship.',
    public_repos: 150,
    followers: 5000,
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.getByText('Organization')).toBeTruthy()
    expect(screen.getByText('vercel')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Organization not found',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.getByText('Organization not found')).toBeTruthy()
  })

  it('should render organization data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.getByText('Vercel')).toBeTruthy()
    expect(screen.getByText('Develop. Preview. Ship.')).toBeTruthy()
    expect(screen.getByText('public repos')).toBeTruthy()
    expect(screen.getByText('followers')).toBeTruthy()
  })

  it('should render organization avatar', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    const avatar = screen.getByAltText('vercel')
    expect(avatar).toBeTruthy()
    expect(avatar.getAttribute('src')).toBe(mockOrgData.avatar_url)
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" title="Vercel Inc" />)

    expect(screen.getByText('Vercel Inc')).toBeTruthy()
  })

  it('should show organization name as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.getByText('Organization')).toBeTruthy()
    expect(screen.getByText('vercel')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge api="customApi" endpoint="customEndpoint" organization="vercel" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { organization: 'vercel' },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'organization',
      params: { organization: 'vercel' },
    })
  })

  it('should fallback to login when name is not available', () => {
    const orgWithoutName = { ...mockOrgData, name: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: orgWithoutName,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    // Should show login instead of name
    const headings = screen.getAllByText('vercel')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('should not show description when not available', () => {
    const orgWithoutDescription = { ...mockOrgData, description: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: orgWithoutDescription,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.queryByText('Develop. Preview. Ship.')).toBeNull()
  })

  it('should display formatted stats', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockOrgData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<OrgBadge organization="vercel" />)

    expect(screen.getByText('150')).toBeTruthy() // public_repos
    expect(screen.getByText('5000')).toBeTruthy() // followers
  })
})
