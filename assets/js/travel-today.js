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

  // Kept in sync with _data/flags.yml — add an entry here too if a new
  // country shows up in a trip's data file.
  var COUNTRY_FLAGS = {
    "Germany": "🇩🇪", "Singapore": "🇸🇬", "Philippines": "🇵🇭",
    "Estonia": "🇪🇪", "Hungary": "🇭🇺", "Morocco": "🇲🇦", "Spain": "🇪🇸",
    "Switzerland": "🇨🇭", "Liechtenstein": "🇱🇮", "Austria": "🇦🇹",
    "Italy": "🇮🇹", "Malta": "🇲🇹", "France": "🇫🇷", "Monaco": "🇲🇨"
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

  function todayDateStr() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function quickNote(code, temp, wind) {
    if (code === 95 || code === 96 || code === 99) return "Thunderstorms right now — best to head indoors.";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Raining right now — grab a jacket or umbrella.";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Snowing right now — dress warmly.";
    if (temp <= 5) return "Quite cold right now — bundle up.";
    if (temp >= 30) return "Quite hot right now — stay hydrated.";
    if (wind !== null && wind >= 35) return "Windy right now — secure loose items.";
    return "Good conditions right now.";
  }

  function extractTime(isoString) {
    if (!isoString) return null;
    var idx = isoString.indexOf("T");
    return idx >= 0 ? isoString.slice(idx + 1) : isoString;
  }

  function renderLocation(container, name, country, data) {
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
    var localTime = extractTime(current.time);

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

    var emoji = WMO_EMOJI[code] || "🌡️";
    var desc = WMO_DESCRIPTIONS[code] || "—";

    var line1 = emoji + " " + desc + " · " + temp + "°C";
    if (feels !== null && feels !== temp) line1 += " (feels " + feels + "°C)";

    var line2parts = [];
    if (humidity !== null) line2parts.push("💧 " + humidity + "%");
    if (wind !== null) line2parts.push("💨 " + wind + " km/h");
    if (localTime) line2parts.push("🕐 " + localTime + " local");
    if (current.is_day !== undefined && current.is_day !== null) {
      line2parts.push(current.is_day === 1 ? "☀️ Daytime" : "🌙 Nighttime");
    }

    var note = quickNote(code, temp, wind);

    var flag = COUNTRY_FLAGS[country];
    var nameLabel = (flag ? flag + " " : "") + name + (country ? ", " + country : "");
    var html = "<strong>" + nameLabel + "</strong>";
    html += "<div class=\"today-widget\">" + line1 + "</div>";
    if (line2parts.length) html += "<div class=\"today-widget\">" + line2parts.join(" · ") + "</div>";
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
      if (!lat || !lon || Number(lat) === 0) return;

      var url = "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + encodeURIComponent(lat) +
        "&longitude=" + encodeURIComponent(lon) +
        "&current_weather=true" +
        "&hourly=apparent_temperature,relative_humidity_2m" +
        "&timezone=auto" +
        "&start_date=" + today +
        "&end_date=" + today;

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("Current weather request failed");
          return res.json();
        })
        .then(function (data) {
          renderLocation(listEl, name, country, data);
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
