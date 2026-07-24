import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GitHubBranchDetails } from '@/types'

import { Branch } from './Branch'

describe('Branch', () => {
  const mockBranch: GitHubBranchDetails = {
    name: 'main',
    protected: false,
    commit: {
      sha: 'abc123',
      url: 'https://api.github.com/repos/facebook/react/commits/abc123',
    },
    commitAuthor: {
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      html_url: 'https://github.com/octocat',
    },
    commitDate: '2024-01-15T10:00:00Z',
  }

  const TEST_REPOSITORY = 'facebook/react'

  it('should render branch name', () => {
    render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    expect(screen.getByText('main')).toBeTruthy()
  })

  it('should render branch link with correct URL', () => {
    render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    const link = screen.getByText('main').closest('a')
    expect(link?.getAttribute('href')).toBe('https://github.com/facebook/react/tree/main')
  })

  it('should render commit author name', () => {
    render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    expect(screen.getByText('octocat')).toBeTruthy()
  })

  it('should render commit author avatar link', () => {
    const { container } = render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    // WidgetAvatar renders with the author link
    const avatarLinks = container.querySelectorAll(`a[href="${mockBranch.commitAuthor?.html_url}"]`)
    expect(avatarLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('should show protected icon for protected branches', () => {
    const protectedBranch = { ...mockBranch, protected: true }
    render(<Branch branch={protectedBranch} repository={TEST_REPOSITORY} />)

    expect(screen.getByTitle('Protected branch')).toBeTruthy()
  })

  it('should not show protected icon for unprotected branches', () => {
    render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    expect(screen.queryByTitle('Protected branch')).toBeNull()
  })

  it('should not render author info when commitAuthor is null', () => {
    const branchWithoutAuthor = { ...mockBranch, commitAuthor: null }
    render(<Branch branch={branchWithoutAuthor} repository={TEST_REPOSITORY} />)

    expect(screen.queryByText('octocat')).toBeNull()
    expect(screen.queryByText('by')).toBeNull()
  })

  it('should not render author info when commitAuthor is undefined', () => {
    const branchWithoutAuthor = { ...mockBranch, commitAuthor: undefined }
    render(<Branch branch={branchWithoutAuthor} repository={TEST_REPOSITORY} />)

    expect(screen.queryByText('octocat')).toBeNull()
  })

  it('should encode branch name in URL', () => {
    const branchWithSpecialChars = { ...mockBranch, name: 'feature/my-feature' }
    render(<Branch branch={branchWithSpecialChars} repository={TEST_REPOSITORY} />)

    const link = screen.getByText('feature/my-feature').closest('a')
    expect(link?.getAttribute('href')).toBe(
      'https://github.com/facebook/react/tree/feature%2Fmy-feature',
    )
  })

  it('should render author link with correct URL', () => {
    render(<Branch branch={mockBranch} repository={TEST_REPOSITORY} />)

    const authorLinks = screen.getAllByRole('link').filter((link) => {
      return link.getAttribute('href') === mockBranch.commitAuthor?.html_url
    })
    expect(authorLinks.length).toBeGreaterThanOrEqual(1)
  })
})
