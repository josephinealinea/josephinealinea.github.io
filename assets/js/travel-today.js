// Populates the #today-section block on a /travel/<trip>/ page: if one of
// the trip's days matches the visitor's current date, show current-hour
// conditions (not a forecast) for every city planned that day.
//
// Per request: no sunrise/sunset or daily low/high here — just "right now"
// info. Fields shown per city:
//   - Current temperature (and "feels like" apparent temperature)
//   - Current condition + emoji
//   - Wind speed
//   - Humidity
//   - Local time at that city (each city can be in a different timezone)
//   - A short practical note (e.g. "bring a layer", "stay hydrated")
//
// These are good candidates because they answer "what do I need to know if
// I stepped outside right now," which a daily high/low doesn't.
//
// WMO weather codes are loaded from _data/wmo_codes.yml via window.WMO_CODES
// (injected by the travel layout). Other shared helpers (extractTime,
// aqiCategory, wmoDescription, wmoEmoji) live in travel-shared.js, which is
// loaded before this file. Country flag emojis are read from the data-flag
// attribute on each .location-card, set by the travel layout from _data/flags.yml.

(function () {
  function todayDateStr() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function renderLocation(container, name, country, flag, data, aqi) {
    var card = document.createElement("div");
    card.className = "today-location-card";

    var current = data.current_weather;
    if (!current) {
      card.innerHTML = "<strong>" + name + "</strong><div class=\"today-widget\">Current conditions unavailable.</div>";
      container.appendChild(card);
      return;
    }

    var code = current.weathercode;
    var temp = Math.round(current.temperature);
    var wind = current.windspeed != null ? Math.round(current.windspeed) : null;
    var localTime = TravelShared.extractTime(current.time);

    var feels = null;
    var humidity = null;
    if (data.hourly && data.hourly.time) {
      var idx = data.hourly.time.indexOf(current.time);
      if (idx === -1) {
        // Open-Meteo sometimes rounds current_weather.time to the nearest
        // quarter-hour while hourly.time is on the hour — fall back to a
        // prefix match on "YYYY-MM-DDTHH".
        var hourPrefix = current.time.slice(0, 13);
        idx = data.hourly.time.findIndex(function (t) { return t.indexOf(hourPrefix) === 0; });
      }
      if (idx !== -1) {
        if (data.hourly.apparent_temperature) feels = Math.round(data.hourly.apparent_temperature[idx]);
        if (data.hourly.relative_humidity_2m) humidity = data.hourly.relative_humidity_2m[idx];
      }
    }

    var emoji = TravelShared.wmoEmoji(code);
    var desc = TravelShared.wmoDescription(code);

    var line1 = emoji + " " + desc + " · " + temp + "°C";
    if (feels !== null && feels !== temp) line1 += " (feels " + feels + "°C)";

    var line2parts = [];
    if (humidity !== null) line2parts.push("💧 " + humidity + "%");
    if (wind !== null) line2parts.push("💨 " + wind + " km/h");
    if (localTime) line2parts.push("🕐 " + localTime + " local");
    if (current.is_day !== undefined && current.is_day !== null) {
      line2parts.push(current.is_day === 1 ? "☀️ Daytime" : "🌙 Nighttime");
    }

    var note = TravelShared.currentNote(code, temp, wind);

    var aqiCat = TravelShared.aqiCategory(aqi);

    var html = "<div class=\"today-card-header\">"
             + "<strong>" + (flag ? flag + " " : "") + name + "</strong>"
             + (country ? "<span class=\"today-country\">, " + country + "</span>" : "")
             + "</div>";
    html += "<div class=\"today-widget\">" + line1 + "</div>";
    if (line2parts.length) html += "<div class=\"today-widget\">" + line2parts.join(" · ") + "</div>";
    if (aqiCat) html += "<div class=\"today-widget\">" + aqiCat.emoji + " Air quality: " + aqiCat.label + " (AQI " + aqi + ")</div>";
    html += "<div class=\"today-note\">" + note + "</div>";
    card.innerHTML = html;
    container.appendChild(card);
  }

  function loadToday() {
    var section = document.getElementById("today-section");
    if (!section) return;

    var today = todayDateStr();
    var todayDay = document.querySelector('.trip-day[data-date="' + today + '"]');
    if (!todayDay) return; // trip hasn't started yet, or no day matches today

    var cards = todayDay.querySelectorAll(".location-card");
    if (!cards.length) return;

    var listEl = section.querySelector(".today-locations");
    section.style.display = "";

    cards.forEach(function (card) {
      var lat = card.getAttribute("data-lat");
      var lon = card.getAttribute("data-lon");
      var name = card.getAttribute("data-name") || "—";
      var country = card.getAttribute("data-country") || "";
      var flag = card.getAttribute("data-flag") || "";
      if (!lat || !lon || Number(lat) === 0) return;

      var url = "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + encodeURIComponent(lat) +
        "&longitude=" + encodeURIComponent(lon) +
        "&current_weather=true" +
        "&hourly=apparent_temperature,relative_humidity_2m" +
        "&timezone=auto" +
        "&start_date=" + today +
        "&end_date=" + today;

      var aqiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality" +
        "?latitude=" + encodeURIComponent(lat) +
        "&longitude=" + encodeURIComponent(lon) +
        "&current=european_aqi" +
        "&timezone=auto";

      // Air quality forecasts have a shorter window than regular weather, so
      // a failure here just means no AQI line — it shouldn't block the rest
      // of the "right now" card from rendering.
      var aqiPromise = fetch(aqiUrl)
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          return data && data.current ? data.current.european_aqi : null;
        })
        .catch(function () { return null; });

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("Current weather request failed");
          return res.json();
        })
        .then(function (data) {
          return aqiPromise.then(function (aqi) {
            renderLocation(listEl, name, country, flag, data, aqi);
          });
        })
        .catch(function () {
          var card2 = document.createElement("div");
          card2.className = "today-location-card";
          card2.innerHTML = "<strong>" + name + "</strong><div class=\"today-widget\">Couldn't load current conditions.</div>";
          listEl.appendChild(card2);
        });
    });
  }

  document.addEventListener("DOMContentLoaded", loadToday);
})();