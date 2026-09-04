// Populates the #about-section carousel on a /travel/<trip>/ page: one card
// per country from _data/travels/about/<trip-key>.yml, showing country facts
// pulled live from the countries.dev API (https://countries.dev/name/<country
// name> — takes the about.yml "country" value directly, no local ISO-code
// lookup needed) plus that trip's own "Good to know" info list.
//
// window.ABOUT_DATA (country + info[] per entry) is injected by the travel
// layout from _data/travels/about/<trip-key>.yml.

(function () {
  function joinField(list) {
    return list && list.length ? list.join(", ") : null;
  }

  // Fallback only, used when a specific city can't be resolved to a real
  // IANA zone (see timeInZone below) — e.g. a small town countries.dev's
  // city search doesn't index. countries.dev's country-level timezones
  // are plain UTC offset strings like "UTC-05:00" (bare "UTC" for a zero
  // offset, e.g. Morocco), which is a fixed standard-time offset with no
  // DST rule attached — this is why timeInZone/a real zone name is
  // preferred wherever a city lookup succeeds.
  function localTimeForOffset(offset) {
    if (offset === "UTC") offset = "UTC+00:00";
    var match = /^UTC([+-])(\d{2}):(\d{2})$/.exec(offset || "");
    if (!match) return null;
    var sign = match[1] === "-" ? -1 : 1;
    var offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));
    var now = new Date();
    var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    var target = new Date(utcMs + offsetMinutes * 60000);
    return target.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  // Given a real IANA zone name ("Europe/Tallinn", "America/La_Paz", ...),
  // the browser's own tzdata handles DST correctly — no manual offset math,
  // no "is it currently daylight saving" bookkeeping to get wrong.
  function timeInZone(zone) {
    try {
      return new Date().toLocaleTimeString([], { timeZone: zone, hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return null; // zone name Intl doesn't recognize
    }
  }

  function titleCase(str) {
    return (str || "").replace(/\w\S*/g, function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    });
  }

  // countries.dev's city search: the query param is "q", not "name" —
  // "name" is silently ignored and falls back to a default top-cities-by-
  // population list, which looks like a real (wrong) result if you're not
  // watching for it. Only larger cities are indexed; small towns (e.g.
  // Ollantaytambo, Aguas Calientes) come back empty — callers fall back to
  // the country-level offset in that case.
  function fetchCityMatches(cityName) {
    return fetch("https://countries.dev/cities?q=" + encodeURIComponent(cityName))
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (matches) { return Array.isArray(matches) ? matches : []; })
      .catch(function () { return []; });
  }

  // The search above is a substring match, not "the city" — "uyuni" matches
  // "Makuyuni" (a different town, in Tanzania) with nothing else returned,
  // and a common name like "la paz" comes back with a dozen candidates
  // worldwide. Restrict to results whose name is an exact match, then, when
  // the expected country is known, prefer the one actually in that country
  // — city names collide across countries far more often than they're
  // unique. An empty result here (as for Uyuni, which isn't indexed at all)
  // correctly falls through to the country-level offset fallback, rather
  // than confidently returning a real-looking zone from the wrong country.
  function pickCityZone(matches, cityName, expectedCountryCode) {
    var needle = (cityName || "").trim().toLowerCase();
    var exact = matches.filter(function (m) {
      return (m.name || "").toLowerCase() === needle || (m.asciiName || "").toLowerCase() === needle;
    });
    if (!exact.length) return null;
    if (expectedCountryCode) {
      var inCountry = exact.filter(function (m) { return m.countryCode === expectedCountryCode; });
      if (inCountry.length) return inCountry[0].timezone || null;
    }
    return exact[0].timezone || null;
  }

  // The current UTC offset for a real IANA zone, DST-aware, in the same
  // "UTC+HH:MM" shape countries.dev uses for its country-level timezones —
  // this is what lets the "Timezone" fact be sourced from the cities
  // actually being visited instead of the country's (sometimes multi-zone)
  // raw list. Intl always resolves this locally, no extra fetch.
  function offsetLabelForZone(zone) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(new Date());
      var part = parts.filter(function (p) { return p.type === "timeZoneName"; })[0];
      return part ? part.value.replace("GMT", "UTC") : null;
    } catch (e) {
      return null; // zone name Intl doesn't recognize, or longOffset unsupported
    }
  }

  // Resolves one city name to { city, zone, offset, time }, falling back to
  // the country-level offset (fallbackOffset, e.g. "UTC-05:00") wherever
  // the city can't be matched to a real IANA zone — a small town
  // countries.dev doesn't index, or (as with Uyuni matching Tanzania's
  // "Makuyuni") a fuzzy match pickCityZone already rejected. zone is null
  // in that fallback case; callers that want a real zone name (the
  // "Timezone" fact) can fall back to grouping by offset instead. Never
  // produces a fact itself; callers turn a batch of these into whatever
  // facts they need, so the same resolution drives both "Timezone" and
  // "Local/Home Time Now" instead of hitting the API twice per city.
  function resolveCityClock(cityName, expectedCountryCode, fallbackOffset) {
    return fetchCityMatches(cityName).then(function (matches) {
      var zone = pickCityZone(matches, cityName, expectedCountryCode);
      var offset = (zone && offsetLabelForZone(zone)) || fallbackOffset || null;
      var time = (zone && timeInZone(zone)) || (offset ? localTimeForOffset(offset) : null);
      return { city: cityName, zone: zone, offset: offset, time: time };
    });
  }

  function resolveCityClocks(cities, expectedCountryCode, fallbackOffset) {
    return Promise.all(
      cities.map(function (city) {
        return resolveCityClock(city, expectedCountryCode, fallbackOffset);
      })
    );
  }

  // One "<label>" fact per distinct timezone among the resolved cities,
  // its value carrying the city name(s) in parentheses — cities sharing an
  // offset read the same time, so they combine onto one fact ("8:19 (La
  // Paz, Uyuni)"); a city in a different offset gets its own fact. Same
  // shape for any number of cities/offsets, used by both "Local Time Now"
  // and "Home Time Now".
  function cityClockFacts(clocks, label) {
    var order = [];
    var groups = {};
    clocks.forEach(function (c) {
      if (!c.time || !c.offset) return;
      if (!groups[c.offset]) {
        groups[c.offset] = { time: c.time, cities: [] };
        order.push(c.offset);
      }
      groups[c.offset].cities.push(titleCase(c.city));
    });
    return order.map(function (offset) {
      var g = groups[offset];
      return { label: label, value: g.time + " (" + g.cities.join(", ") + ")" };
    });
  }

  // "Timezone" fact value built from the same per-city resolution: the
  // real IANA zone name(s) the cities resolved to (e.g. "America/Lima"),
  // not an offset — which city maps to which zone is already spelled out
  // in "Local Time Now", so this only needs the distinct zone(s). Cities
  // are grouped by offset first so a country like Brazil shows only the
  // zone the trip actually visits (Rio's America/Sao_Paulo) instead of all
  // four of the country's zones; within a group, a city that didn't
  // resolve to a real zone (e.g. Uyuni) is covered by another city sharing
  // its offset (La Paz's America/La_Paz) rather than falling back to a
  // bare offset next to it.
  function timezoneFactValue(clocks) {
    var order = [];
    var groups = {};
    clocks.forEach(function (c) {
      if (!c.offset) return;
      var group = groups[c.offset];
      if (!group) {
        group = { display: c.zone || c.offset, hasZone: !!c.zone };
        groups[c.offset] = group;
        order.push(c.offset);
      } else if (!group.hasZone && c.zone) {
        group.display = c.zone;
        group.hasZone = true;
      }
    });
    return order.map(function (offset) { return groups[offset].display; }).join(", ");
  }

  // "Timezone" + "Local Time Now" fact(s) for a country card: sourced from
  // entry.cities[] (that country's "cities" list in about.yml) when
  // present, via a real per-city IANA zone lookup; otherwise the old
  // country-level view straight off countries.dev's raw offsets, for trips
  // that haven't added a cities list yet.
  function resolveTimeFacts(entry, data) {
    var countryOffset = (data.timezones || [])[0];
    var countryCode = data.alpha2Code;

    if (entry.cities && entry.cities.length) {
      return resolveCityClocks(entry.cities, countryCode, countryOffset).then(function (clocks) {
        var facts = [];
        var tz = timezoneFactValue(clocks);
        if (tz) facts.push({ label: "Timezone", value: tz });
        return facts.concat(cityClockFacts(clocks, "Local Time Now"));
      });
    }

    var facts = [];
    var tz = joinField(data.timezones);
    if (tz) facts.push({ label: "Timezone", value: tz });
    var joined = joinField((data.timezones || []).map(localTimeForOffset).filter(Boolean));
    if (joined) facts.push({ label: "Local Time Now", value: joined });
    return Promise.resolve(facts);
  }

  // "Home Time Now" fact(s): one per city in the current trip's about.yml
  // "home_cities" list (window.HOME_CITIES) — computed once and shared by
  // every card, since it doesn't depend on which country's card is
  // asking. A trip that hasn't set home_cities simply gets no "Home Time
  // Now" fact, rather than falling back to a fixed default.
  function loadHomeFacts() {
    if (!window.HOME_CITIES || !window.HOME_CITIES.length) return Promise.resolve([]);
    return resolveCityClocks(window.HOME_CITIES, null, null).then(function (clocks) {
      return cityClockFacts(clocks, "Home Time Now");
    });
  }

  // Everything except the "right now" clock facts, which resolveLocalTimeFacts()/
  // loadHomeFacts() compute asynchronously (a real per-city timezone lookup,
  // not just a synchronous read off `data`) — split into head/tail so the
  // caller can splice those facts in between (Local Time Now goes right
  // after Timezone; Home Time Now stays last, same positions as before).
  function factsFromApiData(data, entry) {
    var head = [];
    var tail = [];
    function add(list, label, value) {
      if (value === null || value === undefined || value === "") return;
      list.push({ label: label, value: value });
    }

    add(head, "Country Codes", [data.numericCode, data.alpha2Code, data.alpha3Code].filter(Boolean).join(" / "));
    add(head, "Region", data.region);
    add(head, "Capital", data.capital);
    add(head, "Demonym", data.demonym);
    add(head, "Language", joinField((data.languages || []).map(function (l) { return l.name; })));
    add(head, "Native Name", data.nativeName);
    add(head, "Sub Region", data.subregion);
    // Timezone + Local Time Now fact(s) spliced in here by the caller —
    // see resolveTimeFacts.

    if (data.currencies && data.currencies.length) {
      add(
        tail,
        "Currency Code & Symbol",
        data.currencies
          .map(function (c) {
            return c.symbol ? c.code + " (" + c.symbol + ")" : c.code;
          })
          .join(", ")
      );
    }

    add(tail, "Calling Code", joinField((data.callingCodes || []).map(function (c) { return "+" + c; })));
    // Was "Top-Level Domain" — swapped for something a traveler is more
    // likely to actually need. Sourced from _data/travels/emergency_numbers.yml,
    // keyed by the same about.yml "country" value as this card itself.
    add(tail, "Emergency Number", window.EMERGENCY_NUMBERS && window.EMERGENCY_NUMBERS[entry.country]);
    // Home Time Now fact(s) appended by the caller, after this — see the
    // "partial last row" layout call in .about-country-facts.

    return { head: head, tail: tail };
  }

  function renderFacts(factsEl, facts) {
    factsEl.innerHTML = "";
    facts.forEach(function (fact) {
      var wrap = document.createElement("div");
      wrap.className = "about-fact";

      var label = document.createElement("span");
      label.className = "about-fact-label";
      label.textContent = fact.label;
      wrap.appendChild(label);

      var value = document.createElement("span");
      value.className = "about-fact-value";
      value.textContent = fact.value;
      wrap.appendChild(value);

      factsEl.appendChild(wrap);
    });
  }

  function buildCard(entry) {
    var card = document.createElement("div");
    card.className = "about-country-card";

    var header = document.createElement("div");
    header.className = "about-country-header";

    var flag = document.createElement("span");
    flag.className = "about-country-flag";
    header.appendChild(flag);

    var name = document.createElement("span");
    name.className = "about-country-name";
    name.textContent = entry.country;
    header.appendChild(name);

    card.appendChild(header);

    var loading = document.createElement("div");
    loading.className = "about-country-loading";
    loading.textContent = "Loading country details…";
    card.appendChild(loading);

    var facts = document.createElement("div");
    facts.className = "about-country-facts";
    card.appendChild(facts);

    if (entry.info && entry.info.length) {
      var goodToKnow = document.createElement("div");
      goodToKnow.className = "about-country-good-to-know";

      var heading = document.createElement("h3");
      heading.textContent = "Good to know";
      goodToKnow.appendChild(heading);

      var list = document.createElement("ul");
      entry.info.forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        list.appendChild(li);
      });
      goodToKnow.appendChild(list);

      card.appendChild(goodToKnow);
    }

    return { card: card, flagEl: flag, nameEl: name, loadingEl: loading, factsEl: facts };
  }

  // homeFactsPromise is computed once in the DOMContentLoaded handler below
  // and shared across every card — "Home Time Now" doesn't vary by which
  // country's card is asking, so there's no reason to re-resolve it once
  // per card.
  function loadCountryDetails(entry, refs, homeFactsPromise) {
    fetch("https://countries.dev/name/" + encodeURIComponent(entry.country))
      .then(function (res) {
        if (!res.ok) throw new Error("countries.dev request failed");
        return res.json();
      })
      .then(function (matches) {
        var data = Array.isArray(matches) ? matches[0] : matches;
        if (!data) throw new Error("countries.dev: no match");
        refs.loadingEl.remove();
        if (data.flag) refs.flagEl.textContent = data.flag;
        if (data.name) refs.nameEl.textContent = data.name;

        var parts = factsFromApiData(data, entry);
        return Promise.all([resolveTimeFacts(entry, data), homeFactsPromise]).then(
          function (results) {
            var timeFacts = results[0];
            var homeFacts = results[1];
            renderFacts(refs.factsEl, parts.head.concat(timeFacts, parts.tail, homeFacts));
          }
        );
      })
      .catch(function () {
        refs.loadingEl.remove();
        var warning = document.createElement("div");
        warning.className = "about-warning";
        warning.textContent = "⚠ Couldn't load country details for " + entry.country + ".";
        refs.card.insertBefore(warning, refs.factsEl);
      });
  }

  function setupCarousel(section, cards) {
    var track = section.querySelector(".about-carousel-track");
    var dotsWrap = section.querySelector(".about-carousel-dots");
    var prevBtn = section.querySelector(".about-carousel-prev");
    var nextBtn = section.querySelector(".about-carousel-next");
    var current = 0;

    // The map slide (see below) sits at index 0 when present, ahead of the
    // per-country cards — don't count it as "country 1" in the dot labels.
    var mapCardCount = cards.length && cards[0].classList.contains("about-map-card") ? 1 : 0;
    var countryTotal = cards.length - mapCardCount;

    var dots = cards.map(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "about-carousel-dot";
      var label = card.classList.contains("about-map-card")
        ? "Show trip route map"
        : "Show country " + (i - mapCardCount + 1) + " of " + countryTotal;
      dot.setAttribute("aria-label", label);
      dot.addEventListener("click", function () {
        goTo(i);
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      cards.forEach(function (c, i) {
        c.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === current);
      });
      prevBtn.disabled = cards.length <= 1;
      nextBtn.disabled = cards.length <= 1;
    }

    prevBtn.addEventListener("click", function () {
      goTo(current - 1);
    });
    nextBtn.addEventListener("click", function () {
      goTo(current + 1);
    });

    cards.forEach(function (c) {
      track.appendChild(c);
    });

    goTo(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("about-section");
    if (!section) return;

    var homeFactsPromise = loadHomeFacts();

    var cards = (window.ABOUT_DATA || []).map(function (entry) {
      var refs = buildCard(entry);
      loadCountryDetails(entry, refs, homeFactsPromise);
      return refs.card;
    });

    // Trip route map — first slide, ahead of the per-country cards, when
    // there's at least one real (non-placeholder) lat/lon to plot. See
    // travel-map.js; it reads coordinates straight off the .location-card
    // elements the layout already rendered, not a separate data source.
    if (window.TravelMap) {
      var mapCard = window.TravelMap.buildCard();
      if (mapCard) cards.unshift(mapCard);
    }

    if (!cards.length) return;

    setupCarousel(section, cards);
  });
})();
