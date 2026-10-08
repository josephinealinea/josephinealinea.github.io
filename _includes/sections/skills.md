<!---
title: Skills
--->

{%- assign s = site.data.strings.en.skills -%}
{%- assign n = 0 -%}
<!-- Skills Section: periodic table rendered from _data/skills.yml.
     One column per category; tiles are numbered in reading order. -->
<section id="skills" class="section skills-section">
  <div class="section-content">
    <h2 class="section-heading">{{ s.heading }}</h2>
    <div class="periodic">
      {%- for cat in site.data.skills %}
      <div class="periodic-group"{% if cat.columns %} style="--span: {{ cat.columns | plus: 0 }}"{% endif %}>
        <h3 class="periodic-title"><span aria-hidden="true">{{ cat.icon }}</span>{{ s.categories[cat.id] }}</h3>
        <ol class="periodic-tiles">
          {%- for item in cat.items %}
          {%- assign n = n | plus: 1 %}
          {%- assign symbol = item.symbol | default: item.name | slice: 0, 2 %}
          {%- assign scheme = item.url | slice: 0, 8 %}
          <li>
            {%- if scheme == "https://" %}
            <a class="element" href="{{ item.url }}" target="_blank" rel="noopener noreferrer"><span class="element-num" aria-hidden="true">{{ n }}</span><span class="element-sym" aria-hidden="true">{{ symbol }}</span><span class="element-name">{{ item.name }}<span class="visually-hidden"> {{ s.new_tab }}</span></span></a>
            {%- else %}
            <span class="element"><span class="element-num" aria-hidden="true">{{ n }}</span><span class="element-sym" aria-hidden="true">{{ symbol }}</span><span class="element-name">{{ item.name }}</span></span>
            {%- endif %}
          </li>
          {%- endfor %}
        </ol>
      </div>
      {%- endfor %}
    </div>
  </div>
</section>
