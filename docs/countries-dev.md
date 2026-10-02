# countries.dev

- **What:** free country and city facts API built on GeoNames data. https://countries.dev/
- **Base URL:** `https://countries.dev` (`/name/<country>`, `/cities?q=<city>`)
- **Auth:** none; no per-key quotas. Stated as free for production use.
- **Called from:** `assets/js/travel-about.js`, in the visitor's browser.
- **Triggers:** opening the About panel of a travel page; one country request per card plus city lookups for time zones.
- **Caching:** none beyond the browser's HTTP cache.
- **Failure:** the card falls back to the trip's own "Good to know" info from `_data/travels/about/`.
- **Licence:** GeoNames data is CC BY 4.0, credited in `_includes/travel-credits.html`.
- **Quirks:** the city search parameter is `q`, not `name`; city names collide across countries, and some small towns are missing (the code has an IANA-zone override for those).
