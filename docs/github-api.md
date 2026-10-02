# GitHub REST API

- **What:** public repository list for the home page project grid.
- **Base URL:** `https://api.github.com/users/<github_username>/repos`
- **Auth:** none (public read-only data).
- **Called from:** `assets/js/projects-github.js`, in the visitor's browser.
- **Triggers:** each page load that contains `#github-projects`.
- **Limits:** 60 unauthenticated requests/hour per visitor IP.
- **Caching:** none.
- **Failure:** an error message is rendered in place of the list (rate limit or network error).
