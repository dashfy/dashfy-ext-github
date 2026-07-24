import { cn, ExternalLink, WidgetAvatar, WidgetListItem } from '@getdashfy/ui'
import { ShieldCheckIcon } from 'lucide-react'

import type { GitHubBranchDetails } from '@/types'
import { getGithubUrl } from '@/utils'

export interface BranchProps {
  branch: GitHubBranchDetails
  repository: string
}

export const Branch = ({ branch, repository }: BranchProps) => {
  const { commitAuthor } = branch

  return (
    <WidgetListItem
      title={
        <span
          className={cn('flex items-center gap-1', {
            'gap-1.5': branch.protected,
          })}
        >
          <ExternalLink
            href={getGithubUrl(`/${repository}/tree/${encodeURIComponent(branch.name)}`)}
          >
            <span className="font-medium">{branch.name}</span>
          </ExternalLink>
          {branch.protected && (
            <span title="Protected branch">
              <ShieldCheckIcon className="text-success h-3.5 w-3.5 shrink-0" />
            </span>
          )}
          {commitAuthor && (
            <span className="text-muted-foreground font-normal">
              by <ExternalLink href={commitAuthor.html_url}>{commitAuthor.login}</ExternalLink>
            </span>
          )}
        </span>
      }
      value={
        commitAuthor && (
          <ExternalLink href={commitAuthor.html_url}>
            <WidgetAvatar alt={commitAuthor.login} size={32} src={commitAuthor.avatar_url} />
          </ExternalLink>
        )
      }
    />
  )
}
