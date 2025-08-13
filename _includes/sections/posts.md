<!---
title: Blog
--->

<!-- Blog Section -->
<section id="posts" class="section latest-posts-section">
  <div class="section-content">
    <h2 class="section-heading">Latest Posts</h2>
    {%- if site.posts.size > 0 -%}
      <div class="post-grid">
        {%- for post in site.posts limit:6 -%}
        <article class="post-card">
          <div class="post-meta">
            {%- assign date_format = site.minima.date_format | default: "%B %-d, %Y" -%}
            <span class="post-date">{{ post.date | date: date_format }}</span>
          </div>
          <h3 class="post-title">
            <a class="post-link" href="{{ post.url | relative_url }}">
              {{ post.title | escape }}
            </a>
          </h3>
          {%- if site.show_excerpts -%}
            <div class="post-excerpt">{{ post.excerpt }}</div>
          {%- endif -%}
          <a href="{{ post.url | relative_url }}" class="read-more">Read More →</a>
        </article>
        {%- endfor -%}
      </div>
      <div class="latest-posts-actions">
        <a href="{{ "/feed.xml" | relative_url }}" class="latest-posts-button">Subscribe via RSS</a>
        <a href="#contact-me" class="latest-posts-button secondary">Share Your Thoughts</a>
      </div>
    {%- else -%}
      <p class="no-posts">No posts yet. Check back soon!</p>
    {%- endif -%}
  </div>
</section>
