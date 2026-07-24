import { ExternalLink, WidgetAvatar } from '@dashfy/ui'
import { format } from '@dashfy/utils'

import type { GitHubContributor } from '@/types'

export interface ContributorStatProps {
  contributor: GitHubContributor
  maxCommits: number
}

export const ContributorStat = ({ contributor, maxCommits }: ContributorStatProps) => {
  const percentage = maxCommits > 0 ? (contributor.total / maxCommits) * 100 : 0

  return (
    <div className="border-border flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      {/* Avatar */}
      <ExternalLink href={contributor.author.html_url}>
        <WidgetAvatar className="h-8 w-8">
          <img
            alt={contributor.author.login}
            className="rounded-full"
            src={contributor.author.avatar_url}
          />
        </WidgetAvatar>
      </ExternalLink>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Name & Commit Count */}
        <div className="flex items-center justify-between">
          <ExternalLink className="font-medium" href={contributor.author.html_url}>
            {contributor.author.login}
          </ExternalLink>
          <span className="text-sm font-medium tabular-nums">
            {format(contributor.total, '0a')} commits
          </span>
        </div>
        {/* Progress bar */}
        <div className="bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
