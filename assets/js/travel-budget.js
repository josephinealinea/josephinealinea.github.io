(function () {
  var UNSPECIFIED = "Unspecified";
  var warnedCurrencies = {};
  var charts = [];

  function isConfirmed(item) {
    return item.status !== "pre-booked";
  }

  function convertAmount(item) {
    var display = window.BUDGET_DISPLAY_CURRENCY;
    if (!display || item.currency === display) return item.amount;

    var rate = window.BUDGET_EXCHANGE_RATES && window.BUDGET_EXCHANGE_RATES[item.currency];
    if (!rate) {
      if (!warnedCurrencies[item.currency]) {
        warnedCurrencies[item.currency] = true;
        console.warn("travel-budget: no exchange rate for " + item.currency + ", showing amount unconverted");
      }
      return item.amount;
    }
    return item.amount / rate;
  }

  function missingRateCurrencies(items) {
    var display = window.BUDGET_DISPLAY_CURRENCY;
    var rates = window.BUDGET_EXCHANGE_RATES || {};
    var seen = {};
    var missing = [];
    items.forEach(function (item) {
      if (item.currency !== display && !rates[item.currency] && !seen[item.currency]) {
        seen[item.currency] = true;
        missing.push(item.currency);
      }
    });
    return missing;
  }

  function nativeTotals(items) {
    var totals = {};
    var order = [];
    items.forEach(function (item) {
      if (!(item.currency in totals)) {
        totals[item.currency] = 0;
        order.push(item.currency);
      }
      totals[item.currency] += item.amount;
    });
    return order.map(function (currency) {
      return { currency: currency, total: totals[currency] };
    });
  }

  function categoryInfo(key) {
    var categories = window.BUDGET_CATEGORIES || {};
    return categories[key] || categories.other || { icon: "💰", color: "#868E96" };
  }

  function groupByCategory(items) {
    var totals = {};
    var order = [];
    items.forEach(function (item) {
      var key = (window.BUDGET_CATEGORIES && window.BUDGET_CATEGORIES[item.category]) ? item.category : "other";
      if (!(key in totals)) {
        totals[key] = 0;
        order.push(key);
      }
      totals[key] += convertAmount(item);
    });
    var info;
    return order
      .map(function (key) {
        info = categoryInfo(key);
        return { key: key, label: key, icon: info.icon, color: info.color, total: totals[key] };
      })
      .sort(function (a, b) {
        return b.total - a.total;
      });
  }

  function countryPalette(count) {
    var colors = [];
    for (var i = 0; i < count; i++) {
      var hue = Math.round((360 / Math.max(count, 1)) * i);
      colors.push("hsl(" + hue + ", 55%, 50%)");
    }
    return colors;
  }

  function groupByCountry(items) {
    var totals = {};
    var order = [];
    items.forEach(function (item) {
      var countries = item.countries && item.countries.length ? item.countries : [UNSPECIFIED];
      var share = convertAmount(item) / countries.length;
      countries.forEach(function (country) {
        if (!(country in totals)) {
          totals[country] = 0;
          order.push(country);
        }
        totals[country] += share;
      });
    });
    var palette = countryPalette(order.length);
    return order
      .map(function (key, i) {
        return { key: key, label: key, icon: null, color: palette[i], total: totals[key] };
      })
      .sort(function (a, b) {
        return b.total - a.total;
      });
  }

  function formatAmount(total, currency) {
    return (
      total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      " " +
      currency
    );
  }

  function renderLegend(groups, currency, grandTotal) {
    var list = document.createElement("ul");
    list.className = "budget-legend";
    groups.forEach(function (group) {
      var li = document.createElement("li");

      var swatch = document.createElement("span");
      swatch.className = "budget-legend-swatch";
      swatch.style.backgroundColor = group.color;
      li.appendChild(swatch);

      var label = document.createElement("span");
      label.className = "budget-legend-label";
      label.textContent = (group.icon ? group.icon + " " : "") + group.label;
      label.title = group.label;
      li.appendChild(label);

      var percent = document.createElement("span");
      percent.className = "budget-legend-percent";
      var pct = grandTotal > 0 ? (group.total / grandTotal) * 100 : 0;
      percent.textContent = pct.toFixed(1) + "%";
      li.appendChild(percent);

      var amount = document.createElement("span");
      amount.className = "budget-legend-amount";
      amount.textContent = formatAmount(group.total, currency);
      li.appendChild(amount);

      list.appendChild(li);
    });
    return list;
  }

  function renderPanel(container, groupBy, scope) {
    charts.forEach(function (chart) {
      chart.destroy();
    });
    charts = [];
    container.innerHTML = "";

    var items = scope === "forecasted" ? window.BUDGET_DATA : window.BUDGET_DATA.filter(isConfirmed);
    var displayCurrency = window.BUDGET_DISPLAY_CURRENCY;
    var groups = groupBy === "country" ? groupByCountry(items) : groupByCategory(items);
    var total = items.reduce(function (sum, item) {
      return sum + convertAmount(item);
    }, 0);

    if (!items.length) {
      var empty = document.createElement("div");
      empty.className = "budget-native-totals";
      empty.textContent =
        scope === "forecasted" ? "No budget items yet." : "No confirmed items yet — check the Forecasted (All) view.";
      container.appendChild(empty);
      return;
    }

    var block = document.createElement("div");
    block.className = "budget-currency-block";

    var chartWrap = document.createElement("div");
    chartWrap.className = "budget-chart-wrap";
    var canvas = document.createElement("canvas");
    canvas.width = 190;
    canvas.height = 190;
    canvas.setAttribute("aria-hidden", "true");
    chartWrap.appendChild(canvas);
    block.appendChild(chartWrap);

    var details = document.createElement("div");
    details.className = "budget-details";

    var totalLine = document.createElement("div");
    totalLine.className = "budget-currency-total";
    totalLine.textContent = "Total: " + formatAmount(total, displayCurrency);
    details.appendChild(totalLine);

    var missing = missingRateCurrencies(items);
    if (missing.length) {
      var warning = document.createElement("div");
      warning.className = "budget-warning";
      warning.textContent =
        "⚠ " +
        missing.join(", ") +
        " shown unconverted — add an exchange rate in this trip's budget file.";
      details.appendChild(warning);
    }

    var natives = nativeTotals(items);
    var hasForeignAmounts = natives.some(function (n) {
      return n.currency !== displayCurrency;
    });
    if (hasForeignAmounts) {
      var nativeLine = document.createElement("div");
      nativeLine.className = "budget-native-totals";
      nativeLine.textContent =
        "Native: " +
        natives
          .map(function (n) {
            return formatAmount(n.total, n.currency);
          })
          .join(" + ");
      details.appendChild(nativeLine);
    }

    details.appendChild(renderLegend(groups, displayCurrency, total));
    block.appendChild(details);

    container.appendChild(block);

    try {
      var chart = new Chart(canvas, {
        type: "pie",
        data: {
          labels: groups.map(function (g) {
            return g.label;
          }),
          datasets: [
            {
              data: groups.map(function (g) {
                return g.total;
              }),
              backgroundColor: groups.map(function (g) {
                return g.color;
              })
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return ctx.label + ": " + formatAmount(ctx.parsed, displayCurrency);
                }
              }
            }
          }
        }
      });
      charts.push(chart);
    } catch (e) {
      canvas.remove();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("budget-section");
    if (!section || !window.BUDGET_DATA || !window.BUDGET_DATA.length) return;

    var container = section.querySelector(".budget-currency-blocks");

    // Forecasted totals (which include pre-booked items) aren't useful once
    // a trip is over — only offer them for upcoming/ongoing trips.
    var datesEl = document.querySelector(".trip-dates");
    var isPastTrip =
      datesEl &&
      window.TravelShared &&
      TravelShared.tripPhase(datesEl.getAttribute("data-start-date"), datesEl.getAttribute("data-end-date")) === "past";
    if (isPastTrip) {
      section.querySelectorAll('[data-scope="forecasted"]').forEach(function (btn) {
        btn.remove();
      });
    }

    var buttons = section.querySelectorAll(".budget-toggle-btn");

    renderPanel(container, "category", "confirmed");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        renderPanel(container, btn.getAttribute("data-group-by"), btn.getAttribute("data-scope"));
      });
    });
  });
})();