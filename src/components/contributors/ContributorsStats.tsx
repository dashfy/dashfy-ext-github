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
import { UsersIcon } from 'lucide-react'

import type { ContributorsResponse, GitHubContributor } from '@/types'

import { ContributorStat } from './ContributorStat'

export interface ContributorsStatsProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'contributorsStats'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Contributors'
   */
  title?: string
  /**
   * Repository in format "owner/repo"
   */
  repository: string
}

const DEFAULT_TITLE = 'Contributors'

/**
 * Displays GitHub repository contributors with their commit statistics.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: ContributorsStats
 *   repository: react/react
 *   title: React Contributors
 * ```
 */
export const ContributorsStats = ({
  api = 'github',
  endpoint = 'contributorsStats',
  title,
  repository,
}: ContributorsStatsProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<UsersIcon />}
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
          icon={<UsersIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const contributorsData = data as ContributorsResponse
  const contributors = (contributorsData?.contributors || [])
    .slice()
    .sort((a, b) => b.total - a.total)

  const firstContributor = contributors[0]
  const maxCommits = firstContributor?.total ?? 0

  return (
    <Widget>
      <WidgetHeader
        count={contributors.length}
        icon={<UsersIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[repository, contributors.length]}>
          {contributors.length === 0 ? (
            <WidgetEmpty message="No contributors found" />
          ) : (
            contributors.map((contributor: GitHubContributor) => (
              <ContributorStat
                key={generateReactKey('contributor', contributor.author.id)}
                contributor={contributor}
                maxCommits={maxCommits}
              />
            ))
          )}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
