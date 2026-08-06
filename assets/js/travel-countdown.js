// Appends a relative-time annotation (e.g. "(in 79 days)", "(3 months ago)",
// "(Day 2 of 3)") next to the trip date range on a /travel/<trip>/ page.
//
// Reads data-start-date / data-end-date (YYYY-MM-DD) off .trip-dates, set by
// the travel layout from page.start_date / page.end_date front matter.
// daysFromToday lives in travel-shared.js, loaded before this.

(function () {
  function pluralize(n, unit) {
    return n + " " + unit + (n === 1 ? "" : "s");
  }

  function relativeLabel(days) {
    if (days <= 365) {
      return pluralize(days, "day");
    }

    var months = Math.round(days / 30);
    if (months <= 18) {
      return pluralize(months, "month");
    }

    var years = Math.floor(months / 12);
    var remMonths = months % 12;
    if (remMonths === 0) {
      return pluralize(years, "year");
    }
    return pluralize(years, "year") + " and " + pluralize(remMonths, "month");
  }

  function computeAnnotation(startDate, endDate) {
    var startDiff = TravelShared.daysFromToday(startDate);
    var endDiff = TravelShared.daysFromToday(endDate);

    if (startDiff > 0) {
      return "(in " + relativeLabel(startDiff) + ")";
    }

    if (endDiff < 0) {
      return "(" + relativeLabel(Math.abs(endDiff)) + " ago)";
    }

    // Ongoing trip: startDiff <= 0 <= endDiff.
    var totalDays = Math.round((new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / 86400000) + 1;
    var currentDay = (0 - startDiff) + 1;

    return "(Day " + currentDay + " of " + totalDays + ")";
  }

  function annotateTripDates() {
    var el = document.querySelector(".trip-dates");
    if (!el) return;

    var startDate = el.getAttribute("data-start-date");
    var endDate = el.getAttribute("data-end-date");
    if (!startDate || !endDate) return;

    var span = document.createElement("span");
    span.className = "trip-dates-relative";
    span.textContent = " " + computeAnnotation(startDate, endDate);
    el.appendChild(span);
  }

  document.addEventListener("DOMContentLoaded", annotateTripDates);
})();