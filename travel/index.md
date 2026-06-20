---
layout: page
title: Travel
permalink: /travel/
---

<a href="/" class="back-link">← Back to Main Page</a>

<p>🌈 Trip weather forecasts ✈️</p>

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
        <a class="post-link" href="{{ trip.url | relative_url }}">{{ trip.title }}</a>
      </h3>
      <div class="post-excerpt">
        {% if end_ts < today_ts %}✈️ Past trip{% else %}📅 Upcoming{% endif %}
      </div>
      <a href="{{ trip.url | relative_url }}" class="read-more">View Trip →</a>
    </article>
  {% endfor %}
</div>
{% else %}
<p>No trips yet. Check back soon!</p>
{% endif %}
