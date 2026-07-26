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
import { GitBranchIcon } from 'lucide-react'

import type { BranchesResponse, GitHubBranchDetails } from '@/types'

import { Branch } from './Branch'

export interface BranchesProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'branches'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Branches'
   */
  title?: string
  /**
   * Repository in format "owner/repo"
   */
  repository: string
  /**
   * Number of branches to fetch
   * @default 30
   */
  perPage?: number
}

const DEFAULT_TITLE = 'Branches'

/**
 * Displays a list of GitHub repository branches sorted by most recent activity.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: Branches
 *   repository: facebook/react
 *   title: React Branches
 *   perPage: 30
 * ```
 */
export const Branches = ({
  api = 'github',
  endpoint = 'branches',
  title,
  repository,
  perPage = 30,
}: BranchesProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository, perPage },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GitBranchIcon />}
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
          icon={<GitBranchIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const branchesData = data as BranchesResponse
  const branches = branchesData?.branches || []

  return (
    <Widget>
      <WidgetHeader
        count={branches.length}
        icon={<GitBranchIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[repository, branches.length]}>
          {branches.length === 0 ? (
            <WidgetEmpty message="No branches found" />
          ) : (
            branches.map((branch: GitHubBranchDetails) => (
              <Branch
                key={generateReactKey('branch', branch.name)}
                branch={branch}
                repository={repository}
              />
            ))
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
