import type { ChartConfig } from '@getdashfy/ui'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { EyeIcon } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { GitHubTrafficViews } from '@/types'

export interface TrafficViewsChartProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'trafficViews'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Visitors'
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
  date: string
  views: number
  uniques: number
}

const DEFAULT_TITLE = 'Visitors'

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--primary))',
  },
  uniques: {
    label: 'Unique Visitors',
    color: 'hsl(var(--success))',
  },
} satisfies ChartConfig

/**
 * Displays GitHub repository visitor traffic over the last 14 days.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: TrafficViewsChart
 *   repository: react/react
 *   title: React Visitors
 *   type: area
 * ```
 */
export const TrafficViewsChart = ({
  api = 'github',
  endpoint = 'trafficViews',
  title,
  repository,
  type = 'area',
}: TrafficViewsChartProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<EyeIcon />}
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
          icon={<EyeIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const trafficData = data as GitHubTrafficViews

  const chartData: ChartDataPoint[] = (trafficData?.views || []).map((view) => ({
    date: format(view.timestamp, 'short'),
    views: view.count,
    uniques: view.uniques,
  }))

  return (
    <Widget>
      <WidgetHeader
        icon={<EyeIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[repository, chartData.length]}>
          <div className="flex h-full w-full flex-col gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">{format(trafficData?.count || 0, '0a')}</p>
                <p className="text-muted-foreground text-xs">Total Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{format(trafficData?.uniques || 0, '0a')}</p>
                <p className="text-muted-foreground text-xs">Unique Visitors</p>
              </div>
            </div>

            <ChartContainer
              className="h-full w-full"
              config={chartConfig}
              style={{ height: 'calc(100% - 64px)' }}
            >
              {type === 'area' ? (
                <AreaChart data={chartData} margin={{ left: -20, right: 12 }} accessibilityLayer>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="uniquesGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-uniques)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-uniques)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis axisLine={false} tick={{ fontSize: 10 }} tickLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                  <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
                  <Area
                    dataKey="views"
                    fill="url(#viewsGradient)"
                    stroke="var(--color-views)"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Area
                    dataKey="uniques"
                    fill="url(#uniquesGradient)"
                    stroke="var(--color-uniques)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ left: -20, right: 12 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis axisLine={false} tick={{ fontSize: 10 }} tickLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                  <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="uniques" fill="var(--color-uniques)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ChartContainer>
          </div>
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}

export const TrafficViewsLine = React.memo((props: Omit<TrafficViewsChartProps, 'type'>) => (
  <TrafficViewsChart {...props} type="area" />
))
TrafficViewsLine.displayName = 'TrafficViewsLine'

export const TrafficViewsHistogram = React.memo((props: Omit<TrafficViewsChartProps, 'type'>) => (
  <TrafficViewsChart {...props} type="bar" />
))
TrafficViewsHistogram.displayName = 'TrafficViewsHistogram'
