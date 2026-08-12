---
'@getdashfy/ext-github': patch
---

Make the `contributions` endpoint (used by the `Gitmap` widget) more resilient to failures from the public [github-contributions-api](https://github.com/grubersjoe/github-contributions-api) instance:

- Request the last year first (`?y=last`), matching what `Gitmap` renders, and fall back to full history if that request fails.
- Treat an `{ "error": "..." }` response body as a failure and retry, in addition to non-2xx responses.
- Add a `contributionsApiBaseUrl` client option to point at a self-hosted `github-contributions-api` instance.
