---
layout: page
permalink: /publications/
title: Publications
description: Published papers and preprints. Project summaries are on the Projects page.
nav: true
nav_order: 2
---

<sup>*</sup> Equal contribution (co-first authors).

## Published Papers

<div class="publications">

{% bibliography --query @*[category=publication] %}

</div>

## Preprints

<div class="publications">

{% bibliography --query @*[category=preprint] --sort none %}

</div>
