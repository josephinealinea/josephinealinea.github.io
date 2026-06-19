// Fetches live weather for each .location-card on a /travel/<trip>/ page.
// Data source: Open-Meteo (no API key required).
// - Dates within the next 16 days (including today): live forecast fetched
//   on every page load, and the result is snapshotted to localStorage.
// - Dates more than 16 days out: shown as "forecast not open yet", no API call.
// - Past dates: never re-fetched (Open-Meteo's free forecast endpoint can't
//   look backwards anyway). Instead we show the last snapshot that was
//   recorded while the date was still current/upcoming, so the value seen
//   on the day doesn't change afterwards. If this browser never visited the
//   page while the date was live, there's no snapshot to show.
//
// Note: snapshots live in this browser's localStorage only — they aren't
// shared across devices. A travel buddy who opens the page for the first
// time after the date has passed will see "no recorded data" unless their
// own browser had already cached it.

(function () {
  var WMO_DESCRIPTIONS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Freezing fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Freezing drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Freezing rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
    80: "Light rain showers", 81: "Rain showers", 82: "Violent rain showers",
    85: "Light snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm w/ light hail", 99: "Thunderstorm w/ heavy hail"
  };

  var WMO_EMOJI = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌧️",
    56: "🌧️", 57: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    66: "🌧️", 67: "🌧️",
    71: "🌨️", 73: "🌨️", 75: "❄️", 77: "❄️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    85: "🌨️", 86: "❄️",
    95: "⛈️", 96: "⛈️", 99: "⛈️"
  };

  // Short plain-language summary, layered: condition note + temp note.
  function summarize(code, hi, lo, rain) {
    var conditionNote;
    if (code === 0 || code === 1) {
      conditionNote = "Sunny and clear — great day to be outdoors.";
    } else if (code === 2) {
      conditionNote = "Partly cloudy, generally pleasant.";
    } else if (code === 3) {
      conditionNote = "Overcast skies, but dry.";
    } else if (code === 45 || code === 48) {
      conditionNote = "Foggy — visibility may be reduced, especially for driving.";
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      conditionNote = "Rain expected — bring a jacket or umbrella.";
    } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      conditionNote = "Snow expected — dress warmly and check road/trail conditions.";
    } else if (code === 95 || code === 96 || code === 99) {
      conditionNote = "Thunderstorms possible — plan indoor backups.";
    } else {
      conditionNote = "Check conditions closer to the day.";
    }

    var tempNote = "";
    if (hi <= 5) tempNote = " Very cold — pack heavy layers.";
    else if (hi <= 12) tempNote = " Cold — a warm coat is a good idea.";
    else if (hi >= 30) tempNote = " Hot — stay hydrated.";
    else if (hi >= 25) tempNote = " Warm — light clothing should be fine.";

    var rainNote = "";
    if (rain !== null && rain >= 50 && !(code >= 51)) {
      rainNote = " High chance of rain (" + rain + "%).";
    }

    return conditionNote + tempNote + rainNote;
  }

  function extractTime(isoString) {
    // e.g. "2026-06-23T05:42" -> "05:42"
    if (!isoString) return null;
    var idx = isoString.indexOf("T");
    return idx >= 0 ? isoString.slice(idx + 1) : isoString;
  }

  function daysFromToday(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + "T00:00:00");
    return Math.round((target - today) / 86400000);
  }

  function renderMessage(el, text) {
    el.innerHTML = "<div class=\"weather-line\">" + text + "</div>";
  }

  // Builds the same markup renderForecast would, but from a plain snapshot
  // object instead of the raw Open-Meteo "daily" arrays, and tags it with a
  // "Last recorded" label so it's clear this isn't a fresh fetch.
  function renderSnapshot(el, snap, labelPrefix) {
    var emoji = WMO_EMOJI[snap.code] || "🌡️";
    var desc = WMO_DESCRIPTIONS[snap.code] || "—";

    var line1 = emoji + " " + desc + " · " + snap.lo + "°-" + snap.hi + "°C";
    if (snap.rain !== null && snap.rain !== undefined) line1 += " · " + snap.rain + "% rain";

    var line2 = "";
    if (snap.sunrise && snap.sunset) {
      line2 = "🌅 " + snap.sunrise + " · 🌇 " + snap.sunset;
    }

    var html = "<div class=\"weather-line weather-recorded-label\">" + labelPrefix + "</div>";
    html += "<div class=\"weather-line\">" + line1 + "</div>";
    if (line2) html += "<div class=\"weather-line weather-sun\">" + line2 + "</div>";
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

  function renderForecast(el, daily, date, lat, lon) {
    if (!daily || !daily.time || daily.time.length === 0) {
      renderMessage(el, "Forecast unavailable for this date.");
      return;
    }
    var code = daily.weathercode[0];
    var hi = Math.round(daily.temperature_2m_max[0]);
    var lo = Math.round(daily.temperature_2m_min[0]);
    var rain = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : null;
    var sunrise = daily.sunrise ? extractTime(daily.sunrise[0]) : null;
    var sunset = daily.sunset ? extractTime(daily.sunset[0]) : null;
    var emoji = WMO_EMOJI[code] || "🌡️";
    var desc = WMO_DESCRIPTIONS[code] || "—";

    var line1 = emoji + " " + desc + " · " + lo + "°-" + hi + "°C";
    if (rain !== null) line1 += " · " + rain + "% rain";

    var line2 = "";
    if (sunrise && sunset) {
      line2 = "🌅 " + sunrise + " · 🌇 " + sunset;
    }

    var note = summarize(code, hi, lo, rain);

    var html = "<div class=\"weather-line\">" + line1 + "</div>";
    if (line2) html += "<div class=\"weather-line weather-sun\">" + line2 + "</div>";
    html += "<div class=\"weather-note\">" + note + "</div>";
    el.innerHTML = html;

    // Freeze this result so that once the date passes, the page keeps
    // showing exactly what was last fetched instead of changing or going
    // blank.
    saveSnapshot(date, lat, lon, {
      code: code, hi: hi, lo: lo, rain: rain,
      sunrise: sunrise, sunset: sunset, note: note,
      recordedAt: new Date().toISOString()
    });
  }

  function loadCard(card) {
    var weatherEl = card.querySelector(".weather-widget");
    if (!weatherEl) return;
    var date = card.getAttribute("data-date");
    var lat = card.getAttribute("data-lat");
    var lon = card.getAttribute("data-lon");
    var diff = daysFromToday(date);

    if (!lat || !lon || Number(lat) === 0) {
      renderMessage(weatherEl, "Add lat/lon in the data file to enable live weather.");
      return;
    }

    if (diff < 0) {
      // Date has passed — never re-fetch. Show whatever was last recorded
      // (in this browser) while the date was still current/upcoming.
      var snap = loadSnapshot(date, lat, lon);
      if (snap) {
        renderSnapshot(weatherEl, snap, "✓ Last recorded weather");
      } else {
        renderMessage(weatherEl, "✓ Trip day completed (no recorded weather)");
      }
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

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Weather request failed");
        return res.json();
      })
      .then(function (data) {
        renderForecast(weatherEl, data.daily, date, lat, lon);
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
