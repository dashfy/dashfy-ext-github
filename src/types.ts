export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  created_at: string
  updated_at: string
}

export interface GitHubOrganization {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  description: string | null
  public_repos: number
  followers: number
  following: number
  blog: string | null
  location: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  private: boolean
  fork: boolean
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  default_branch: string
  owner: GitHubUser
  size: number
  subscribers_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubBranch {
  name: string
  protected: boolean
  commit: {
    sha: string
    url: string
  }
}

export interface GitHubBranchDetails extends GitHubBranch {
  commitAuthor?: {
    login: string
    avatar_url: string
    html_url: string
  } | null
  commitDate?: string
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  merged_at: string | null
  user: GitHubUser
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
  draft: boolean
  labels: {
    id: number
    name: string
    color: string
  }[]
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
  }
  author: GitHubUser | null
  committer: GitHubUser | null
  html_url: string
}

export interface GitHubContributor {
  author: GitHubUser
  total: number
  weeks: {
    w: number // Unix timestamp
    a: number // Additions
    d: number // Deletions
    c: number // Commits
  }[]
}

export interface GitHubCommitActivity {
  week: number // Unix timestamp
  days: number[] // Array of 7 numbers (commits per day, starting Sunday)
  total: number
}

export interface GitHubTrafficViews {
  count: number
  uniques: number
  views: {
    timestamp: string
    count: number
    uniques: number
  }[]
}

export interface GitHubTrafficClones {
  count: number
  uniques: number
  clones: {
    timestamp: string
    count: number
    uniques: number
  }[]
}

export interface GitHubStatus {
  status: 'good' | 'minor' | 'major' | 'critical'
  body: string
  created_on: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  user: GitHubUser
  labels: {
    id: number
    name: string
    color: string
  }[]
  assignees: GitHubUser[]
  milestone: {
    id: number
    number: number
    title: string
    state: string
  } | null
}

export interface GithubContributions {
  total: Record<string, number>
  contributions: {
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
  }[]
}

export interface BranchesResponse {
  branches: GitHubBranchDetails[]
}

export interface PullRequestsResponse {
  pullRequests: GitHubPullRequest[]
}

export interface ContributorsResponse {
  contributors: GitHubContributor[]
}

export interface CommitActivityResponse {
  buckets: GitHubCommitActivity[]
}

export interface ContributionsResponse {
  contributions: GithubContributions['contributions']
}
