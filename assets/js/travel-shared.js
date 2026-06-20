// Shared constants and helpers used by travel-weather.js, travel-today.js,
// and travel-day-order.js. Loaded first by the travel layout so all three
// scripts can reference window.TravelShared without duplicating these definitions.

window.TravelShared = (function () {
  // WMO weather code data is injected from _data/wmo_codes.yml by the travel
  // layout as window.WMO_CODES. These helpers read from that object.
  function wmoDescription(code) {
    return (window.WMO_CODES && window.WMO_CODES[code]) ? window.WMO_CODES[code].description : "—";
  }

  function wmoEmoji(code) {
    return (window.WMO_CODES && window.WMO_CODES[code]) ? window.WMO_CODES[code].emoji : "🌡️";
  }

  // Fallback AQI bands used when window.AQI_BANDS (injected from
  // _data/aqi_bands.yml by the travel layout) is not available.
  var FALLBACK_AQI_BANDS = [
    { max: 20, label: "Good", emoji: "🟢" },
    { max: 40, label: "Fair", emoji: "🟡" },
    { max: 60, label: "Moderate", emoji: "🟠" },
    { max: 80, label: "Poor", emoji: "🔴" },
    { max: 100, label: "Very Poor", emoji: "🟣" },
    { max: Infinity, label: "Extremely Poor", emoji: "⚫" }
  ];

  function extractTime(isoString) {
    if (!isoString) return null;
    var idx = isoString.indexOf("T");
    return idx >= 0 ? isoString.slice(idx + 1) : isoString;
  }

  function aqiCategory(value) {
    if (value === null || value === undefined) return null;
    var bands = (typeof window !== "undefined" && window.AQI_BANDS && window.AQI_BANDS.length)
      ? window.AQI_BANDS
      : FALLBACK_AQI_BANDS;
    for (var i = 0; i < bands.length; i++) {
      if (value <= bands[i].max) return { label: bands[i].label, emoji: bands[i].emoji };
    }
    return bands[bands.length - 1];
  }

  // Condition note for a forecast card (daily hi/lo context).
  // Text strings sourced from _data/condition_notes.yml via window.CONDITION_NOTES.
  function forecastNote(code, hi, lo, rain) {
    var notes = window.CONDITION_NOTES && window.CONDITION_NOTES.forecast;
    var cond = notes && notes.condition;

    var condNote = !cond ? "" :
      (code === 0 || code === 1) ? cond.clear :
      code === 2 ? cond.partly_cloudy :
      code === 3 ? cond.overcast :
      (code === 45 || code === 48) ? cond.fog :
      ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) ? cond.rain :
      ((code >= 71 && code <= 77) || code === 85 || code === 86) ? cond.snow :
      (code === 95 || code === 96 || code === 99) ? cond.thunderstorm :
      cond.unknown;

    var temp = notes && notes.temp;
    var tempNote = !temp ? "" :
      hi <= 5 ? temp.very_cold :
      hi <= 12 ? temp.cold :
      hi >= 30 ? temp.hot :
      hi >= 25 ? temp.warm : "";

    var rainNote = "";
    if (notes && rain !== null && rain >= 50 && !(code >= 51)) {
      rainNote = notes.rain_chance.replace("{rain}", rain);
    }

    return condNote + tempNote + rainNote;
  }

  // Condition note for the "right now" today section (live conditions context).
  // Text strings sourced from _data/condition_notes.yml via window.CONDITION_NOTES.
  function currentNote(code, temp, wind) {
    var notes = window.CONDITION_NOTES && window.CONDITION_NOTES.current;
    if (!notes) return "";
    if (code === 95 || code === 96 || code === 99) return notes.thunderstorm;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return notes.rain;
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return notes.snow;
    if (temp <= 5) return notes.cold;
    if (temp >= 30) return notes.hot;
    if (wind !== null && wind >= 35) return notes.windy;
    return notes.good;
  }

  function daysFromToday(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + "T00:00:00");
    return Math.round((target - today) / 86400000);
  }

  return {
    wmoDescription: wmoDescription,
    wmoEmoji: wmoEmoji,
    FALLBACK_AQI_BANDS: FALLBACK_AQI_BANDS,
    extractTime: extractTime,
    aqiCategory: aqiCategory,
    forecastNote: forecastNote,
    currentNote: currentNote,
    daysFromToday: daysFromToday
  };
})();