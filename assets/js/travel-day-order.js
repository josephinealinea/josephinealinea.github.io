// Reorders the .trip-day blocks on a /travel/<trip>/ page based on the
// visitor's local date, so "today" (or the next upcoming day) always shows
// at the top.
//
// Order produced: days with date >= today, in their original (ascending)
// order, followed by days with date < today, also in their original
// (ascending) order — i.e. the list is rotated to start at "today or next
// upcoming", not reversed. This repeats every visit ("until the next
// cycle"), since it's recalculated from the visitor's current date each
// time the page loads.
//
// Example for a trip running 23 June – 12 July:
//   - Visited on 22 or 23 June: order unchanged, 23 June -> 12 July.
//   - Visited on 24 June: 24 June -> 12 July, then 23 June at the very end.

(function () {
  function daysFromToday(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + "T00:00:00");
    return Math.round((target - today) / 86400000);
  }

  function reorderTripDays() {
    var container = document.querySelector(".trip-days");
    if (!container) return;

    var dayEls = Array.prototype.slice.call(container.querySelectorAll(".trip-day"));
    if (dayEls.length === 0) return;

    var upcoming = [];
    var past = [];

    dayEls.forEach(function (el) {
      var date = el.getAttribute("data-date");
      if (!date) {
        upcoming.push(el); // no date info — leave it where it sorts naturally
        return;
      }

      var diff = daysFromToday(date);

      var badge = el.querySelector(".today-badge");
      if (badge) badge.textContent = diff === 0 ? " (Today)" : "";

      if (diff < 0) {
        past.push(el);
      } else {
        upcoming.push(el);
      }
    });

    // Re-append in the desired order. appendChild on an existing node moves
    // it rather than duplicating it, so this just re-sequences the DOM.
    upcoming.concat(past).forEach(function (el) {
      container.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", reorderTripDays);
})();
