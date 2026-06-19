---
layout: page
title: Projects
permalink: /projects/
---

<a href="/" class="back-link">← Back to Main Page</a>

<div class="projects-grid">
{% for project in site.data.projects %}
  <div class="project-card">
    <h3>
      {% if project.link and project.link != "" %}
        <a href="{{ project.link }}" target="_blank" rel="noopener">{{ project.title }}</a>
      {% else %}
        {{ project.title }}
      {% endif %}
    </h3>
    <p>{{ project.description }}</p>
    {% if project.tags %}
    <div class="tags">
      {% for tag in project.tags %}<span class="tag">{{ tag }}</span>{% endfor %}
    </div>
    {% endif %}
  </div>
{% endfor %}
</div>

<style>
  .projects-grid { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; }
  .project-card { flex: 1 1 260px; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: #fafafa; }
  .project-card h3 { margin-top: 0; }
  .tag { display: inline-block; background: #eee; border-radius: 4px; padding: 0.15rem 0.5rem; margin: 0.2rem 0.2rem 0 0; font-size: 0.8rem; }

  /* Retro-Game-FF7 theme: same treatment as /travel cards so they
     contrast against the dark page background. */
  body.theme-retro-game .project-card {
    background: rgba(74, 158, 255, 0.12);
    border-color: var(--retro-border);
  }
  body.theme-retro-game .project-card h3 { color: var(--retro-accent); }
  body.theme-retro-game .project-card h3 a { color: var(--retro-accent); }
  body.theme-retro-game .project-card p { color: var(--retro-text); }
  body.theme-retro-game .tag { background: rgba(74, 158, 255, 0.25); color: var(--retro-text); }
  body.theme-retro-game .back-link { color: var(--retro-primary); }
</style>
