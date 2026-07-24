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
} from '@dashfy/ui'
import { format } from '@dashfy/utils'

import { GithubIcon } from '@/components/common/Icons'
import type { GitHubUser } from '@/types'
import { getGistUrl } from '@/utils'

export interface UserBadgeProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'user'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'GitHub User'
   */
  title?: string
  /**
   * GitHub username
   */
  user: string
}

const DEFAULT_TITLE = 'GitHub User'

/**
 * Displays GitHub user information.
 *
 * @example
 * ```json
 * {
 *   "extension": "github",
 *   "widget": "UserBadge",
 *   "api": "github",
 *   "endpoint": "user",
 *   "title": "John Doe",
 *   "user": "johndoe"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: github
 * widget: UserBadge
 * api: github
 * endpoint: user
 * title: John Doe
 * user: johndoe
 * ```
 *
 * @example
 * ```tsx
 * <UserBadge
 *   api="github"
 *   endpoint="user"
 *   title="John Doe"
 *   user="johndoe"
 * />
 * ```
 */
export const UserBadge = ({ api = 'github', endpoint = 'user', title, user }: UserBadgeProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { user },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GithubIcon />}
          subject={title ? undefined : user}
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
          icon={<GithubIcon />}
          subject={title ? undefined : user}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const userData = data as GitHubUser

  return (
    <Widget>
      <WidgetHeader
        icon={<GithubIcon />}
        subject={title ? undefined : user}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[user]}>
          <div className="flex h-full flex-col items-center justify-center gap-4">
            {/* Avatar */}
            <ExternalLink href={userData.html_url}>
              <WidgetAvatar size={48}>
                <img alt={userData.login} className="rounded-full" src={userData.avatar_url} />
              </WidgetAvatar>
            </ExternalLink>

            {/* Name */}
            {userData.name && (
              <div className="text-center">
                <h3 className="text-lg font-semibold">{userData.name}</h3>
                <ExternalLink href={userData.html_url}>
                  <p className="text-sm">@{userData.login}</p>
                </ExternalLink>
              </div>
            )}

            {/* Stats Grid */}
            <div className="flex w-full flex-col gap-2">
              <div className="grid w-full grid-cols-2 gap-2">
                <WidgetLabel
                  label={
                    <ExternalLink href={`${userData.html_url}?tab=repositories`}>
                      public repos
                    </ExternalLink>
                  }
                  prefix={format(userData.public_repos, '0a')}
                />
                <WidgetLabel
                  label={
                    <ExternalLink href={getGistUrl(`/${userData.login}`)}>
                      public gists
                    </ExternalLink>
                  }
                  prefix={format(userData.public_gists, '0a')}
                />
                <WidgetLabel
                  label={
                    <ExternalLink href={`${userData.html_url}?tab=followers`}>
                      followers
                    </ExternalLink>
                  }
                  prefix={format(userData.followers, '0a')}
                />
                <WidgetLabel
                  label={
                    <ExternalLink href={`${userData.html_url}?tab=following`}>
                      following
                    </ExternalLink>
                  }
                  prefix={format(userData.following, '0a')}
                />
              </div>

              {userData.company && (
                <WidgetLabel className="w-full" label="company" suffix={userData.company} />
              )}
            </div>
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
