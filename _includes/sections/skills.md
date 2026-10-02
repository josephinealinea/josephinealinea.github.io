<!---
title: Skills
--->

{%- assign s = site.data.strings.en.skills -%}
<!-- Skills Section: rendered from _data/skills.yml -->
<section id="skills" class="section skills-section">
  <div class="section-content">
    <h2 class="section-heading">{{ s.heading }}</h2>
    <div class="skills-grid-cards">
      {%- for cat in site.data.skills %}
      <div class="skills-card" style="--chip-color: {{ cat.color }}">
        <h3 class="skills-card-title"><span aria-hidden="true">{{ cat.icon }}</span> {{ s.categories[cat.id] }}</h3>
        <ul class="skill-chips">
          {%- for item in cat.items %}
          {%- assign scheme = item.url | slice: 0, 8 %}
          <li>
            {%- if scheme == "https://" %}
            <a class="skill-chip" href="{{ item.url }}" target="_blank" rel="noopener noreferrer">{{ item.name }}<span class="visually-hidden"> {{ s.new_tab }}</span></a>
            {%- else %}
            <span class="skill-chip">{{ item.name }}</span>
            {%- endif %}
          </li>
          {%- endfor %}
        </ul>
      </div>
      {%- endfor %}
    </div>
  </div>
</section>
