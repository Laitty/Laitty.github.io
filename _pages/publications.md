---
layout: page
permalink: /publications/
title: "Research & Projects"
description: Publications, preprints, research areas, and selected projects.
nav: true
nav_order: 2
visitor_map: true
---

## Publications

<div class="publications">

{% bibliography --query @*[category=publication] %}

</div>

## Preprints

<div class="publications">

{% bibliography --query @*[category=preprint] --sort none %}

</div>

## Research & Project Experience

My research connects reliable learning and model evaluation with human–AI interaction and applied machine learning.

<p class="proj-affil-note">Affiliation logos: rightmost = my home institution; any to the left = primary collaborator(s).</p>

### Learning Systems and Human–AI Interaction

#### Unlearning, Context Effects, and Model Evaluation

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Choice2Seq** — <a class="proj-venue" href="https://arxiv.org/abs/2610.16191">arXiv</a>. Measures whether a model that selects the correct complete answer can also construct it through local sequential decisions; Sequence Composition Rate tracks retention of those correct choices under serial construction. Jev retains 33.0% and 2.1% of Native-correct arithmetic and lexical items under Serial despite 97.1% and 99.5% selection accuracy. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Which Differences Matter?** — <a class="proj-venue" href="https://arxiv.org/abs/2610.30045">arXiv</a>. Controlled tests of which rule and information changes guide decision-model answers: transfer on semantically separated rules, joint reliability via crossed rule–state tests, and directed use of table values versus mappings. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**When Does Agreement Add Information?** — Sensor and document verification with exact reference probabilities, varying copying versus independence so agreeing answers should update differently; compares final probability accuracy with subsequent update correctness. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Reasoning after Unlearning** — Evaluates original, unlearned, and target-excluded retrained Llama checkpoints on TOFU, separating context effects, answer exposure, and use of supplied answer information through matched controls, answer masking, and identity substitution. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Multimodal unlearning** — Auxiliary supervision for unlearning in multimodal models. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Model selection feedback** — Misleading comparison feedback in model selection. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>

#### Human–AI Interaction and LLM Judges

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**When Outputs Become Outcomes** — Distinguishes agreement with an assessment, acceptance of a judge's authority, and subsequent action in livestream games and academic reviewing; observational, interview, and presentation-comparison methods examine source attribution and human mediation. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>

#### Federated and Heterogeneous Learning

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSocratic** — Verifiable questioning for federated language models. <span class="proj-advisor">Advisors: Prof. Qilei Li and Prof. David Camacho</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**After Cooperation Is Learned** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01630">arXiv</a> preprint (2026). Gradient routing and optimizer-dependent maintenance of learned cooperation in multi-agent reinforcement learning. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**MOSAIC** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01625">arXiv</a> preprint (2026). Margin-oriented semantic–appearance interaction correction beyond domain-level adaptation for personalized federated vision–language models. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSAP** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01638">arXiv</a> preprint (2026). Structured adaptive partitioning for federated learning on multi-domain heterogeneous edge devices. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Data heterogeneity survey** — <span class="proj-venue">Expert Systems</span> (2026). Led the survey framework on federated learning under non-IID and heterogeneous data, covering healthcare, finance, and IoT case studies; also designed frequency-adaptive semantic distillation with semantic topology and dynamic frequency-based weighting. <span class="proj-advisor">Advisors: Prof. Qilei Li and Prof. David Camacho</span>

### Applied Machine Learning

#### Healthcare and Clinical Language

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/smu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**TRACE** — accepted at <span class="proj-venue">ACM MM 2026</span>. Report supervision during training supports concept-based breast ultrasound diagnosis with image-only inference, in collaboration with Southern Medical University. The work connects BI-RADS concepts, structured clinical descriptions, and concept-edit distillation. <span class="proj-advisor">Advisors: Prof. Qilei Li and Prof. Zhenyuan Ning</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/pku.svg' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Spike and EEG detection** — RT-DETR and spatiotemporal graph methods for juvenile and adult rat electrophysiology data, in collaboration with Peking University; algorithm development and signal analysis for symptom studies.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**LLM-based TCM symptom-text augmentation** — independent undergraduate honors thesis combining dataset curation, prompting, and fine-tuning. Thesis experiments reduced text length by up to 44.1%, increased terminology tokens 4.4-fold, and achieved diagnostic accuracy of up to 81.3%. <span class="proj-advisor">Advisor: Prof. Yi Yang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/fjmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Dental orthodontic case retrieval** — an ongoing intelligent case-retrieval project in collaboration with Fujian Medical University.

#### Industrial Inspection and Physical Inverse Design

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FREDNet** — <span class="proj-venue">ICASSP 2026</span>. Frequency and decomposed-spatial learning with attention fusion for surface-defect detection; contributions include data curation, training, benchmarking, ablations, and cross-domain evaluation on NEU-DET and GC-10, with a reported 4.8% improvement in mAP@0.5. <span class="proj-advisor">Advisor: Lecturer Dr. Hongjuan Zhang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Metasurface inverse design** — <span class="proj-venue">AIP Advances</span> (2025). CNN–Transformer regression using polarization-conversion spectra and Gaussian-noise augmentation; reported mean MSE of 0.00331. <span class="proj-advisor">Advisor: Prof. Xiaodong He</span>

#### Time-Series Forecasting and Energy Systems

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Artificial Intelligence for Critical Heat Flux in Energy Systems: From Predictive Accuracy to Engineering Use** <span class="proj-meta">(Shenzhen University, 2025.10–present)</span> — review proposal sent; contacting <span class="proj-venue">Energy</span> for an invitation. <span class="proj-advisor">Advisor: Prof. Bo Pang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Mamba-In** <span class="proj-meta">(Shenzhen University RA, 2025.10–2026.5)</span> — Hybrid Mamba and Informer-style ProbSparse attention for long-horizon nuclear sensor forecasting, residual-based fault detection, and signal reconstruction. <span class="proj-advisor">Advisor: Prof. Bo Pang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**ReLaMix** — <a class="proj-venue" href="https://arxiv.org/abs/2603.20869">arXiv</a> preprint (2026). Residual bottleneck mixing for delayed financial observations, evaluated on second-resolution PAXGUSDT and BTCUSDT using non-overlapping temporal segments and delay-robustness benchmarks. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Wind energy prediction** — <span class="proj-venue">Energies</span> (2025). Modular echo state networks, clustering, and training on turbine data; reported best R² of 0.9905. <span class="proj-advisor">Advisor: Prof. Zhili Zhao</span>

#### Earlier Interdisciplinary Work

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Computational social science and sports media** <span class="proj-meta">(Sep.–Dec. 2023)</span> — AI video generation, Python, Tableau, FreeD 3D, volumetric imaging, and AIGC for studying sports media and player competitiveness. <span class="proj-advisor">Advisor: Lecturer Dr. Jian Zhan</span>

## Visit history

<div
  id="visitor-map"
  class="visitor-map-card"
  data-map="{{ '/assets/img/visitor-world.svg' | relative_url }}"
>
  <div class="visitor-map-stage"></div>
  <p class="visitor-map-note">Loading visit history…</p>
</div>
