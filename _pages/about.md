---
layout: about
title: About
permalink: /
description: >-
  Tianyou (Theo) Lai, MS student in Artificial Intelligence Systems Management at Carnegie Mellon University. Research in reliable learning, model evaluation, federated learning, and applied machine learning.
travel_globe: true
nav: false
subtitle: >
  MS in Artificial Intelligence Systems Management
hero_eyebrow: Carnegie Mellon University
hero_lede: Connecting reliable AI research with applied systems, informed by industry work in data engineering, data science and analytics, quantitative research, and product development.

profile:
  align: right
  image:
  image_circular: false # crops the image to make it circular
  # Email now sits under the intro (see the intro-contact line below), rendered by
  # al_email_protect so the page never contains the plain address.

technical_skills:
  - kind: Programming
    items: [Python, PyTorch, TensorFlow, Java, SQL, C/C++, HTML, CSS, JavaScript]
  - kind: Visualization
    items: [Tableau, ECharts]
  - kind: Infrastructure
    items: [Linux, Docker, Kubernetes, OpenStack, Ceph, Hadoop, HDFS, Hive, Spark]

selected_papers: false
social: true # includes social icons at the bottom of the page

announcements:
  enabled: false # includes a list of news items
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: false
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts
---

I am Tianyou (Theo) Lai, an MS student in Artificial Intelligence Systems Management at Carnegie Mellon University, originally from Beijing. My research connects reliable learning systems, model evaluation, and human–AI interaction with applied machine learning in healthcare, industrial inspection, metasurface inverse design, forecasting, and energy systems.

In research, I work across the whole pipeline, from dataset preparation and model design to training and experimental evaluation. In industry, I have interned in startup data science, data engineering, quantitative research, consulting analytics, and product data.

<p class="intro-contact"><i class="fa-solid fa-envelope" aria-hidden="true"></i>{% al_email_protect_link site.data.socials.email %}<span class="intro-contact-hint"></span></p>

## Research Interests

- <span class="item-label">Model evaluation</span> Whether a model's answers, probabilities, and decisions hold up under controlled tests. <span class="interest-works">ExposureBench · Choice2Seq · Which Differences Matter?</span>
- <span class="item-label">Applied machine learning</span> Medical and dental AI, industrial defect detection, and forecasting for finance and energy. <span class="interest-works">Oral Benchmark · TRACE · FREDNet · ReLaMix</span>
- <span class="item-label">Machine unlearning</span> What unlearning actually removes, and what a model can still reason about afterward. <span class="interest-works">Reasoning after Unlearning · Multimodal unlearning</span>
- <span class="item-label">Human–AI interaction</span> How model outputs turn into decisions that people accept and act on. <span class="interest-works">When Outputs Become Outcomes</span>

## Education

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span><span class="edu-oneline">**Carnegie Mellon University** — MS in Artificial Intelligence Systems Management <span class="proj-meta">(Aug. 2026 – Dec. 2027, expected; GPA 4/4)</span></span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Lanzhou University** — BS in Data Science & Big Data Technology <span class="proj-meta">(Sep. 2021 – Jul. 2025; GPA 87.34/100)</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/ut.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**The University of Texas at Austin** — Exchange Program in Software Engineering <span class="proj-meta">(Jan. – Feb. 2024; GPA 4/4)</span>

## Selected Publications {#publications}

{% bibliography --query @*[category=publication && selected=true] --group_by none --bibliography_list_tag ul --template about_cite %}

<sup>*</sup> (co-)first author.

Full author lists and preprints are on the [Publications]({{ '/publications/' | relative_url }}) page, and project summaries are on the [Projects]({{ '/projects/' | relative_url }}) page.

## Professional Experience

- **Research Assistant, College of Physics and Optoelectronic Engineering, Shenzhen University** <span class="proj-meta">(Hybrid, Oct. 2025 – May 2026)</span>
  - Cleaned and preprocessed nuclear-sensor time series for high-reliability online condition monitoring; prepared inputs for residual-based fault detection, signal reconstruction, and long-horizon forecasting.
  - Built **Mamba-In**, which combines Mamba sequence modeling with Informer-style ProbSparse attention for long-horizon sensor forecasting.
  - Started an ongoing review of AI for critical heat flux (CHF) that synthesizes prediction, uncertainty, validation, and engineering-use criteria (proposal sent; contacting _Energy_ for an invitation).
- **Data Science Intern, Sichuan DeepGraph Intelligent Technology** <span class="proj-meta">(Chengdu, Sep. 2024 – Feb. 2025)</span>
  - Built Python cleaning and consistency checks to prepare datasets for analysis and model development.
  - Queried financial datasets and graph relationships in Ultipa XAI to support modeling and the optimization of data-analysis algorithms; helped deploy these workflows on OpenStack.
- **Data Engineer Intern, Lanzhou Bronze Ding Intelligent Technology** <span class="proj-meta">(Lanzhou, Mar. 2024 – Sep. 2024)</span>
  - Curated 20+ datasets and labeled 10,000+ records with Python and SQL; produced seven Matplotlib/Seaborn reports to visualize data, check processed outputs, and document results.
  - Deployed MySQL and Hadoop/Spark on a private cloud for large-scale storage and batch processing.
- **Quantitative Research Intern, Guotai Junan Futures** <span class="proj-meta">(Remote, Mar. 2024 – Apr. 2024)</span>
  - Extended a Python trading system with position locking, closing, and batch orders across instruments and exchanges.
  - Integrated and debugged the C++/Python CTP API in the SimNow environment; implemented TWAP/VWAP execution, and generated and filtered technical indicators with TA-Lib.
- **Tax and Business Consulting Intern, Zhongzheng Tiantong CPA Tax Department** <span class="proj-meta">(Beijing, Jul. 2023 – Sep. 2023)</span>
  - Cleaned financial and market data with Python and SQL.
  - Prepared Excel and Tableau analyses of client financial performance, business risk, and market trends, drawn from publicly available cases, to support tax and business consulting.
- **Product Data Engineer Intern, Feitian Technologies** <span class="proj-meta">(Beijing, Jul. 2022 – Jan. 2023)</span>
  - Maintained hardware-product databases with Python and SQL; reviewed C/C++ code and tested features for an intelligent password system, supporting functional verification and hardware performance testing.
  - Conducted 30+ product performance tests and prepared summaries of 10+ blockchain reports.

## Service, Skills, and Honors

- <span class="item-label">Conference reviewer</span>
  - ACM The Web Conference (WWW) 2027 <span class="proj-meta">(Main Track)</span>
  - IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP) 2027 <span class="proj-meta">(Main Track: Machine Learning for Signal Processing [ML]; Image, Video and Multidimensional Signal Processing [IV])</span>
  - ACM International Conference on Multimedia (ACM MM) 2026 <span class="proj-meta">(Main Track & Dataset Track)</span>
  - International Joint Conference on Neural Networks (IJCNN) 2026 <span class="proj-meta">(Main Track)</span>
- <span class="item-label">Journal reviewer</span>
  - IEEE Open Journal of Signal Processing (OJSP)
- <span class="item-label">Memberships</span> ACM (2026–present); IEEE (2025–present).
- <span class="item-label">Technical skills</span>{% for group in page.technical_skills %}<span class="skill-row"><span class="skill-kind">{{ group.kind }}</span>{% for skill in group.items %}<span class="skill">{{ skill }}</span>{% endfor %}</span>{% endfor %}
- <span class="item-label">Languages</span> Mandarin (native); English.
- <span class="item-label">Honors</span> Lanzhou University academic, internship, and international-exchange scholarships; undergraduate honors thesis (2025); three-time university basketball champion (2022–23, 2023–24, 2024–25).

## Interests

- <span class="item-label">Basketball</span> taking a break from playing while I recover from knee surgery.
- <span class="item-label">Billiards</span> enjoying both the hot streaks and the cold spells.
- <span class="item-label">Fun facts</span> I have visited nearly every province in China and explored Europe on two two-week trips. I have also completed several high-altitude hikes and climbs above 5,000 m, though a knee injury cost me the chance to attempt a 7,000 m peak. My travel wish list keeps growing.

<div class="travel-globe-card">
  <div class="travel-globe-stage">
    <div
      id="travel-globe"
      class="travel-globe"
      data-regions="{{ '/assets/json/travel-regions.json' | relative_url | bust_file_cache }}"
      data-flights="{{ '/assets/json/travel-flights.json' | relative_url | bust_file_cache }}"
    ></div>
    <div class="travel-globe-status">Loading map…</div>
  </div>
  <div class="travel-globe-legend">
    <span class="travel-chip travel-chip-visited">Visited</span>
    <span class="travel-chip travel-chip-flight">Blue takeoff → Gold landing</span>
    <span class="travel-globe-hint">Drag to spin · pinch or scroll to zoom</span>
  </div>
  <ul class="travel-globe-stats">
    <li>
      <span class="travel-globe-stat-value">41 / 46</span>
      <span class="travel-globe-stat-label">Cities / Airports</span>
    </li>
    <li>
      <span class="travel-globe-stat-value">313h 44m</span>
      <span class="travel-globe-stat-label">Flight time</span>
    </li>
    <li>
      <span class="travel-globe-stat-value">220,042</span>
      <span class="travel-globe-stat-label">Kilometers</span>
    </li>
    <li>
      <span class="travel-globe-stat-value">123</span>
      <span class="travel-globe-stat-label">Flights</span>
    </li>
  </ul>
</div>
