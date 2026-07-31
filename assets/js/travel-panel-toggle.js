// Controls which panels are visible on a /travel/<trip>/ page via two
// mutually-exclusive checkboxes: "Show all" (default) and "Show only weather
// forecast". Any future non-weather panel opts into being hidden in
// weather-only mode by adding the "optional-panel" class to its container;
// existing weather panels (#today-section, .trip-days) never get that class
// and are always shown.
//
// Initial mode priority: ?show-all=true / ?show-only-weather=true URL param >
// saved localStorage choice > default ("show-all"). Manual toggles are saved
// to localStorage and reflected in the URL (via replaceState, using whichever
// of those two params matches the active mode) so the resulting view is
// reloadable/shareable.

(function () {
  var STORAGE_KEY = "travel-panel-mode";
  var WEATHER_ONLY = "weather-only";
  var SHOW_ALL = "show-all";

  function applyMode(mode) {
    var hidden = mode === WEATHER_ONLY;
    Array.prototype.forEach.call(document.querySelectorAll(".optional-panel"), function (el) {
      el.classList.toggle("panel-hidden", hidden);
    });

    var weatherOnlyBox = document.getElementById("panel-toggle-weather-only");
    var showAllBox = document.getElementById("panel-toggle-show-all");
    if (weatherOnlyBox) weatherOnlyBox.checked = mode === WEATHER_ONLY;
    if (showAllBox) showAllBox.checked = mode === SHOW_ALL;
  }

  function updateUrl(mode) {
    var url = new URL(window.location.href);
    url.searchParams.delete("show-all");
    url.searchParams.delete("show-only-weather");
    if (mode === SHOW_ALL) {
      url.searchParams.set("show-all", "true");
    } else {
      url.searchParams.set("show-only-weather", "true");
    }
    window.history.replaceState(null, "", url);
  }

  function setMode(mode) {
    applyMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    updateUrl(mode);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var urlMode = params.get("show-all") === "true" ? SHOW_ALL
      : params.get("show-only-weather") === "true" ? WEATHER_ONLY
      : null;
    var savedMode = localStorage.getItem(STORAGE_KEY);
    var mode = urlMode || savedMode || SHOW_ALL;

    applyMode(mode);
    if (urlMode) localStorage.setItem(STORAGE_KEY, urlMode);

    var weatherOnlyBox = document.getElementById("panel-toggle-weather-only");
    var showAllBox = document.getElementById("panel-toggle-show-all");

    if (weatherOnlyBox) {
      weatherOnlyBox.addEventListener("change", function () {
        setMode(weatherOnlyBox.checked ? WEATHER_ONLY : SHOW_ALL);
      });
    }
    if (showAllBox) {
      showAllBox.addEventListener("change", function () {
        setMode(showAllBox.checked ? SHOW_ALL : WEATHER_ONLY);
      });
    }
  });
})();
