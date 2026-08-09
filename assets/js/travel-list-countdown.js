// Fills in each trip card's status line on /travel/ with the correct
// phase ("Upcoming" / "Ongoing" / "Past trip") and relative-time annotation
// (e.g. "(in 76 days)", "(13 days ago)"), computed client-side so it stays
// correct between site rebuilds — same logic as the trip detail page's
// header countdown (tripPhase / tripAnnotation live in travel-shared.js).
//
// Reads data-start-date / data-end-date (YYYY-MM-DD) off each .trip-status
// element, set by travel/index.md from each trip page's start_date/end_date.

(function () {
  var PHASE_LABEL = {
    upcoming: "📅 Upcoming",
    ongoing: "🧳 Ongoing",
    past: "✈️ Past trip"
  };

  function annotateTripCards() {
    var cards = document.querySelectorAll(".trip-status[data-start-date][data-end-date]");
    Array.prototype.forEach.call(cards, function (el) {
      var startDate = el.getAttribute("data-start-date");
      var endDate = el.getAttribute("data-end-date");
      if (!startDate || !endDate) return;

      var phase = TravelShared.tripPhase(startDate, endDate);
      var annotation = TravelShared.tripAnnotation(startDate, endDate);
      el.textContent = PHASE_LABEL[phase] + " " + annotation;
    });
  }

  document.addEventListener("DOMContentLoaded", annotateTripCards);
})();
