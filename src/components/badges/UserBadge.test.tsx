import type * as Utils from '@dashfy/utils'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { UserBadge } from './UserBadge'

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
    format: vi.fn((v: number) => String(v)),
  }) as unknown as typeof Utils
})

const { useApiSubscription } = await import('@dashfy/ui')

describe('UserBadge', () => {
  const mockUserData = {
    login: 'octocat',
    name: 'The Octocat',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231',
    html_url: 'https://github.com/octocat',
    public_repos: 8,
    public_gists: 8,
    followers: 10000,
    following: 9,
    company: 'GitHub',
  }

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('GitHub User')).toBeTruthy()
    expect(screen.getByText('octocat')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'User not found',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('User not found')).toBeTruthy()
  })

  it('should render user data', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('The Octocat')).toBeTruthy()
    expect(screen.getByText('@octocat')).toBeTruthy()
  })

  it('should render user avatar', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    const avatar = screen.getByAltText('octocat')
    expect(avatar).toBeTruthy()
    expect(avatar.getAttribute('src')).toBe(mockUserData.avatar_url)
  })

  it('should display user stats', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('public repos')).toBeTruthy()
    expect(screen.getByText('public gists')).toBeTruthy()
    expect(screen.getByText('followers')).toBeTruthy()
    expect(screen.getByText('following')).toBeTruthy()
    // public_repos and public_gists are both 8, so use getAllByText
    expect(screen.getAllByText('8')).toHaveLength(2)
    expect(screen.getByText('10000')).toBeTruthy() // followers
    expect(screen.getByText('9')).toBeTruthy() // following
  })

  it('should display company when available', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('company')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
  })

  it('should not show company when not available', () => {
    const userWithoutCompany = { ...mockUserData, company: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: userWithoutCompany,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.queryByText('company')).toBeNull()
  })

  it('should show custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge title="Profile" user="octocat" />)

    expect(screen.getByText('Profile')).toBeTruthy()
  })

  it('should show username as subject when no custom title', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.getByText('GitHub User')).toBeTruthy()
    // The username appears multiple times (in subject and @username)
    const usernames = screen.getAllByText(/octocat/)
    expect(usernames.length).toBeGreaterThanOrEqual(1)
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge api="customApi" endpoint="customEndpoint" user="octocat" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { user: 'octocat' },
    })
  })

  it('should use default API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: mockUserData,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'github',
      endpoint: 'user',
      params: { user: 'octocat' },
    })
  })

  it('should not show name section when name is not available', () => {
    const userWithoutName = { ...mockUserData, name: null }
    vi.mocked(useApiSubscription).mockReturnValue({
      data: userWithoutName,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<UserBadge user="octocat" />)

    expect(screen.queryByText('The Octocat')).toBeNull()
    // @username should also not appear when there's no name
    expect(screen.queryByText('@octocat')).toBeNull()
  })
})
