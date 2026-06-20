---
layout: page
title: Blog
permalink: /posts/
---

<a href="/" class="back-link">← Back to Main Page</a>

{% if site.posts.size > 0 %}
<div class="post-grid" style="margin-top: 1.5rem;">
  {% for post in site.posts %}
    {% assign date_format = site.minima.date_format | default: "%B %-d, %Y" %}
    <article class="post-card">
      <div class="post-meta">
        <span class="post-date">{{ post.date | date: date_format }}</span>
      </div>
      <h3 class="post-title">
        <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
      </h3>
      {% if site.show_excerpts %}
        <div class="post-excerpt">{{ post.excerpt }}</div>
      {% endif %}
      <a href="{{ post.url | relative_url }}" class="read-more">Read More →</a>
    </article>
  {% endfor %}
</div>
<div class="latest-posts-actions" style="margin-top: 2rem;">
  <a href="{{ "/feed.xml" | relative_url }}" class="latest-posts-button">Subscribe via RSS</a>
  <a href="/#contact-me" class="latest-posts-button secondary">Share Your Thoughts</a>
</div>
{% else %}
<p style="margin-top: 1.5rem;">No posts yet. Check back soon!</p>
{% endif %}
