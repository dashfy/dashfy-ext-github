import {
  ExternalLink,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLabel,
  WidgetLoader,
} from '@getdashfy/ui'
import { format } from '@getdashfy/utils'
import { CircleDotIcon, FolderGit2Icon, GitForkIcon, StarIcon } from 'lucide-react'

import type { GitHubRepository } from '@/types'

export interface RepoBadgeProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'repository'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Repository'
   */
  title?: string
  /**
   * Repository in format "owner/repo"
   */
  repository: string
}

const DEFAULT_TITLE = 'Repository'

/**
 * Displays GitHub repository information.
 *
 * @example
 * ```json
 * {
 *   "extension": "github",
 *   "widget": "RepoBadge",
 *   "api": "github",
 *   "endpoint": "repository",
 *   "title": "React Repository",
 *   "repository": "facebook/react"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: github
 * widget: RepoBadge
 * api: github
 * endpoint: repository
 * title: React Repository
 * repository: facebook/react
 * ```
 *
 * @example
 * ```tsx
 * <RepoBadge
 *   api="github"
 *   endpoint="repository"
 *   title="React Repository"
 *   repository="facebook/react"
 * />
 * ```
 */
export const RepoBadge = ({
  api = 'github',
  endpoint = 'repository',
  title,
  repository,
}: RepoBadgeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<FolderGit2Icon />}
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
          icon={<FolderGit2Icon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const repoData = data as GitHubRepository

  return (
    <Widget>
      <WidgetHeader
        icon={<FolderGit2Icon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[repository]}>
          <div className="flex h-full flex-col gap-4">
            {/* Repo Name & Description */}
            <div>
              <ExternalLink href={repoData.html_url}>
                <h3 className="text-lg font-semibold">{repoData.name}</h3>
              </ExternalLink>
              {repoData.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {repoData.description}
                </p>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <CircleDotIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(repoData.open_issues_count, '0a')}
                </span>
                <ExternalLink href={`${repoData.html_url}/issues`}>
                  <span className="text-sm">issues</span>
                </ExternalLink>
              </div>
              <div className="flex items-center gap-1.5">
                <GitForkIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{format(repoData.forks_count, '0a')}</span>
                <ExternalLink href={`${repoData.html_url}/forks`}>
                  <span className="text-sm">forks</span>
                </ExternalLink>
              </div>
              <div className="flex items-center gap-1.5">
                <StarIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">
                  {format(repoData.stargazers_count, '0a')}
                </span>
                <ExternalLink href={`${repoData.html_url}/stargazers`}>
                  <span className="text-sm">stars</span>
                </ExternalLink>
              </div>
            </div>

            {/* Details */}
            <div className="mt-auto flex w-full flex-col gap-2">
              <div className="grid w-full grid-cols-2 gap-2">
                <WidgetLabel label="language" suffix={repoData.language ?? 'N/A'} />
                <WidgetLabel label="default branch" suffix={repoData.default_branch} />
                <WidgetLabel
                  label="Subscribers"
                  suffix={format(repoData.subscribers_count, '0a')}
                />
                <WidgetLabel label="Size" suffix={format(repoData.size, '0a')} />
              </div>

              <WidgetLabel label="updated" suffix={format(repoData.updated_at, 'relative')} />
            </div>
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
