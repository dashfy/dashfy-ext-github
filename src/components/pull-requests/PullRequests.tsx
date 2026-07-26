import {
  generateReactKey,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetEmpty,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { GitPullRequestIcon } from 'lucide-react'

import type { GitHubPullRequest, PullRequestsResponse } from '@/types'

import { PullRequest } from './PullRequest'

export interface PullRequestsProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'pullRequests'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Pull Requests'
   */
  title?: string
  /**
   * Repository in format "owner/repo"
   */
  repository: string
  /**
   * Pull request state filter
   * @default 'open'
   */
  state?: 'open' | 'closed' | 'all'
}

const DEFAULT_TITLE = 'Pull Requests'

/**
 * Displays a list of GitHub repository pull requests filtered by state (open, closed, or all).
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: PullRequests
 *   repository: facebook/react
 *   title: React PRs
 *   state: open
 * ```
 */
export const PullRequests = ({
  api = 'github',
  endpoint = 'pullRequests',
  title,
  repository,
  state = 'open',
}: PullRequestsProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository, state },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GitPullRequestIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GitPullRequestIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const prData = data as PullRequestsResponse
  const pullRequests = prData?.pullRequests || []

  return (
    <Widget>
      <WidgetHeader
        count={pullRequests.length}
        icon={<GitPullRequestIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[repository, state, pullRequests.length]}>
          {pullRequests.length === 0 ? (
            <WidgetEmpty message={`No ${state} pull requests`} />
          ) : (
            pullRequests.map((pr: GitHubPullRequest) => (
              <PullRequest key={generateReactKey('pr', pr.id)} pullRequest={pr} />
            ))
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
