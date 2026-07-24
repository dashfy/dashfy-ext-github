# Dashfy GitHub Extension

[![npm version](https://img.shields.io/npm/v/@dashfy/ext-github.svg?style=flat-square)](https://www.npmjs.com/package/@dashfy/ext-github)
[![License](https://img.shields.io/github/license/dashfy/dashfy.svg?style=flat-square)](https://github.com/dashfy/dashfy/blob/main/LICENSE)

> GitHub extension for [Dashfy](https://github.com/dashfy/dashfy) - Display GitHub data with beautiful widgets and charts.

This extension provides widgets to visualize GitHub repositories, users, organizations, pull requests, branches, contributions, and more.

## Features

- **📊 Repository stats**: Display repository information, stars, forks, issues, and activity
- **👥 User & organization badges**: Show user and organization profiles
- **🔀 Pull requests & branches**: Monitor open PRs and active branches
- **📈 Charts & analytics**: Visualize commit activity, traffic views, and clones
- **👨‍💻 Contributors**: Display top contributors with statistics
- **🗓️ Contribution heatmap**: GitHub-style contribution calendar (Gitmap)
- **🟢 GitHub status**: Monitor GitHub's system status
- **⚡ Real-time updates**: Automatic data refresh via WebSocket subscriptions
- **🎨 Theme support**: Works with all Dashfy themes (light/dark mode)

## Installation

```bash
npm install @dashfy/ext-github
# or
pnpm add @dashfy/ext-github
# or
yarn add @dashfy/ext-github
```

## Quick Start

### 1. Server Setup

Register the GitHub API client in your Dashfy server:

```ts
import { Dashfy } from '@dashfy/server'
import { createGitHubClient } from '@dashfy/ext-github'

const dashfy = new Dashfy()

// Register GitHub API (with authentication token recommended)
dashfy.registerApi(
  'github',
  createGitHubClient({
    token: process.env.GITHUB_TOKEN, // Optional but recommended
  }),
)

await dashfy.start()
```

### 2. Client Setup

Register GitHub widgets in your React application:

```tsx
import { WidgetRegistry } from '@dashfy/ui'
import {
  Branches,
  CommitActivityLine,
  ContributorsStats,
  Gitmap,
  OrgBadge,
  PullRequests,
  RepoBadge,
  Status,
  TrafficClonesHistogram,
  TrafficViewsHistogram,
  UserBadge,
} from '@dashfy/ext-github'

// Register all GitHub widgets
WidgetRegistry.addExtension('github', {
  Branches,
  CommitActivityLine,
  ContributorsStats,
  Gitmap,
  OrgBadge,
  PullRequests,
  RepoBadge,
  Status,
  TrafficClonesHistogram,
  TrafficViewsHistogram,
  UserBadge,
})
```

### 3. Dashboard Configuration

Add GitHub widgets to your dashboard configuration:

```yaml
# dashfy.config.yml
dashboards:
  - title: GitHub Dashboard
    columns: 3
    rows: 2
    widgets:
      - extension: github
        widget: RepoBadge
        repository: facebook/react
        x: 0
        y: 0
        columns: 1
        rows: 1

      - extension: github
        widget: PullRequests
        repository: vercel/next.js
        state: open
        x: 1
        y: 0
        columns: 2
        rows: 1
```

## GitHub API Configuration

### Authentication

While authentication is optional, it's **highly recommended** to provide a GitHub personal access token to:

- Access private repositories
- Increase API rate limits (5,000 requests/hour vs 60 requests/hour)
- Access traffic data (requires push access)

#### Creating a Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes based on your needs:
   - `public_repo` - Access public repositories
   - `repo` - Access private repositories
   - `read:org` - Read organization data
4. Copy the generated token

#### Configuration Options

```ts
createGitHubClient({
  // GitHub API base URL (useful for GitHub Enterprise)
  baseUrl: 'https://api.github.com', // default

  // Personal access token for authentication
  token: process.env.GITHUB_TOKEN,

  // Request timeout in milliseconds
  timeout: 10000, // default
})
```

#### Environment Variables

You can use environment variables for configuration:

```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
```

```ts
createGitHubClient({
  token: process.env.GITHUB_TOKEN,
})
```

### GitHub Enterprise

To use with GitHub Enterprise, set the `baseUrl`:

```ts
createGitHubClient({
  baseUrl: 'https://github.company.com/api/v3',
  token: process.env.GITHUB_ENTERPRISE_TOKEN,
})
```

## Available Widgets

### Badges

#### `RepoBadge`

Display repository information with stats (stars, forks, issues).

**Parameters:**

| Parameter    | Type   | Required | Default      | Description                       |
| ------------ | ------ | -------- | ------------ | --------------------------------- |
| `repository` | string | yes      | -            | Repository in format "owner/repo" |
| `title`      | string | no       | "Repository" | Custom widget title               |
| `api`        | string | no       | "github"     | API subscription ID               |
| `endpoint`   | string | no       | "repository" | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: RepoBadge
  repository: facebook/react
  title: React Repository
  columns: 1
  rows: 1
```

#### `UserBadge`

Display GitHub user profile information.

**Parameters:**

| Parameter  | Type   | Required | Default  | Description          |
| ---------- | ------ | -------- | -------- | -------------------- |
| `user`     | string | yes      | -        | GitHub username      |
| `title`    | string | no       | "User"   | Custom widget title  |
| `api`      | string | no       | "github" | API subscription ID  |
| `endpoint` | string | no       | "user"   | API endpoint to call |

**Example:**

```yaml
- extension: github
  widget: UserBadge
  user: torvalds
  columns: 1
  rows: 1
```

#### `OrgBadge`

Display GitHub organization information.

**Parameters:**

| Parameter      | Type   | Required | Default        | Description          |
| -------------- | ------ | -------- | -------------- | -------------------- |
| `organization` | string | yes      | -              | Organization name    |
| `title`        | string | no       | "Organization" | Custom widget title  |
| `api`          | string | no       | "github"       | API subscription ID  |
| `endpoint`     | string | no       | "organization" | API endpoint to call |

**Example:**

```yaml
- extension: github
  widget: OrgBadge
  organization: facebook
  columns: 1
  rows: 1
```

### Repository Data

#### `Branches`

Display repository branches with commit authors and dates.

**Parameters:**

| Parameter    | Type   | Required | Default    | Description                       |
| ------------ | ------ | -------- | ---------- | --------------------------------- |
| `repository` | string | yes      | -          | Repository in format "owner/repo" |
| `title`      | string | no       | "Branches" | Custom widget title               |
| `api`        | string | no       | "github"   | API subscription ID               |
| `endpoint`   | string | no       | "branches" | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: Branches
  repository: vercel/next.js
  columns: 2
  rows: 1
```

#### `PullRequests`

Display repository pull requests with authors and status.

**Parameters:**

| Parameter    | Type                        | Required | Default         | Description                       |
| ------------ | --------------------------- | -------- | --------------- | --------------------------------- |
| `repository` | string                      | yes      | -               | Repository in format "owner/repo" |
| `state`      | "open" \| "closed" \| "all" | no       | "open"          | Pull request state filter         |
| `title`      | string                      | no       | "Pull Requests" | Custom widget title               |
| `api`        | string                      | no       | "github"        | API subscription ID               |
| `endpoint`   | string                      | no       | "pullRequests"  | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: PullRequests
  repository: facebook/react
  state: open
  columns: 2
  rows: 1
```

### Charts & Analytics

#### `CommitActivityLine`

Display commit activity over the last year as a line chart.

**Parameters:**

| Parameter    | Type   | Required | Default           | Description                       |
| ------------ | ------ | -------- | ----------------- | --------------------------------- |
| `repository` | string | yes      | -                 | Repository in format "owner/repo" |
| `title`      | string | no       | "Commit Activity" | Custom widget title               |
| `api`        | string | no       | "github"          | API subscription ID               |
| `endpoint`   | string | no       | "commitActivity"  | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: CommitActivityLine
  repository: nodejs/node
  columns: 2
  rows: 1
```

#### `ContributorsStats`

Display top contributors with commit statistics.

**Parameters:**

| Parameter    | Type   | Required | Default             | Description                       |
| ------------ | ------ | -------- | ------------------- | --------------------------------- |
| `repository` | string | yes      | -                   | Repository in format "owner/repo" |
| `title`      | string | no       | "Contributors"      | Custom widget title               |
| `api`        | string | no       | "github"            | API subscription ID               |
| `endpoint`   | string | no       | "contributorsStats" | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: ContributorsStats
  repository: microsoft/vscode
  columns: 2
  rows: 1
```

#### `TrafficViewsHistogram`

Display repository traffic views (requires push access).

**Parameters:**

| Parameter    | Type   | Required | Default         | Description                       |
| ------------ | ------ | -------- | --------------- | --------------------------------- |
| `repository` | string | yes      | -               | Repository in format "owner/repo" |
| `title`      | string | no       | "Traffic Views" | Custom widget title               |
| `api`        | string | no       | "github"        | API subscription ID               |
| `endpoint`   | string | no       | "trafficViews"  | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: TrafficViewsHistogram
  repository: myorg/myrepo
  columns: 2
  rows: 1
```

#### `TrafficClonesHistogram`

Display repository traffic clones (requires push access).

**Parameters:**

| Parameter    | Type   | Required | Default          | Description                       |
| ------------ | ------ | -------- | ---------------- | --------------------------------- |
| `repository` | string | yes      | -                | Repository in format "owner/repo" |
| `title`      | string | no       | "Traffic Clones" | Custom widget title               |
| `api`        | string | no       | "github"         | API subscription ID               |
| `endpoint`   | string | no       | "trafficClones"  | API endpoint to call              |

**Example:**

```yaml
- extension: github
  widget: TrafficClonesHistogram
  repository: myorg/myrepo
  columns: 2
  rows: 1
```

### User Data

#### `Gitmap`

Display GitHub contribution heatmap (similar to GitHub's contribution graph).

**Parameters:**

| Parameter  | Type   | Required | Default         | Description          |
| ---------- | ------ | -------- | --------------- | -------------------- |
| `user`     | string | yes      | -               | GitHub username      |
| `title`    | string | no       | "Contributions" | Custom widget title  |
| `api`      | string | no       | "github"        | API subscription ID  |
| `endpoint` | string | no       | "contributions" | API endpoint to call |

**Example:**

```yaml
- extension: github
  widget: Gitmap
  user: torvalds
  columns: 3
  rows: 1
```

### System Status

#### `Status`

Display GitHub's current system status.

**Parameters:**

| Parameter  | Type   | Required | Default         | Description          |
| ---------- | ------ | -------- | --------------- | -------------------- |
| `title`    | string | no       | "GitHub Status" | Custom widget title  |
| `api`      | string | no       | "github"        | API subscription ID  |
| `endpoint` | string | no       | "status"        | API endpoint to call |

**Example:**

```yaml
- extension: github
  widget: Status
  columns: 1
  rows: 1
```

## Complete Example

Here's a complete dashboard configuration showcasing all GitHub widgets:

```yaml
# dashfy.config.yml
dashboards:
  - title: GitHub Dashboard
    columns: 4
    rows: 4
    widgets:
      # Badges
      - extension: github
        widget: RepoBadge
        repository: facebook/react
        x: 0
        y: 0
        columns: 1
        rows: 1

      - extension: github
        widget: UserBadge
        user: torvalds
        x: 1
        y: 0
        columns: 1
        rows: 1

      - extension: github
        widget: OrgBadge
        organization: vercel
        x: 2
        y: 0
        columns: 1
        rows: 1

      - extension: github
        widget: Status
        x: 3
        y: 0
        columns: 1
        rows: 1

      # Repository Data
      - extension: github
        widget: PullRequests
        repository: vercel/next.js
        state: open
        x: 0
        y: 1
        columns: 2
        rows: 1

      - extension: github
        widget: Branches
        repository: nodejs/node
        x: 2
        y: 1
        columns: 2
        rows: 1

      # Charts
      - extension: github
        widget: CommitActivityLine
        repository: microsoft/vscode
        x: 0
        y: 2
        columns: 2
        rows: 1

      - extension: github
        widget: ContributorsStats
        repository: facebook/react
        x: 2
        y: 2
        columns: 2
        rows: 1

      # Contribution Heatmap
      - extension: github
        widget: Gitmap
        user: torvalds
        x: 0
        y: 3
        columns: 4
        rows: 1
```

## TypeScript Configuration Example

```ts
import type { DashfyConfig } from '@dashfy/types'

const config: DashfyConfig = {
  dashboards: [
    {
      title: 'GitHub Dashboard',
      columns: 3,
      rows: 2,
      widgets: [
        {
          extension: 'github',
          widget: 'RepoBadge',
          repository: 'facebook/react',
          x: 0,
          y: 0,
          columns: 1,
          rows: 1,
        },
        {
          extension: 'github',
          widget: 'PullRequests',
          repository: 'vercel/next.js',
          state: 'open',
          x: 1,
          y: 0,
          columns: 2,
          rows: 1,
        },
        {
          extension: 'github',
          widget: 'Gitmap',
          user: 'torvalds',
          x: 0,
          y: 1,
          columns: 3,
          rows: 1,
        },
      ],
    },
  ],
}

export default config
```

## API Rate Limits

GitHub API has rate limits that vary based on authentication:

| Authentication | Rate Limit          |
| -------------- | ------------------- |
| No token       | 60 requests/hour    |
| With token     | 5,000 requests/hour |

**Recommendations:**

- Always use a personal access token in production
- Monitor rate limit usage in the Dashfy console panel
- Consider caching strategies for high-frequency dashboards

## Troubleshooting

### "API rate limit exceeded"

**Solution:** Add a GitHub personal access token to your configuration.

### "Resource not accessible by integration"

**Solution:** Ensure your token has the required scopes (e.g., `repo` for private repositories).

### Traffic widgets showing errors

**Solution:** Traffic data requires push access to the repository. Ensure your token has the necessary permissions.

### Contribution heatmap not loading

**Solution:** The Gitmap widget uses a third-party API ([github-contributions-api](https://github.com/grubersjoe/github-contributions-api)) which may have its own rate limits.

## Contributing

Contributions are welcome! Please refer to the main [Dashfy contributing guide](https://github.com/dashfy/dashfy/blob/main/CONTRIBUTING.md).

## Related Packages

- [`@dashfy/server`](https://www.npmjs.com/package/@dashfy/server) - Dashfy server
- [`@dashfy/ui`](https://www.npmjs.com/package/@dashfy/ui) - Dashfy UI components
- [`@dashfy/types`](https://www.npmjs.com/package/@dashfy/types) - Dashfy TypeScript types
- [`@dashfy/ext-json`](https://www.npmjs.com/package/@dashfy/ext-json) - JSON/REST API extension

## License

MIT © [Breno Polanski](https://github.com/brenopolanski)

---

Part of the [Dashfy](https://github.com/dashfy/dashfy) project.
