// Appends a relative-time annotation (e.g. "(in 79 days)", "(3 months ago)",
// "(Day 2 of 3)") next to the trip date range on a /travel/<trip>/ page.
//
// Reads data-start-date / data-end-date (YYYY-MM-DD) off .trip-dates, set by
// the travel layout from page.start_date / page.end_date front matter.
// tripAnnotation lives in travel-shared.js, loaded before this.

(function () {
  function annotateTripDates() {
    var el = document.querySelector(".trip-dates");
    if (!el) return;

    var startDate = el.getAttribute("data-start-date");
    var endDate = el.getAttribute("data-end-date");
    if (!startDate || !endDate) return;

    var span = document.createElement("span");
    span.className = "trip-dates-relative";
    span.textContent = " " + TravelShared.tripAnnotation(startDate, endDate);
    el.appendChild(span);
  }

  document.addEventListener("DOMContentLoaded", annotateTripDates);
})();
