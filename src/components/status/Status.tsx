import {
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
  WidgetStatusBadge,
} from '@getdashfy/ui'
import { format } from '@getdashfy/utils'
import { ClockIcon } from 'lucide-react'

import { GithubIcon } from '@/components/common/Icons'
import type { GitHubStatus } from '@/types'
import { getDisplayStatus } from '@/utils'

export interface StatusProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'status'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'GitHub'
   */
  title?: string
}

const DEFAULT_TITLE = 'GitHub'
const DEFAULT_SUBJECT = 'Status'

/**
 * Displays the current GitHub platform status with a colored badge (success, warning, error).
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: Status
 *   title: GitHub Status
 * ```
 */
export const Status = ({ api = 'github', endpoint = 'status', title }: StatusProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: {},
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GithubIcon />}
          subject={title ? undefined : DEFAULT_SUBJECT}
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
          subject={title ? undefined : DEFAULT_SUBJECT}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const statusData = data as GitHubStatus

  const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
    good: 'success',
    minor: 'warning',
    major: 'error',
    critical: 'error',
  }

  const displayStatus = statusMap[statusData.status] ?? 'success'

  return (
    <Widget>
      <WidgetHeader
        icon={<GithubIcon />}
        subject={title ? undefined : DEFAULT_SUBJECT}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[statusData.status, statusData.created_on]}>
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <WidgetStatusBadge label={getDisplayStatus(statusData.status)} status={displayStatus} />
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <ClockIcon className="h-3 w-3" />
              {format(statusData.created_on, 'relative')}
            </span>
            {statusData.body && statusData.status !== 'good' && (
              <p className="text-muted-foreground text-center text-sm">{statusData.body}</p>
            )}
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
