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

  // countries.dev timezones are UTC offset strings like "UTC-05:00", but a
  // zero offset comes back as bare "UTC" (e.g. Morocco) rather than
  // "UTC+00:00" — parse the offset and apply it to the visitor's current UTC
  // time to get "now" in that timezone. Not a live-ticking clock; computed
  // once when the card's facts are rendered, same as the "right now" weather
  // panel.
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

  function factsFromApiData(data) {
    var facts = [];
    function add(label, value) {
      if (value === null || value === undefined || value === "") return;
      facts.push({ label: label, value: value });
    }

    add("Country Codes", [data.numericCode, data.alpha2Code, data.alpha3Code].filter(Boolean).join(" / "));
    add("Region", data.region);
    add("Capital", data.capital);
    add("Demonym", data.demonym);
    add("Language", joinField((data.languages || []).map(function (l) { return l.name; })));
    add("Native Name", data.nativeName);
    add("Sub Region", data.subregion);
    add("Timezone", joinField(data.timezones));
    add("Local Time Now", joinField((data.timezones || []).map(localTimeForOffset).filter(Boolean)));

    if (data.currencies && data.currencies.length) {
      add(
        "Currency Code & Symbol",
        data.currencies
          .map(function (c) {
            return c.symbol ? c.code + " (" + c.symbol + ")" : c.code;
          })
          .join(", ")
      );
    }

    add("Calling Code", joinField((data.callingCodes || []).map(function (c) { return "+" + c; })));
    add("Top-Level Domain", joinField(data.topLevelDomain));

    return facts;
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

  function loadCountryDetails(entry, refs) {
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
        renderFacts(refs.factsEl, factsFromApiData(data));
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

    var dots = cards.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "about-carousel-dot";
      dot.setAttribute("aria-label", "Show country " + (i + 1) + " of " + cards.length);
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
    if (!section || !window.ABOUT_DATA || !window.ABOUT_DATA.length) return;

    var cards = window.ABOUT_DATA.map(function (entry) {
      var refs = buildCard(entry);
      loadCountryDetails(entry, refs);
      return refs.card;
    });

    setupCarousel(section, cards);
  });
})();
