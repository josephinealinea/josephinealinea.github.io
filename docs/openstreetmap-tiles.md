# OpenStreetMap tiles

- **What:** raster map tiles for the Leaflet trip maps.
- **URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Auth:** none. Follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- **Called from:** `assets/js/travel-map.js` (Leaflet).
- **Triggers:** a map being shown; tiles load as the visitor pans and zooms (scroll-wheel zoom is off).
- **Caching:** browser HTTP cache only.
- **Failure:** the map shows a blank grey background with markers still drawn.
- **Quirks:** the policy requires a valid Referer, so do not set `Referrer-Policy: no-referrer`. Heavy or bulk use is forbidden. Attribution (© OpenStreetMap contributors) must stay visible; it is set in the tile layer options and repeated in the page credits.
