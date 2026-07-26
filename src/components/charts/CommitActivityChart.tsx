import type { ChartConfig } from '@getdashfy/ui'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { format } from '@getdashfy/utils'
import { GitCommitHorizontalIcon } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { CommitActivityResponse, GitHubCommitActivity } from '@/types'

export interface CommitActivityChartProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'commitActivity'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Commit Activity'
   */
  title?: string
  /**
   * Repository in format "owner/repo"
   */
  repository: string
  /**
   * Chart type
   * @default 'area'
   */
  type?: 'area' | 'bar'
}

interface ChartDataPoint {
  week: string
  commits: number
}

const DEFAULT_TITLE = 'Commit Activity'

const chartConfig = {
  commits: {
    label: 'Commits',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

/**
 * Displays GitHub repository commit activity over the last 52 weeks.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: CommitActivityChart
 *   repository: facebook/react
 *   title: React Commit Activity
 *   type: area
 * ```
 */
export const CommitActivityChart = ({
  api = 'github',
  endpoint = 'commitActivity',
  title,
  repository,
  type = 'area',
}: CommitActivityChartProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<GitCommitHorizontalIcon />}
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
          icon={<GitCommitHorizontalIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const activityData = data as CommitActivityResponse
  const buckets = activityData?.buckets || []

  const chartData: ChartDataPoint[] = buckets.map((bucket: GitHubCommitActivity) => ({
    week: format(bucket.week, 'short'),
    commits: bucket.total,
  }))

  // Get last 12 weeks for better visualization
  const recentData = chartData.slice(-12)

  return (
    <Widget>
      <WidgetHeader
        icon={<GitCommitHorizontalIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[repository, recentData.length]}>
          <ChartContainer className="h-full w-full" config={chartConfig}>
            {type === 'area' ? (
              <AreaChart data={recentData} margin={{ left: -20, right: 12 }} accessibilityLayer>
                <defs>
                  <linearGradient id="commitGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-commits)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-commits)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="week"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) => value.slice(0, 6)}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis axisLine={false} tick={{ fontSize: 10 }} tickLine={false} tickMargin={8} />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" labelKey="week" />}
                  cursor={false}
                />
                <Area
                  dataKey="commits"
                  fill="url(#commitGradient)"
                  stroke="var(--color-commits)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            ) : (
              <BarChart data={recentData} margin={{ left: -20, right: 12 }} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="week"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) => value.slice(0, 6)}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis axisLine={false} tick={{ fontSize: 10 }} tickLine={false} tickMargin={8} />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" labelKey="week" />}
                  cursor={false}
                />
                <Bar dataKey="commits" fill="var(--color-commits)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ChartContainer>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}

export const CommitActivityLine = React.memo((props: Omit<CommitActivityChartProps, 'type'>) => (
  <CommitActivityChart {...props} type="area" />
))
CommitActivityLine.displayName = 'CommitActivityLine'

export const CommitActivityHistogram = React.memo(
  (props: Omit<CommitActivityChartProps, 'type'>) => <CommitActivityChart {...props} type="bar" />,
)
CommitActivityHistogram.displayName = 'CommitActivityHistogram'
