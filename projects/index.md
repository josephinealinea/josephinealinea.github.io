---
layout: page
title: Projects
permalink: /projects/
---

<a href="/" class="back-link">← Back to Main Page</a>

<p class="projects-source">Pulled from <a href="https://github.com/josephinealinea" target="_blank" rel="noopener">GitHub</a></p>

<div class="post-grid" id="github-projects" style="margin-top: 1.5rem;">
  <p class="projects-loading">Loading projects from GitHub…</p>
</div>

<script src="{{ '/assets/js/projects-github.js' | relative_url }}"></script>

<style>
  /* color explicit at 4.95:1 against the #eee background — it was
     otherwise inheriting .post-meta's #828282 (3.31:1, below the 4.5:1
     minimum for this font-size). */
  .tag { display: inline-block; background: #eee; color: #666; border-radius: 4px; padding: 0.15rem 0.5rem; margin: 0.1rem 0.1rem 0 0; font-size: 0.8rem; }
  .projects-source { color: #666; font-size: 0.9rem; margin-top: 0.5rem; }
  .projects-error { color: #a33; }
  body.theme-retro-game .tag { background: rgba(74, 158, 255, 0.25); color: var(--retro-text); }
  body.theme-retro-game .projects-source { color: var(--retro-text); }
  body.theme-retro-game .back-link { color: var(--retro-primary); }
</style>
