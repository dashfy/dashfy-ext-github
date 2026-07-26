import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { GitHubPullRequest, GitHubUser } from '@/types'

import { PullRequest } from './PullRequest'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return { ...actual }
})

vi.mock('@getdashfy/utils', async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    format: vi.fn((_v: unknown, formatStr?: string) =>
      formatStr === 'relative' ? '2 days ago' : 'formatted',
    ),
  })
})

describe('PullRequest', () => {
  const mockPullRequest: GitHubPullRequest = {
    id: 1,
    number: 12345,
    title: 'Fix critical bug in authentication',
    state: 'open',
    html_url: 'https://github.com/react/react/pull/12345',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    merged_at: null,
    user: {
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      html_url: 'https://github.com/octocat',
    } as GitHubUser,
    head: {
      ref: 'fix/auth-bug',
      sha: 'abc123',
    },
    base: {
      ref: 'main',
      sha: 'def456',
    },
    draft: false,
    labels: [
      { id: 1, name: 'bug', color: 'd73a4a' },
      { id: 2, name: 'priority: high', color: 'ff0000' },
    ],
  }

  it('should render pull request title', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    expect(screen.getByText('Fix critical bug in authentication')).toBeTruthy()
  })

  it('should render pull request number', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    expect(screen.getByText('#12345')).toBeTruthy()
  })

  it('should render relative time', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    expect(screen.getByText('2 days ago')).toBeTruthy()
  })

  it('should render branch refs', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    expect(screen.getByText('fix/auth-bug → main')).toBeTruthy()
  })

  it('should render author avatar', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    const avatar = screen.getByAltText('octocat')
    expect(avatar).toBeTruthy()
    expect(avatar.getAttribute('src')).toBe(mockPullRequest.user.avatar_url)
  })

  it('should render labels', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    expect(screen.getByText('bug')).toBeTruthy()
    expect(screen.getByText('priority: high')).toBeTruthy()
  })

  it('should show regular PR icon for non-draft PRs', () => {
    const { container } = render(<PullRequest pullRequest={mockPullRequest} />)

    const prIcon = container.querySelector('.text-success')
    expect(prIcon).toBeTruthy()
  })

  it('should show draft icon for draft PRs', () => {
    const draftPR = { ...mockPullRequest, draft: true }
    const { container } = render(<PullRequest pullRequest={draftPR} />)

    const draftIcon = container.querySelector('.text-muted-foreground')
    expect(draftIcon).toBeTruthy()
  })

  it('should not render labels section when no labels', () => {
    const prWithoutLabels = { ...mockPullRequest, labels: [] }
    render(<PullRequest pullRequest={prWithoutLabels} />)

    expect(screen.queryByText('bug')).toBeNull()
  })

  it('should show only first 3 labels and count for remaining', () => {
    const prWithManyLabels = {
      ...mockPullRequest,
      labels: [
        { id: 1, name: 'label1', color: 'ff0000' },
        { id: 2, name: 'label2', color: '00ff00' },
        { id: 3, name: 'label3', color: '0000ff' },
        { id: 4, name: 'label4', color: 'ffff00' },
        { id: 5, name: 'label5', color: 'ff00ff' },
      ],
    }
    render(<PullRequest pullRequest={prWithManyLabels} />)

    expect(screen.getByText('label1')).toBeTruthy()
    expect(screen.getByText('label2')).toBeTruthy()
    expect(screen.getByText('label3')).toBeTruthy()
    expect(screen.queryByText('label4')).toBeNull()
    expect(screen.queryByText('label5')).toBeNull()
    expect(screen.getByText('+2 more')).toBeTruthy()
  })

  it('should render pull request link with correct URL', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    const link = screen.getByText('Fix critical bug in authentication').closest('a')
    expect(link?.getAttribute('href')).toBe(mockPullRequest.html_url)
  })

  it('should render author link with correct URL', () => {
    render(<PullRequest pullRequest={mockPullRequest} />)

    const avatar = screen.getByAltText('octocat')
    const link = avatar.closest('a')
    expect(link?.getAttribute('href')).toBe(mockPullRequest.user.html_url)
  })

  it('should truncate long titles', () => {
    const prWithLongTitle = {
      ...mockPullRequest,
      title:
        'This is a very long pull request title that should be truncated because it exceeds the maximum length',
    }
    render(<PullRequest pullRequest={prWithLongTitle} />)

    // The truncate function limits to 60 characters
    const title = screen.getByRole('heading', { level: 4 })
    expect(title.textContent?.length).toBeLessThanOrEqual(63) // 60 + "..."
  })
})
