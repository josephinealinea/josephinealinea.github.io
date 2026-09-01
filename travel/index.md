---
layout: page
title: Travels
permalink: /travel/
---

<a href="/" class="back-link">← Back to Main Page</a>

<p>🌈 Trip - Checklist, Itineraries, Budget and Weather forecasts ✈️</p>

{% assign trips = site.pages | where: "layout", "travel" | sort: "start_date" | reverse %}
{% if trips.size > 0 %}
<div class="post-grid" style="margin-top: 1.5rem;">
  {% for trip in trips %}
    {% assign today_ts = "now" | date: "%s" %}
    {% assign end_ts = trip.end_date | date: "%s" %}
    <article class="post-card">
      <div class="post-meta">
        <span class="post-date">{{ trip.start_date | date: "%B %-d, %Y" }} – {{ trip.end_date | date: "%B %-d, %Y" }}</span>
      </div>
      <h3 class="post-title">
        <a class="post-link" href="{{ trip.url | relative_url }}?show-all=true">{{ trip.title }}</a>
      </h3>
      <div class="post-excerpt trip-status" data-start-date="{{ trip.start_date | date: '%Y-%m-%d' }}" data-end-date="{{ trip.end_date | date: '%Y-%m-%d' }}">
        {% if end_ts < today_ts %}✈️ Past trip{% else %}📅 Upcoming{% endif %}
      </div>
      <a href="{{ trip.url | relative_url }}?show-all=true" class="read-more">View Trip →</a>
    </article>
  {% endfor %}
</div>
<script src="{{ '/assets/js/travel-shared.js' | relative_url }}"></script>
<script src="{{ '/assets/js/travel-list-countdown.js' | relative_url }}"></script>
{% else %}
<p>No trips yet. Check back soon!</p>
{% endif %}
