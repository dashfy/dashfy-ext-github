import {
  Gitmap as GitmapUI,
  Scrollable,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@dashfy/ui'
import { dateFns } from '@dashfy/utils'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import type { GithubContributions } from '@/types'

export interface GitmapProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'contributions'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Contributions'
   */
  title?: string
  /**
   * GitHub username
   */
  user: string
}

const DEFAULT_TITLE = 'Contributions'

const DEFAULT_COLORS = {
  empty: 'hsl(var(--muted))',
  level1: 'hsl(var(--primary) / 0.3)',
  level2: 'hsl(var(--primary) / 0.5)',
  level3: 'hsl(var(--primary) / 0.7)',
  level4: 'hsl(var(--primary))',
}

/**
 * Displays GitHub user contributions as a heatmap (similar to GitHub's contribution graph).
 *
 * @example
 * ```json
 * {
 *   "extension": "github",
 *   "widget": "Gitmap",
 *   "api": "github",
 *   "endpoint": "contributions",
 *   "title": "My Contributions",
 *   "user": "johndoe"
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: github
 * widget: Gitmap
 * api: github
 * endpoint: contributions
 * title: My Contributions
 * user: johndoe
 * ```
 *
 * @example
 * ```tsx
 * <Gitmap
 *   api="github"
 *   endpoint="contributions"
 *   title="My Contributions"
 *   user="johndoe"
 * />
 * ```
 */
export const Gitmap = ({
  api = 'github',
  endpoint = 'contributions',
  title,
  user,
}: GitmapProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { user },
  })

  const dateRange = React.useMemo(() => {
    const today = new Date()
    const oneYearAgo = dateFns.subYears(today, 1)

    return {
      from: oneYearAgo,
      to: today,
    }
  }, [])

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<CalendarIcon />}
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
          icon={<CalendarIcon />}
          subject={title ? undefined : user}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const userContributionData = data as GithubContributions

  return (
    <Widget>
      <WidgetHeader
        icon={<CalendarIcon />}
        subject={title ? undefined : user}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetErrorBoundary resetKeys={[user, dateRange.from, dateRange.to]}>
        <WidgetBody>
          <div className="flex h-full w-full items-center justify-center">
            <Scrollable
              className="px-2 py-4"
              options={{
                overflow: {
                  x: 'scroll',
                  y: 'hidden',
                },
              }}
            >
              <GitmapUI
                colors={DEFAULT_COLORS}
                contributions={userContributionData.contributions}
                from={dateRange.from}
                to={dateRange.to}
              />
            </Scrollable>
          </div>
        </WidgetBody>
      </WidgetErrorBoundary>
    </Widget>
  )
}
