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

{% bibliography --query @*[category=preprint] %}

</div>

## Research & Project Experience

My research connects reliable learning and model evaluation with human–AI interaction and applied machine learning.

### Learning Systems and Human–AI Interaction

#### Federated and Heterogeneous Learning

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Data heterogeneity survey** — _Expert Systems_ (2026). Led the survey framework on federated learning under non-IID and heterogeneous data, covering healthcare, finance, and IoT case studies; also designed frequency-adaptive semantic distillation with semantic topology and dynamic frequency-based weighting. Advisors: Prof. Qilei Li and Prof. David Camacho.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSAP** — arXiv preprint (2026). Structured adaptive partitioning for federated learning on multi-domain heterogeneous edge devices. [arXiv:2610.01638](https://arxiv.org/abs/2610.01638). Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**MOSAIC** — arXiv preprint (2026). Margin-oriented semantic–appearance interaction correction beyond domain-level adaptation for personalized federated vision–language models. [arXiv:2610.01625](https://arxiv.org/abs/2610.01625). Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**After Cooperation Is Learned** — arXiv preprint (2026). Gradient routing and optimizer-dependent maintenance of learned cooperation in multi-agent reinforcement learning. [arXiv:2610.01630](https://arxiv.org/abs/2610.01630). Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSocratic** — submitted to ICLR 2027. Verifiable questioning for federated language models. Advisors: Prof. Qilei Li and Prof. David Camacho.

#### Unlearning, Context Effects, and Model Evaluation

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Reasoning after Unlearning** — first author; submitted to ICLR 2027. Evaluates original, unlearned, and target-excluded retrained Llama checkpoints on TOFU, separating context effects, answer exposure, and use of supplied answer information through matched controls, answer masking, and identity substitution. Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Multimodal unlearning** — co-authored; submitted to ICLR 2027. Auxiliary supervision for unlearning in multimodal models. Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Model selection feedback** — co-authored; submitted to ICLR 2027. Misleading comparison feedback in model selection. Advisor: Prof. Qilei Li.

#### Human–AI Interaction and LLM Judges

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**When Outputs Become Outcomes** — first author; submitted to CHI 2027. Distinguishes agreement with an assessment, acceptance of a judge's authority, and subsequent action in livestream games and academic reviewing; observational, interview, and presentation-comparison methods examine source attribution and human mediation. Advisor: Prof. Qilei Li.

### Applied Machine Learning

#### Healthcare and Clinical Language

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/smu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**TRACE** — accepted at ACM MM 2026. Report supervision during training supports concept-based breast ultrasound diagnosis with image-only inference, in collaboration with Southern Medical University. The work connects BI-RADS concepts, structured clinical descriptions, and concept-edit distillation. Advisors: Prof. Qilei Li and Prof. Zhenyuan Ning.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/pku.svg' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Spike and EEG detection:** RT-DETR and spatiotemporal graph methods for juvenile and adult rat electrophysiology data, in collaboration with Peking University; algorithm development and signal analysis for symptom studies.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**LLM-based TCM symptom-text augmentation:** independent undergraduate honors thesis combining dataset curation, prompting, and fine-tuning. Thesis experiments reduced text length by up to 44.1%, increased terminology tokens 4.4-fold, and achieved diagnostic accuracy of up to 81.3%. Advisor: Prof. Yi Yang.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/fjmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Dental orthodontic case retrieval:** an ongoing intelligent case-retrieval project in collaboration with Fujian Medical University.

#### Industrial Inspection and Physical Inverse Design

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FREDNet** — ICASSP 2026. Frequency and decomposed-spatial learning with attention fusion for surface-defect detection; contributions include data curation, training, benchmarking, ablations, and cross-domain evaluation on NEU-DET and GC-10, with a reported 4.8% improvement in mAP@0.5. Advisor: Lecturer Dr. Hongjuan Zhang.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Metasurface inverse design** — _AIP Advances_ (2025). CNN–Transformer regression using polarization-conversion spectra and Gaussian-noise augmentation; reported mean MSE of 0.00331. Advisor: Prof. Xiaodong He.

#### Time-Series Forecasting and Energy Systems

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Artificial Intelligence for Critical Heat Flux in Energy Systems: From Predictive Accuracy to Engineering Use** (Shenzhen University RA, 2025.10–2026.5) — review in preparation for submission to _Energy_. Advisor: Prof. Bo Pang.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Mamba-In** — co-first author; under review at EAAI. Hybrid Mamba and Informer-style ProbSparse attention for long-horizon nuclear sensor forecasting, residual-based fault detection, and signal reconstruction (Shenzhen University RA, 2025.10–2026.5). Advisor: Prof. Bo Pang.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**ReLaMix** — arXiv preprint (2026). Residual bottleneck mixing for delayed financial observations, evaluated on second-resolution PAXGUSDT and BTCUSDT using non-overlapping temporal segments and delay-robustness benchmarks. Advisor: Prof. Qilei Li.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Wind energy prediction** — _Energies_ (2025). Modular echo state networks, clustering, and training on turbine data; reported best R² of 0.9905. Advisor: Prof. Zhili Zhao.

#### Earlier Interdisciplinary Work

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Computational social science and sports media** (Sep.–Dec. 2023): AI video generation, Python, Tableau, FreeD 3D, volumetric imaging, and AIGC for studying sports media and player competitiveness. Advisor: Lecturer Dr. Jian Zhan.

## Visit history

<div
  id="visitor-map"
  class="visitor-map-card"
  data-api="https://extendsclass.com/api/json-storage/bin/feeabdc"
  data-mirror="https://extendsclass.com/api/json-storage/bin/ddfbcda"
  data-history="{{ '/assets/json/visit-history.json' | relative_url }}"
  data-map="{{ '/assets/img/visitor-world.svg' | relative_url }}"
>
  <div class="visitor-map-stage"></div>
  <p class="visitor-map-note">Loading visit history…</p>
</div>
