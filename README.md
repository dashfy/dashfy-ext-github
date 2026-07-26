# `@getdashfy/ext-github`

![Full README Row](https://shieldcn.dev/group/npm/@getdashfy/ext-github+github/stars/dashfy/dashfy-ext-github+github/ci/dashfy/dashfy-ext-github+github/license/dashfy/dashfy-ext-github.svg?variant=branded&size=xs)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/dashfy?referralCode=INMsTa&utm_medium=integration&utm_source=template&utm_campaign=generic)

> GitHub extension for [Dashfy](https://github.com/dashfy/dashfy) - Display GitHub data with beautiful widgets and charts.

This extension provides widgets to visualize GitHub repositories, users, organizations, pull requests, branches, contributions, and more.

![](./preview/dashfy-ext-github.png)

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

Install with your favorite package manager:

#### `npm`

```bash
npm install @getdashfy/ext-github
```

#### `pnpm`

```bash
pnpm add @getdashfy/ext-github
```

#### `yarn`

```bash
yarn add @getdashfy/ext-github
```

#### `bun`

```bash
bun add @getdashfy/ext-github
```

## Quick start

### 1. Server setup

Register the GitHub API client in your Dashfy server (`dashfy.server.ts`):

```ts
import { Dashfy } from '@getdashfy/server'
import { createGitHubClient } from '@getdashfy/ext-github/client'

// Create a new Dashfy server instance
const dashfy = new Dashfy()

// Load dashboard configuration
await dashfy.configureFromFile('./dashfy.config.yml')

// Register GitHub API
// Get your token at: https://github.com/settings/tokens
// Set it with: export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx in .env file
dashfy.registerApi(
  'github',
  createGitHubClient({
    token: process.env.GITHUB_TOKEN!, // Optional but recommended
  }),
)

// Start server
await dashfy.start()
```

### 2. Client setup

Register GitHub widgets in your React application (`App.tsx`):

```tsx
import { WidgetRegistry } from '@getdashfy/ui'
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
} from '@getdashfy/ext-github'

// Register GitHub extension
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

### 3. Dashboard configuration

Add GitHub widgets to your dashboard configuration (`dashfy.config.yml`):

```yaml
dashboards:
  - title: GitHub Dashboard
    columns: 3
    rows: 2
    widgets:
      - extension: github
        widget: RepoBadge
        repository: react/react
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

## GitHub API configuration

### Authentication

While authentication is optional, it's **highly recommended** to provide a GitHub personal access token to:

- Access private repositories
- Increase API rate limits (5,000 requests/hour vs 60 requests/hour)
- Access traffic data (requires push access)

#### Creating a personal access token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes based on your needs:
   - `public_repo` - Access public repositories
   - `repo` - Access private repositories
   - `read:org` - Read organization data
4. Copy the generated token

#### Configuration options

```ts
createGitHubClient({
  // GitHub API base URL (useful for GitHub Enterprise)
  baseUrl: 'https://api.github.com', // default

  // Personal access token for authentication
  token: process.env.GITHUB_TOKEN!,

  // Request timeout in milliseconds
  timeout: 10_000, // default
})
```

#### Environment variables

You can use environment variables for configuration:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

```ts
createGitHubClient({
  token: process.env.GITHUB_TOKEN!,
})
```

### GitHub enterprise

To use with GitHub Enterprise, set the `baseUrl`:

```ts
createGitHubClient({
  baseUrl: 'https://github.company.com/api/v3',
  token: process.env.GITHUB_ENTERPRISE_TOKEN!,
})
```

## Available widgets

### Badges

#### `RepoBadge`

Display repository information with stats (stars, forks, issues).

<img src="./preview/github.RepoBadge.png" alt="RepoBadge widget preview" width="320" />

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
  repository: react/react
  title: React Repository
  columns: 1
  rows: 1
```

#### `UserBadge`

Display GitHub user profile information.

<img src="./preview/github.UserBadge.png" alt="UserBadge widget preview" width="320" />

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

<img src="./preview/github.OrgBadge.png" alt="OrgBadge widget preview" width="320" />

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

### Repository data

#### `Branches`

Display repository branches with commit authors and dates.

<img src="./preview/github.Branches.png" alt="Branches widget preview" width="640" />

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

<img src="./preview/github.PullRequests.png" alt="PullRequests widget preview" width="640" />

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
  repository: react/react
  state: open
  columns: 2
  rows: 1
```

### Charts & Analytics

#### `CommitActivityLine`

Display commit activity over the last year as a line chart.

<img src="./preview/github.CommitActivityLine.png" alt="CommitActivityLine widget preview" width="640" />

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

<img src="./preview/github.ContributorsStats.png" alt="ContributorsStats widget preview" width="640" />

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
  repository: vercel/next.js
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

### User data

#### `Gitmap`

Display GitHub contribution heatmap (similar to GitHub's contribution graph).

<img src="./preview/github.Gitmap.png" alt="Gitmap widget preview" width="640" />

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

### System status

#### `Status`

Display GitHub's current system status.

<img src="./preview/github.Status.png" alt="Status widget preview" width="640" />

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

## API rate limits

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

Contributions are welcome. For issues and pull requests related to the extension, use the [dashfy/dashfy-ext-github](https://github.com/dashfy/dashfy-ext-github) repository. Framework contributions belong in [dashfy/dashfy](https://github.com/dashfy/dashfy).

## Community

Join the community on [Dashfy's Discord server](https://dashfy.dev/discord) to discuss the project, ask questions, or get help.

Join the conversation on X (Twitter) and follow [@dashfydev](https://x.com/dashfydev) for updates and announcements.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  <picture>
    <source srcset="./public/brand/dashfy-wordmark-black.png" media="(prefers-color-scheme: light)">
    <source srcset="./public/brand/dashfy-wordmark-white.png" media="(prefers-color-scheme: dark)">
    <img src="./public/brand/dashfy-wordmark-black.png" alt="Header banner">
  </picture>
</p>

**For AI/LLM agents:** [https://dashfy.dev/llms.txt](https://dashfy.dev/llms.txt)
