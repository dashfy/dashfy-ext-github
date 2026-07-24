import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { GitHubContributor } from '@/types'

import { ContributorStat } from './ContributorStat'

vi.mock('@getdashfy/utils', async (importOriginal) => {
  const actual = await importOriginal()
  return Object.assign({}, actual, {
    format: vi.fn((v: number) => String(v)),
  })
})

describe('ContributorStat', () => {
  const mockContributor: GitHubContributor = {
    author: {
      id: 1,
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      html_url: 'https://github.com/octocat',
    } as GitHubContributor['author'],
    total: 50,
    weeks: [],
  }

  it('should render contributor login', () => {
    render(<ContributorStat contributor={mockContributor} maxCommits={100} />)

    expect(screen.getByText('octocat')).toBeTruthy()
  })

  it('should render contributor avatar', () => {
    render(<ContributorStat contributor={mockContributor} maxCommits={100} />)

    const avatar = screen.getByAltText('octocat')
    expect(avatar).toBeTruthy()
    expect(avatar.getAttribute('src')).toBe(mockContributor.author.avatar_url)
  })

  it('should render commit count', () => {
    render(<ContributorStat contributor={mockContributor} maxCommits={100} />)

    expect(screen.getByText('50 commits')).toBeTruthy()
  })

  it('should calculate correct progress bar width', () => {
    const { container } = render(<ContributorStat contributor={mockContributor} maxCommits={100} />)

    const progressBar = container.querySelector('[class*="bg-primary"]')
    expect(progressBar).toBeTruthy()
    expect(progressBar?.getAttribute('style')).toBe('width: 50%;')
  })

  it('should show 100% progress for top contributor', () => {
    const topContributor = { ...mockContributor, total: 100 }
    const { container } = render(<ContributorStat contributor={topContributor} maxCommits={100} />)

    const progressBar = container.querySelector('[class*="bg-primary"]')
    expect(progressBar?.getAttribute('style')).toBe('width: 100%;')
  })

  it('should handle zero maxCommits gracefully', () => {
    const { container } = render(<ContributorStat contributor={mockContributor} maxCommits={0} />)

    const progressBar = container.querySelector('[class*="bg-primary"]')
    expect(progressBar?.getAttribute('style')).toBe('width: 0%;')
  })

  it('should render external links to contributor profile', () => {
    render(<ContributorStat contributor={mockContributor} maxCommits={100} />)

    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2) // avatar link + name link
    links.forEach((link) => {
      expect(link.getAttribute('href')).toBe(mockContributor.author.html_url)
    })
  })

  it('should display small contributor percentage correctly', () => {
    const smallContributor = { ...mockContributor, total: 1 }
    const { container } = render(
      <ContributorStat contributor={smallContributor} maxCommits={100} />,
    )

    const progressBar = container.querySelector('[class*="bg-primary"]')
    expect(progressBar?.getAttribute('style')).toBe('width: 1%;')
  })
})
