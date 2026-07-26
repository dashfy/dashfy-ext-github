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
import { CopyIcon } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { GitHubTrafficClones } from '@/types'

export interface TrafficClonesChartProps {
  /**
   * API subscription ID
   * @default 'github'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'trafficClones'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'Clones'
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
  clones: number
  uniques: number
}

const DEFAULT_TITLE = 'Clones'

const chartConfig = {
  clones: {
    label: 'Clones',
    color: 'hsl(var(--primary))',
  },
  uniques: {
    label: 'Unique Cloners',
    color: 'hsl(var(--success))',
  },
} satisfies ChartConfig

/**
 * Displays GitHub repository clone statistics over the last 14 days.
 *
 * @example
 * ```yaml
 * - extension: github
 *   widget: TrafficClonesChart
 *   repository: facebook/react
 *   title: React Clones
 *   type: area
 * ```
 */
export const TrafficClonesChart = ({
  api = 'github',
  endpoint = 'trafficClones',
  title,
  repository,
  type = 'area',
}: TrafficClonesChartProps) => {
  const { data, error, loading } = useApiSubscription({
    api,
    endpoint,
    params: { repository },
  })

  if (loading && !data) {
    return (
      <Widget>
        <WidgetHeader
          icon={<CopyIcon />}
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
          icon={<CopyIcon />}
          subject={title ? undefined : repository}
          title={title ?? DEFAULT_TITLE}
        />
        <WidgetBody>
          <div className="text-destructive text-sm">{error}</div>
        </WidgetBody>
      </Widget>
    )
  }

  const clonesData = data as GitHubTrafficClones

  const chartData: ChartDataPoint[] = (clonesData?.clones || []).map((clone) => ({
    date: format(clone.timestamp, 'short'),
    clones: clone.count,
    uniques: clone.uniques,
  }))

  return (
    <Widget>
      <WidgetHeader
        icon={<CopyIcon />}
        subject={title ? undefined : repository}
        title={title ?? DEFAULT_TITLE}
      />
      <WidgetBody scrollable>
        <WidgetErrorBoundary resetKeys={[repository, chartData.length]}>
          <div className="flex h-full w-full flex-col gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">{format(clonesData?.count || 0, '0a')}</p>
                <p className="text-muted-foreground text-xs">Total Clones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{format(clonesData?.uniques || 0, '0a')}</p>
                <p className="text-muted-foreground text-xs">Unique Cloners</p>
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
                    <linearGradient id="clonesGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-clones)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-clones)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="uniqueClonesGradient" x1="0" x2="0" y1="0" y2="1">
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
                    dataKey="clones"
                    fill="url(#clonesGradient)"
                    stroke="var(--color-clones)"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Area
                    dataKey="uniques"
                    fill="url(#uniqueClonesGradient)"
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
                  <Bar dataKey="clones" fill="var(--color-clones)" radius={[4, 4, 0, 0]} />
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

export const TrafficClonesLine = React.memo((props: Omit<TrafficClonesChartProps, 'type'>) => (
  <TrafficClonesChart {...props} type="area" />
))
TrafficClonesLine.displayName = 'TrafficClonesLine'

export const TrafficClonesHistogram = React.memo((props: Omit<TrafficClonesChartProps, 'type'>) => (
  <TrafficClonesChart {...props} type="bar" />
))
TrafficClonesHistogram.displayName = 'TrafficClonesHistogram'
