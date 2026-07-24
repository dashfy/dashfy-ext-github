# @getdashfy/ext-github

## 0.1.0

### Initial Release

First public release of the Dashfy GitHub extension — widgets and a data client for visualizing GitHub repositories, users, organizations, and activity in a Dashfy dashboard.

- **GitHub API client** (`createGitHubClient`) with optional token authentication, configurable `baseUrl` (GitHub Enterprise) and request `timeout`.
- **Badge widgets**: `RepoBadge`, `UserBadge`, `OrgBadge`.
- **Repository widgets**: `Branches`, `PullRequests`.
- **Charts & analytics**: `CommitActivityLine`, `ContributorsStats`, `TrafficViewsHistogram`, `TrafficClonesHistogram`.
- **Contribution heatmap**: `Gitmap`.
- **System status**: `Status`.
- Real-time updates via WebSocket subscriptions and full Dashfy theme (light/dark) support.
