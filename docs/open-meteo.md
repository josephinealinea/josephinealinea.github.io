# Open-Meteo

- **What:** free weather, historical weather and air-quality APIs. https://open-meteo.com/en/docs
- **Base URLs:** `https://api.open-meteo.com/v1/forecast`, `https://archive-api.open-meteo.com/v1/archive`, `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Auth:** none (no key).
- **Called from:** `assets/js/travel-weather.js` (location cards) and `travel-today.js`, in the visitor's browser.
- **Triggers:** loading a `/travel/<trip>/` page; one request per location (forecast for upcoming days, archive for past dates, air quality for today).
- **Frequency / limits:** free tier is non-commercial, under 10,000 calls/day. Traffic here is a few calls per visitor.
- **Caching:** last good result per location is kept in `localStorage` and shown if the API fails.
- **Failure:** the widget falls back to the cached snapshot, otherwise shows no weather.
- **Licence:** data CC BY 4.0, credit shown in `_includes/travel-credits.html`. The free tier forbids commercial use; revisit if the site ever earns money (affiliate links, paid services).
- **Quirks:** weather codes are WMO codes; their labels and emoji live in `_data/travels/wmo_codes.yml`, AQI bands in `aqi_bands.yml`.
