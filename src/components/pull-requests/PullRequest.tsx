import { ExternalLink, generateReactKey, useMode, WidgetAvatar } from '@dashfy/ui'
import { format, truncate } from '@dashfy/utils'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from 'lucide-react'

import type { GitHubPullRequest } from '@/types'
import { getLabelStyle } from '@/utils'

export interface PullRequestProps {
  pullRequest: GitHubPullRequest
}

export const PullRequest = ({ pullRequest }: PullRequestProps) => {
  const { isDark: isDarkMode } = useMode()

  return (
    <div className="border-border flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
      {/* Icon */}
      <div className="mt-0.5">
        {pullRequest.draft ? (
          <GitPullRequestDraftIcon className="text-muted-foreground h-4 w-4" />
        ) : (
          <GitPullRequestIcon className="text-success h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <ExternalLink href={pullRequest.html_url}>
          <h4 className="leading-tight font-medium">{truncate(pullRequest.title, 60)}</h4>
        </ExternalLink>
        {/* Details */}
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span>#{pullRequest.number}</span>
          <span>•</span>
          <span>{format(pullRequest.created_at, 'relative')}</span>
          <span>•</span>
          <span className="font-mono">
            {pullRequest.head.ref} → {pullRequest.base.ref}
          </span>
        </div>
        {/* Labels */}
        {pullRequest.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {pullRequest.labels.slice(0, 3).map((label) => (
              <span
                key={generateReactKey('label', label.id)}
                className="rounded-full px-2 py-0.5 text-xs"
                style={getLabelStyle(label.color, isDarkMode)}
              >
                {label.name}
              </span>
            ))}
            {pullRequest.labels.length > 3 && (
              <span className="text-muted-foreground text-xs">
                +{pullRequest.labels.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Author Avatar */}
      <ExternalLink href={pullRequest.user.html_url}>
        <WidgetAvatar className="h-6 w-6">
          <img
            alt={pullRequest.user.login}
            className="rounded-full"
            src={pullRequest.user.avatar_url}
            title={pullRequest.user.login}
          />
        </WidgetAvatar>
      </ExternalLink>
    </div>
  )
}
