---
layout: page
permalink: /publications/
title: "Research & Projects"
description: Publications, research areas, and selected projects.
nav: true
nav_order: 2
---

## Publications

<div class="publications">

{% bibliography %}

</div>

## Research Areas and Projects

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
  <section>
    <h3>Research Areas</h3>

    <h4>AI for Science</h4>
    <ul>
      <li>
        <strong>Energy systems</strong>
        <ul>
          <li><strong>Nuclear:</strong> Informer-based forecasting for intelligent operation and maintenance of advanced nuclear systems; the manuscript <em>Development of Rod-Bundle CHF Correlation Based on Data Augmentation</em> has been submitted to <em>Expert Systems</em>.</li>
          <li><strong>Wind:</strong> <em>A Modularity-Enhanced Echo State Network for Nonlinear Wind Energy Predicting</em> (Energies, 2025).</li>
        </ul>
      </li>
      <li>
        <strong>Medical and neuroscience</strong>
        <ul>
          <li><strong>Dental orthodontics:</strong> intelligent case-retrieval systems.</li>
          <li><strong>Clinical concept editing:</strong> <em>TRACE: Training-time Report-guided and Clinically Ordered Concept Editing</em> (ACMMM 2026, to appear).</li>
          <li><strong>Neural signals:</strong> real-time Spike and EEG signal detection for symptom analysis in rat models.</li>
        </ul>
      </li>
      <li>
        <strong>Industrial and physical intelligence</strong>
        <ul>
          <li><strong>Industrial detection:</strong> FREDNet for surface-defect signal detection, evaluated on NEU-DET and GC-10 with a 4.8% improvement in mAP@0.5.</li>
          <li><strong>Metasurfaces:</strong> deep learning-based inverse design of broadband polarization converters.</li>
        </ul>
      </li>
    </ul>

    <h4>Large Language Models and Generative AI</h4>
    <ul>
      <li><strong>Current focus:</strong> deeply exploring LLM methods and their applications to clinical text and intelligent healthcare systems.</li>
      <li><strong>LLM for medical AI:</strong> TCM symptom-text augmentation and diagnostic analysis, also part of the medical research area above.</li>
      <li><strong>Generative media:</strong> AI video generation and AIGC applications in sports media.</li>
    </ul>

    <h4>Federated Learning</h4>
    <ul>
      <li><strong>Data heterogeneity:</strong> non-IID federated learning across healthcare, finance, and IoT; related review in <em>Expert Systems</em> (2026).</li>
      <li><strong>Semantic distillation:</strong> Frequency-Adaptive Semantic Distillation with semantic topology and dynamic frequency-based weighting; a manuscript is planned for submission to <em>Expert Systems with Applications</em>.</li>
    </ul>

    <h4>Time-Series Learning and Financial AI</h4>
    <ul>
      <li><strong>Financial forecasting:</strong> ReLaMix for delay-robust financial time-series forecasting (arXiv, 2026).</li>
    </ul>
  </section>

  <section>
    <h3>Projects</h3>

    <h4>In Progress</h4>
    <ul>
      <li><strong>Advanced Nuclear System Data Analysis and Predictive Modeling:</strong> developing forecasting methods for advanced nuclear energy systems with Shenzhen University and China General Nuclear Power Group data.</li>
      <li><strong>Dental Orthodontic Intelligent Case Retrieval System:</strong> developing an intelligent case-retrieval system for dental orthodontics.</li>
      <li><strong>Real-Time Spike and EEG Signal Detection:</strong> developing and optimizing real-time electrophysiological signal detection for symptom analysis in rat models.</li>
    </ul>

    <h4>Selected Completed Projects</h4>
    <ul>
      <li><strong>LLM-Driven TCM Symptom Text Augmentation and Diagnostic Analysis:</strong> undergraduate Honors Thesis using a curated TCM dataset, prompt engineering, and fine-tuning; reduced text length by up to 44.1% and improved diagnostic accuracy by up to 28.4%.</li>
      <li><strong>FREDNet:</strong> frequency and decomposed-spatial learning for industrial defect signal detection, including dataset curation, benchmarking, ablation studies, and cross-domain evaluation.</li>
      <li><strong>Federated Learning Under Data Heterogeneity:</strong> research on heterogeneity challenges, cross-domain case studies, and Frequency-Adaptive Semantic Distillation.</li>
      <li><strong>ReLaMix:</strong> residual latency-aware mixing for delay-robust financial time-series forecasting.</li>
      <li><strong>Computational Social Science and Sports Media:</strong> Sep. 2023 - Dec. 2023 research using AI video generation, Python, Tableau, FreeD 3D, volumetric imaging, and AIGC to study sports media and player competitiveness.</li>
    </ul>
  </section>
</div>
