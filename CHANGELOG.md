# @getdashfy/ext-github

## 0.2.0

### Minor Changes

- Require @getdashfy/ui ^0.3.1 and align @getdashfy/types dev dependency.

## 0.1.1

### Patch Changes

- Register `TrafficViewsHistogram` and `TrafficClonesHistogram` in the extension manifest so they are discoverable by the Dashfy registry, and correct the documented default widget titles for `UserBadge`, `Status` and the traffic charts.

- [`db81c40`](https://github.com/dashfy/dashfy-ext-github/commit/db81c405455d3b47952e9f670aeac9c5f26ba1de) Thanks [@brenopolanski](https://github.com/brenopolanski)! - Register `TrafficViewsHistogram` and `TrafficClonesHistogram` in the extension manifest so they are discoverable by the Dashfy registry, and correct the documented default widget titles for `UserBadge`, `Status` and the traffic charts.

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
