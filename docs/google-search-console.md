# Google Search Console

- **What:** Google's tool for seeing how the site is indexed. https://search.google.com/search-console
- **Property:** Domain property `josephinealinea.dev`.
- **Auth / verification:** DNS TXT record at the DNS provider: Type `TXT`, Name `@`, value `google-site-verification=...` (the value comes from Search Console). Keep the record in place, or verification lapses. Keep the existing GitHub Pages `A` and `CNAME` records.
- **Called from:** nothing in the repo calls it; Google crawls the site. No visitor data is collected by the site for this.
- **Sitemap:** `https://josephinealinea.dev/sitemap.xml`, generated at build time by `jekyll-sitemap` and listed in `robots.txt`. Submit it once under Indexing, Sitemaps; Google re-reads it on its own.
- **Indexing requests:** done by hand with URL Inspection, Request indexing, for a few key pages. Limited to a handful per day.
- **Custom domain:** GitHub Settings, Pages: custom domain `josephinealinea.dev`, Enforce HTTPS on. `CNAME` in the repo root must match. `url` in `_config.yml` must also be `https://josephinealinea.dev`, or canonical and Open Graph URLs point at the wrong host.
- **Failure:** if the TXT record is removed the property becomes unverified; a missing or erroring sitemap shows as "Couldn't fetch" under Sitemaps.
- **Quirks:** HTTPS enforcement can stay greyed out for a while after DNS changes. Pages excluded from the sitemap use `sitemap: false` in their front matter.
