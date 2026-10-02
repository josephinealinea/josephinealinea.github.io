---
layout: page
permalink: /privacy/
---
{%- assign s = site.data.strings.en.privacy -%}

# {{ s.title }}

{{ s.intro }}

## {{ s.analytics_heading }}

{{ s.analytics_body }} <a href="#" onclick="resetAnalyticsConsent(); return false;">{{ s.analytics_reset }}</a>

## {{ s.contact_heading }}

{{ s.contact_body }}

## {{ s.travel_heading }}

{{ s.travel_body }}

## {{ s.support_heading }}

{{ s.support_body }}

{{ s.contact_me }} [{{ site.email }}](mailto:{{ site.email }})
