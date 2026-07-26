import {
  ExternalLink,
  useApiSubscription,
  Widget,
  WidgetAvatar,
  WidgetBody,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLabel,
  WidgetLoader,
} from '@getdashfy/ui'
import { format } from '@getdashfy/utils'
import { BuildingIcon } from 'lucide-react'

import type { GitHubOrganization } from '@/types'
import { getGithubUrl } from '@/utils'

export interface OrgBadgeProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'organization'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Organization'
   */
  title?: string
  /**
   * GitHub organization name
   */
  organization: string
}

const DEFAULT_TITLE = 'Organization'

/**
 * Displays GitHub organization information.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: OrgBadge
 *   organization: vercel
 *   title: Vercel
 * ```
 */
export const OrgBadge = ({
  api = 'github',
  endpoint = 'organization',
  title,
  organization,
}: OrgBadgeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { organization },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<BuildingIcon />}
          subject={title ? undefined : organization}
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
          icon={<BuildingIcon />}
          subject={title ? undefined : organization}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const orgData = data as GitHubOrganization

  return (
    <Widget>
      <WidgetHeader
        icon={<BuildingIcon />}
        subject={title ? undefined : organization}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[organization]}>
          <div className="flex h-full flex-col items-center justify-center gap-4">
            {/* Avatar */}
            <ExternalLink href={orgData.html_url}>
              <WidgetAvatar size={48}>
                <img alt={orgData.login} className="rounded-full" src={orgData.avatar_url} />
              </WidgetAvatar>
            </ExternalLink>

            {/* Name */}
            <div className="text-center">
              <h3 className="text-lg font-semibold">{orgData.name ?? orgData.login}</h3>
              {orgData.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {orgData.description}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid w-full grid-cols-2 gap-2">
              <WidgetLabel
                label={
                  <ExternalLink href={getGithubUrl(`/orgs/${orgData.login}/repositories`)}>
                    public repos
                  </ExternalLink>
                }
                prefix={format(orgData.public_repos, '0a')}
              />
              <WidgetLabel
                label={
                  <ExternalLink href={getGithubUrl(`/orgs/${orgData.login}/followers`)}>
                    followers
                  </ExternalLink>
                }
                prefix={format(orgData.followers, '0a')}
              />
            </div>
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
