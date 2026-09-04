// Builds the trip-overview map card — the first slide in the #about-section
// carousel. travel-about.js calls TravelMap.buildCard() and prepends the
// result to its own per-country cards before handing the full list to the
// carousel, so this file never touches carousel wiring directly.
//
// Deliberately reads lat/lon straight off the .location-card elements the
// travel layout already rendered (sourced from
// _data/travels/locations/<trip-key>.yml) rather than a second copy of
// that data — the map can't drift out of sync with the day-by-day
// itinerary below it, because it's reading the same rendered stops.
//
// Requires Leaflet (loaded via CDN in _layouts/travel.html, before this
// file) to be present on window.

(function () {
  function collectRoutePoints() {
    var cards = document.querySelectorAll(".location-card");
    var points = [];
    cards.forEach(function (card) {
      var lat = Number(card.getAttribute("data-lat"));
      var lon = Number(card.getAttribute("data-lon"));
      if (!lat || !lon) return; // 0/0 is the "add lat/lon" placeholder, not a real stop
      var last = points[points.length - 1];
      // Collapse a multi-night stay (several days at the same spot) into
      // one stop, so it doesn't look like repeated separate visits.
      if (last && last.lat === lat && last.lon === lon) return;
      points.push({
        lat: lat,
        lon: lon,
        name: card.getAttribute("data-name") || "",
        country: card.getAttribute("data-country") || "",
        flag: card.getAttribute("data-flag") || ""
      });
    });
    return points;
  }

  function initLeafletMap(mapEl, points) {
    if (typeof L === "undefined") {
      mapEl.textContent = "Map unavailable.";
      return;
    }

    // Needed when Leaflet is loaded from a CDN rather than bundled — it
    // otherwise looks for marker images relative to the current page.
    L.Icon.Default.imagePath = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/";

    var map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    var latLngs = points.map(function (p) { return [p.lat, p.lon]; });

    points.forEach(function (p, i) {
      var label = (i + 1) + ". " + (p.flag ? p.flag + " " : "") + p.name +
        (p.country ? ", " + p.country : "");
      L.marker([p.lat, p.lon]).addTo(map).bindPopup(label);
    });

    if (latLngs.length > 1) {
      L.polyline(latLngs, { color: "#1a73e8", weight: 3, dashArray: "6 8" }).addTo(map);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
    } else {
      map.setView(latLngs[0], 6);
    }

    // A map initialized while its container is display:none (true the
    // instant this card exists but isn't the active slide yet) gets 0x0
    // dimensions and mis-renders even after becoming visible. Re-measure
    // every time this slide becomes the active one again.
    if (typeof MutationObserver !== "undefined") {
      var card = mapEl.closest(".about-map-card");
      if (card) {
        new MutationObserver(function () {
          if (card.classList.contains("is-active")) map.invalidateSize();
        }).observe(card, { attributes: true, attributeFilter: ["class"] });
      }
    }
  }

  function buildCard(points) {
    var card = document.createElement("div");
    card.className = "about-country-card about-map-card";

    var header = document.createElement("div");
    header.className = "about-country-header";

    var icon = document.createElement("span");
    icon.className = "about-country-flag";
    icon.textContent = "🗺️";
    header.appendChild(icon);

    var title = document.createElement("span");
    title.className = "about-country-name";
    title.textContent = "Trip Route";
    header.appendChild(title);

    card.appendChild(header);

    var mapEl = document.createElement("div");
    mapEl.className = "about-map";
    card.appendChild(mapEl);

    // Deferred to the next frame so the card is attached and sized (this
    // is slide 0, made active synchronously right after this call returns,
    // so by the next paint it has real layout dimensions for Leaflet to
    // measure).
    requestAnimationFrame(function () {
      initLeafletMap(mapEl, points);
    });

    return card;
  }

  window.TravelMap = {
    buildCard: function () {
      var points = collectRoutePoints();
      if (!points.length) return null;
      return buildCard(points);
    }
  };
})();
