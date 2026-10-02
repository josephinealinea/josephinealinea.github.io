# Third-party notices

Third-party material used by this site. The site's own code is MIT licensed (see `LICENSE`).
No third-party material below has been modified.

## Runtime libraries (loaded from jsDelivr CDN on `/travel/` pages)

| Item | Used in | Copyright | Licence | Source |
|---|---|---|---|---|
| Leaflet 1.9.4 | Trip maps (`assets/js/travel-map.js`, `travel-about.js`) | © 2010-2023 Volodymyr Agafonkin; © 2010-2011 CloudMade | [BSD-2-Clause](https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE) | https://github.com/Leaflet/Leaflet |
| Chart.js 4.5.1 | Budget charts (`assets/js/travel-budget.js`) | © 2014-2024 Chart.js Contributors | [MIT](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md) | https://github.com/chartjs/Chart.js |

Because both are served unmodified from the CDN with their licence headers intact, the notices above travel with the code.

## Build-time Ruby gems (Jekyll toolchain)

| Item | Copyright | Licence | Notes |
|---|---|---|---|
| Jekyll 4.x | © 2008-present Tom Preston-Werner, Jekyll contributors | [MIT](https://github.com/jekyll/jekyll/blob/master/LICENSE) | Static site generator |
| Minima 2.5 | © 2016-present Parker Moore and minima contributors | [MIT](https://github.com/jekyll/minima/blob/master/LICENSE.txt) | Base theme; its Sass is compiled into `main.css` and the theme stylesheets, so this notice is required |
| jekyll-feed | © 2016-present GitHub, Inc. | [MIT](https://github.com/jekyll/jekyll-feed/blob/master/LICENSE.txt) | Generates the Atom feed |
| jekyll-seo-tag | © 2015-present GitHub, Inc. | [MIT](https://github.com/jekyll/jekyll-seo-tag/blob/master/LICENSE.txt) | `{% seo %}` tag in `_includes/head.html` |
| webrick | © Ruby contributors | [Ruby / BSD-2-Clause](https://github.com/ruby/webrick/blob/master/LICENSE.txt) | Local dev server only, not shipped |

## Data and web services

| Service | Used in | Licence / terms | Credit shown |
|---|---|---|---|
| [Open-Meteo](https://open-meteo.com/) forecast, archive and air-quality APIs | `assets/js/travel-weather.js`, `travel-today.js` | Data [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); free API is for [non-commercial use](https://open-meteo.com/en/terms) only. This site earns no money, so it qualifies. Re-check if that changes. | Travel pages (`_includes/travel-credits.html`) |
| [GeoNames](https://www.geonames.org/) data via [countries.dev](https://countries.dev/) | `assets/js/travel-about.js` | Data [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); countries.dev states it is free for production use with no key | Travel pages |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) map tiles | `assets/js/travel-map.js` | Data © OpenStreetMap contributors, [ODbL](https://opendatacommons.org/licenses/odbl/); [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) applies | Travel pages and Leaflet's on-map attribution |
| [GitHub REST API](https://docs.github.com/en/rest) | `assets/js/projects-github.js` | [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service); unauthenticated, 60 requests/hour per IP | Not required |
| [Ko-fi](https://ko-fi.com/) support button image | `_includes/sections/contact.md`, `_layouts/post.html` | Official button hotlinked from Ko-fi as intended | Not required |
| [Formspree](https://formspree.io/) | `_includes/sections/contact.md` | [Formspree Terms](https://formspree.io/terms-of-service); free plan, 50 submissions/month | Disclosed in `/privacy/` |
| [Google Analytics](https://marketingplatform.google.com/about/analytics/) | `_includes/consent.html` | [Google Analytics Terms](https://marketingplatform.google.com/about/analytics/terms/us/); loaded only after cookie consent | Disclosed in `/privacy/` |

Per-service integration details are in `docs/`.

## Images and fonts

- `assets/img/avatar*.png`, `me.jpg` and the favicons are the site owner's own work.
- The Expertise section lists technology names as text from `_data/skills.yml`, each optionally linking to its official site. Product names remain trademarks of their owners and are used only to name technologies used. No logos are shipped.
- No web fonts are loaded; themes use system font stacks. Emoji render with the visitor's system fonts.
