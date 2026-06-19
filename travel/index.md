---
layout: page
title: Travel
permalink: /travel/
---

<a href="/" class="back-link">← Back to Main Page</a>

<div class="trip-list">
{% assign trips = site.pages | where: "layout", "travel" | sort: "start_date" | reverse %}
{% for trip in trips %}
  {% assign today = "now" | date: "%s" %}
  {% assign end_ts = trip.end_date | date: "%s" %}
  <div class="trip-list-item">
    <h3><a href="{{ trip.url | relative_url }}">{{ trip.title }}</a></h3>
    <p>
      {{ trip.start_date | date: "%B %-d, %Y" }} – {{ trip.end_date | date: "%B %-d, %Y" }}
      {% if end_ts < today %} · <em>past</em>{% else %} · <em>upcoming</em>{% endif %}
    </p>
  </div>
{% endfor %}
</div>

<style>
  .trip-list { max-width: 700px; margin-top: 1.5rem; }
  .trip-list-item { border: 1px solid #ddd; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
  .trip-list-item h3 { margin: 0 0 0.25rem; }
</style>
