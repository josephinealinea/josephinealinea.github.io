// Controls which panels are visible on a /travel/<trip>/ page via five
// mutually-exclusive checkboxes: "Show all" (default), and "Show only:"
// Weather, Itinerary, Checklist, Budget. Any panel container tagged with
// data-panel="weather", data-panel="itinerary", data-panel="checklist", or
// data-panel="budget" is hidden unless its mode (or "show-all") is active;
// elements with no data-panel attribute (e.g. .trip-intro) are never
// touched. A future panel category just needs a new data-panel value and a
// matching checkbox. (Budget has no panel markup yet — its checkbox exists
// so the toggle UI is ready, but selecting it currently hides everything.)
//
// Initial mode priority: URL param (?show-all=true / ?show-only-weather=true
// / ?show-only-itinerary=true / ?show-only-checklist=true /
// ?show-only-budget=true) > saved localStorage choice > default
// ("show-all"). Manual toggles are saved to localStorage and reflected in
// the URL (via replaceState) so the resulting view is reloadable/shareable.

(function () {
  var STORAGE_KEY = "travel-panel-mode";
  var SHOW_ALL = "show-all";
  var WEATHER_ONLY = "weather-only";
  var ITINERARY_ONLY = "itinerary-only";
  var CHECKLIST_ONLY = "checklist-only";
  var BUDGET_ONLY = "budget-only";

  // mode -> the data-panel value it exclusively shows (null = show everything)
  var MODE_PANEL = {};
  MODE_PANEL[SHOW_ALL] = null;
  MODE_PANEL[WEATHER_ONLY] = "weather";
  MODE_PANEL[ITINERARY_ONLY] = "itinerary";
  MODE_PANEL[CHECKLIST_ONLY] = "checklist";
  MODE_PANEL[BUDGET_ONLY] = "budget";

  var MODE_CHECKBOX_ID = {};
  MODE_CHECKBOX_ID[SHOW_ALL] = "panel-toggle-show-all";
  MODE_CHECKBOX_ID[WEATHER_ONLY] = "panel-toggle-weather-only";
  MODE_CHECKBOX_ID[ITINERARY_ONLY] = "panel-toggle-itinerary-only";
  MODE_CHECKBOX_ID[CHECKLIST_ONLY] = "panel-toggle-checklist-only";
  MODE_CHECKBOX_ID[BUDGET_ONLY] = "panel-toggle-budget-only";

  var MODE_URL_PARAM = {};
  MODE_URL_PARAM[SHOW_ALL] = "show-all";
  MODE_URL_PARAM[WEATHER_ONLY] = "show-only-weather";
  MODE_URL_PARAM[ITINERARY_ONLY] = "show-only-itinerary";
  MODE_URL_PARAM[CHECKLIST_ONLY] = "show-only-checklist";
  MODE_URL_PARAM[BUDGET_ONLY] = "show-only-budget";

  var MODES = [SHOW_ALL, WEATHER_ONLY, ITINERARY_ONLY, CHECKLIST_ONLY, BUDGET_ONLY];

  function applyMode(mode) {
    var onlyPanel = MODE_PANEL[mode];
    Array.prototype.forEach.call(document.querySelectorAll("[data-panel]"), function (el) {
      var hidden = onlyPanel !== null && el.getAttribute("data-panel") !== onlyPanel;
      el.classList.toggle("panel-hidden", hidden);
    });

    MODES.forEach(function (m) {
      var box = document.getElementById(MODE_CHECKBOX_ID[m]);
      if (box) box.checked = m === mode;
    });
  }

  function updateUrl(mode) {
    var url = new URL(window.location.href);
    MODES.forEach(function (m) {
      url.searchParams.delete(MODE_URL_PARAM[m]);
    });
    url.searchParams.set(MODE_URL_PARAM[mode], "true");
    window.history.replaceState(null, "", url);
  }

  function setMode(mode) {
    applyMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    updateUrl(mode);
  }

  function modeFromUrl(params) {
    for (var i = 0; i < MODES.length; i++) {
      var mode = MODES[i];
      if (params.get(MODE_URL_PARAM[mode]) === "true") return mode;
    }
    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var urlMode = modeFromUrl(params);
    var savedMode = localStorage.getItem(STORAGE_KEY);
    var mode = urlMode || savedMode || SHOW_ALL;

    applyMode(mode);
    if (urlMode) localStorage.setItem(STORAGE_KEY, urlMode);

    MODES.forEach(function (m) {
      var box = document.getElementById(MODE_CHECKBOX_ID[m]);
      if (!box) return;
      box.addEventListener("change", function () {
        // Unticking the currently-active checkbox falls back to "show all"
        // rather than leaving all three unticked.
        setMode(box.checked ? m : SHOW_ALL);
      });
    });
  });
})();
