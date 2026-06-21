// Fetches live weather for each .location-card on a /travel/<trip>/ page.
// Data source: Open-Meteo (no API key required).
// - Dates within the next 16 days (including today): live forecast fetched
//   on every page load, and the result is snapshotted to localStorage.
// - Dates more than 16 days out: shown as "forecast not open yet", no API call.
// - Past dates: fetches actual weather from the Open-Meteo Historical Archive
//   API (archive-api.open-meteo.com). Falls back to the last localStorage
//   snapshot if the archive has no data yet (the archive typically lags ~5
//   days behind today), then shows "no data" if no snapshot exists either.
//
// Note: localStorage snapshots from live forecast runs are kept as a fallback
// and are browser-local — they aren't shared across devices.
//
// WMO weather codes are loaded from _data/wmo_codes.yml via window.WMO_CODES.
// Condition note text is loaded from _data/condition_notes.yml via window.CONDITION_NOTES.
// Both are injected by the travel layout. Shared helpers (extractTime, aqiCategory,
// daysFromToday, wmoDescription, wmoEmoji, forecastNote) live in travel-shared.js,
// which is loaded before this file.

(function () {
  function averageAqi(hourlyAqi) {
    if (!hourlyAqi || !hourlyAqi.length) return null;
    var sum = 0, count = 0;
    hourlyAqi.forEach(function (v) {
      if (v !== null && v !== undefined) { sum += v; count++; }
    });
    return count ? Math.round(sum / count) : null;
  }

  function renderMessage(el, text) {
    el.innerHTML = "<div class=\"weather-line\">" + text + "</div>";
  }

  // Builds the same markup renderForecast would, but from a plain snapshot
  // object instead of the raw Open-Meteo "daily" arrays, and tags it with a
  // "Last recorded" label so it's clear this isn't a fresh fetch.
  function renderSnapshot(el, snap, labelPrefix) {
    var emoji = TravelShared.wmoEmoji(snap.code);
    var desc = TravelShared.wmoDescription(snap.code);

    var line1 = emoji + " " + desc + " · " + snap.lo + "°-" + snap.hi + "°C";
    if (snap.rain !== null && snap.rain !== undefined) line1 += " · " + snap.rain + "% rain";

    var line2 = "";
    if (snap.sunrise && snap.sunset) {
      line2 = "🌅 " + snap.sunrise + " · 🌇 " + snap.sunset;
    }

    var aqiLine = "";
    var aqiCat = TravelShared.aqiCategory(snap.aqi);
    if (aqiCat) {
      aqiLine = aqiCat.emoji + " Air quality: " + aqiCat.label + " (AQI " + snap.aqi + ")";
    }

    var html = "<div class=\"weather-line weather-recorded-label\">" + labelPrefix + "</div>";
    html += "<div class=\"weather-line\">" + line1 + "</div>";
    if (line2) html += "<div class=\"weather-line weather-sun\">" + line2 + "</div>";
    if (aqiLine) html += "<div class=\"weather-line weather-aqi\">" + aqiLine + "</div>";
    html += "<div class=\"weather-note\">" + snap.note + "</div>";
    el.innerHTML = html;
  }

  function snapshotKey(date, lat, lon) {
    return "travel-weather:" + date + ":" + lat + ":" + lon;
  }

  function saveSnapshot(date, lat, lon, snap) {
    try {
      localStorage.setItem(snapshotKey(date, lat, lon), JSON.stringify(snap));
    } catch (e) {
      // localStorage unavailable (private mode, quota, etc.) — fine to skip.
    }
  }

  function loadSnapshot(date, lat, lon) {
    try {
      var raw = localStorage.getItem(snapshotKey(date, lat, lon));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function renderForecast(el, daily, date, lat, lon, aqi) {
    if (!daily || !daily.time || daily.time.length === 0) {
      renderMessage(el, "Forecast unavailable for this date.");
      return;
    }
    var code = daily.weathercode[0];
    var hi = Math.round(daily.temperature_2m_max[0]);
    var lo = Math.round(daily.temperature_2m_min[0]);
    var rain = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : null;
    var sunrise = daily.sunrise ? TravelShared.extractTime(daily.sunrise[0]) : null;
    var sunset = daily.sunset ? TravelShared.extractTime(daily.sunset[0]) : null;
    var emoji = TravelShared.wmoEmoji(code);
    var desc = TravelShared.wmoDescription(code);

    var line1 = emoji + " " + desc + " · " + lo + "°-" + hi + "°C";
    if (rain !== null) line1 += " · " + rain + "% rain";

    var line2 = "";
    if (sunrise && sunset) {
      line2 = "🌅 " + sunrise + " · 🌇 " + sunset;
    }

    var aqiLine = "";
    var aqiCat = TravelShared.aqiCategory(aqi);
    if (aqiCat) {
      aqiLine = aqiCat.emoji + " Air quality: " + aqiCat.label + " (AQI " + aqi + ")";
    }

    var note = TravelShared.forecastNote(code, hi, lo, rain);

    var html = "<div class=\"weather-line\">" + line1 + "</div>";
    if (line2) html += "<div class=\"weather-line weather-sun\">" + line2 + "</div>";
    if (aqiLine) html += "<div class=\"weather-line weather-aqi\">" + aqiLine + "</div>";
    html += "<div class=\"weather-note\">" + note + "</div>";
    el.innerHTML = html;

    // Freeze this result so that once the date passes, the page keeps
    // showing exactly what was last fetched instead of changing or going
    // blank.
    saveSnapshot(date, lat, lon, {
      code: code, hi: hi, lo: lo, rain: rain,
      sunrise: sunrise, sunset: sunset, note: note, aqi: aqi,
      recordedAt: new Date().toISOString()
    });
  }

  function renderHistorical(el, daily) {
    var code    = daily.weathercode[0];
    var hi      = Math.round(daily.temperature_2m_max[0]);
    var lo      = Math.round(daily.temperature_2m_min[0]);
    var precip  = (daily.precipitation_sum && daily.precipitation_sum[0] !== null)
                    ? Math.round(daily.precipitation_sum[0] * 10) / 10
                    : null;
    var sunrise = daily.sunrise ? TravelShared.extractTime(daily.sunrise[0]) : null;
    var sunset  = daily.sunset  ? TravelShared.extractTime(daily.sunset[0])  : null;
    var emoji   = TravelShared.wmoEmoji(code);
    var desc    = TravelShared.wmoDescription(code);

    var line1 = emoji + " " + desc + " · " + lo + "°-" + hi + "°C";
    if (precip !== null) line1 += " · " + precip + "mm rain";

    var line2 = (sunrise && sunset) ? "🌅 " + sunrise + " · 🌇 " + sunset : "";
    var note  = TravelShared.forecastNote(code, hi, lo, null);

    var html = "<div class=\"weather-line weather-recorded-label\">📖 Actual weather on this day</div>";
    html += "<div class=\"weather-line\">" + line1 + "</div>";
    if (line2) html += "<div class=\"weather-line weather-sun\">" + line2 + "</div>";
    if (note)  html += "<div class=\"weather-note\">" + note + "</div>";
    el.innerHTML = html;
  }

  function loadHistorical(el, date, lat, lon) {
    renderMessage(el, "Loading historical weather…");

    var url = "https://archive-api.open-meteo.com/v1/archive" +
      "?latitude="  + encodeURIComponent(lat) +
      "&longitude=" + encodeURIComponent(lon) +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset" +
      "&timezone=auto" +
      "&start_date=" + date +
      "&end_date="   + date;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Archive request failed");
        return res.json();
      })
      .then(function (data) {
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
          throw new Error("No data");
        }
        renderHistorical(el, data.daily);
      })
      .catch(function () {
        var snap = loadSnapshot(date, lat, lon);
        if (snap) {
          renderSnapshot(el, snap, "✓ Last recorded weather");
        } else {
          renderMessage(el, "✓ Trip day completed (no historical data available)");
        }
      });
  }

  function loadCard(card) {
    var weatherEl = card.querySelector(".weather-widget");
    if (!weatherEl) return;
    var date = card.getAttribute("data-date");
    var lat = card.getAttribute("data-lat");
    var lon = card.getAttribute("data-lon");
    var diff = TravelShared.daysFromToday(date);

    if (!lat || !lon || Number(lat) === 0) {
      renderMessage(weatherEl, "Add lat/lon in the data file to enable live weather.");
      return;
    }

    if (diff < 0) {
      loadHistorical(weatherEl, date, lat, lon);
      return;
    }

    if (diff > 15) {
      renderMessage(weatherEl, "📅 Forecast opens 16 days before this date");
      return;
    }

    renderMessage(weatherEl, "Checking live weather…");
    var url = "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + encodeURIComponent(lat) +
      "&longitude=" + encodeURIComponent(lon) +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,sunrise,sunset" +
      "&timezone=auto" +
      "&start_date=" + date +
      "&end_date=" + date;

    var aqiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality" +
      "?latitude=" + encodeURIComponent(lat) +
      "&longitude=" + encodeURIComponent(lon) +
      "&hourly=european_aqi" +
      "&timezone=auto" +
      "&start_date=" + date +
      "&end_date=" + date;

    // Air quality forecasts only cover a few days out (shorter window than
    // the 16-day weather forecast), so a failure here shouldn't break the
    // weather display — just fall back to no AQI line.
    var aqiPromise = fetch(aqiUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        return data && data.hourly ? averageAqi(data.hourly.european_aqi) : null;
      })
      .catch(function () { return null; });

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Weather request failed");
        return res.json();
      })
      .then(function (data) {
        return aqiPromise.then(function (aqi) {
          renderForecast(weatherEl, data.daily, date, lat, lon, aqi);
        });
      })
      .catch(function () {
        // Fall back to the last good snapshot if the live fetch fails.
        var snap = loadSnapshot(date, lat, lon);
        if (snap) {
          renderSnapshot(weatherEl, snap, "⚠️ Couldn't refresh — showing last recorded");
        } else {
          renderMessage(weatherEl, "Couldn't load live weather right now.");
        }
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cards = document.querySelectorAll(".location-card");
    cards.forEach(loadCard);
  });
})();