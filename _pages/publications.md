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

<p class="proj-affil-note">Logos on each entry: the rightmost is my home institution; any to its left are the main collaborating institutions.</p>

### AI Evaluation and Analysis

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**ExposureBench: Knowing When to Update** — Evaluates when web evidence selection should change a model's probability and when disclosure makes the same policy change redundant. Crosses selection policies with information disclosure using exact finite-population targets and TREC DL retrieval with BM25 and Qwen reranking. Measures probability accuracy, informative updates, and conditional policy drift separately, using repeated calls and decision replay to assess noise and downstream consequences. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Choice2Seq** — <a class="proj-venue" href="https://arxiv.org/abs/2610.16191">arXiv 2026</a> Tests whether a model that selects the correct complete answer can also construct it through local sequential decisions. Sequence Composition Rate tracks that retention under serial construction: Jev keeps 33.0% and 2.1% of Native-correct arithmetic and lexical items despite 97.1% and 99.5% selection accuracy. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Which Differences Matter?** — <a class="proj-venue" href="https://arxiv.org/abs/2610.30045">arXiv 2026</a> Controlled tests of which rule and information changes guide decision-model answers: transfer on semantically separated rules, joint reliability on crossed rule–state tests, and directed use of table values versus mappings on Jev. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**When Does Agreement Add Information?** — Sensor and document verification with exact reference probabilities, varying copying versus independence so agreeing answers should update differently, then scoring both final probability accuracy and subsequent update correctness. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Reasoning after Unlearning** — Evaluates original, unlearned, and target-excluded retrained Llama checkpoints on TOFU, separating context effects, answer exposure, and use of supplied answer information with matched controls, masking, and identity substitution. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Multimodal unlearning** — Auxiliary supervision for unlearning in multimodal models, using extra training signals while target information is being removed. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Model selection feedback** — Misleading comparison feedback in model selection, studying how distorted comparisons affect which model is chosen. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**When Outputs Become Outcomes** — Distinguishes agreement with an assessment, acceptance of a judge's authority, and subsequent action in livestream games and academic reviewing, using observational, interview, and presentation-comparison methods to examine source attribution and human mediation. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>

### Applied Machine Learning

#### Clinical and dental

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/smu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**TRACE** — <span class="proj-venue">ACM MM 2026</span> Uses report supervision during training so that concept-based breast-ultrasound diagnosis needs only the image at inference, linking BI-RADS concepts, structured clinical descriptions, and concept-edit distillation; joint work with Southern Medical University. <span class="proj-advisor">Advisors: Prof. Qilei Li & Prof. Zhenyuan Ning</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/pku.svg' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Spike and EEG detection** — RT-DETR and spatiotemporal graph methods for detecting spikes and EEG events in juvenile and adult rat electrophysiology, developed with Peking University for algorithm work and signal analysis in symptom studies.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**LLM-based symptom-text augmentation for Traditional Chinese Medicine (TCM)** — Independent undergraduate honors thesis covering dataset curation, prompting, and fine-tuning; experiments cut text length by up to 44.1%, increased terminology tokens 4.4-fold, and reached up to 81.3% diagnostic accuracy. <span class="proj-advisor">Advisor: Prof. Yi Yang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/fjmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Dental orthodontic case retrieval** — An ongoing case-retrieval project for orthodontic records, with Fujian Medical University.
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Oral Benchmark** — A benchmark built from dental and orthodontic cases.

#### Inspection and inverse design

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FREDNet** — <span class="proj-venue">ICASSP 2026</span> Frequency and decomposed-spatial learning with attention fusion for surface-defect detection, covering data curation, training, benchmarking, ablations, and cross-domain tests on NEU-DET and GC-10, with a 4.8% gain in mAP@0.5. <span class="proj-advisor">Advisor: Lecturer Dr. Hongjuan Zhang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Metasurface inverse design** — <span class="proj-venue">AIP Advances 2025</span> CNN–Transformer regression from polarization-conversion spectra with Gaussian-noise augmentation, reporting a mean MSE of 0.00331 on the design task. <span class="proj-advisor">Advisor: Prof. Xiaodong He</span>

#### Forecasting and energy

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-collab" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Artificial Intelligence for Critical Heat Flux in Energy Systems: From Predictive Accuracy to Engineering Use** <span class="proj-meta">(Shenzhen University, Oct. 2025 – present)</span> — Review proposal sent; now contacting <span class="proj-venue">Energy</span> for an invitation to submit the survey. <span class="proj-advisor">Advisor: Prof. Bo Pang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/szu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Mamba-In** <span class="proj-meta">(Research assistant, College of Physics and Optoelectronic Engineering, Shenzhen University, Oct. 2025 – May 2026)</span> — Combines Mamba with Informer-style ProbSparse attention for long-horizon forecasting, residual-based fault detection, and signal reconstruction on high-reliability nuclear-sensor monitoring streams. <span class="proj-advisor">Advisor: Prof. Bo Pang</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**ReLaMix** — <a class="proj-venue" href="https://arxiv.org/abs/2603.20869">arXiv 2026</a> Residual bottleneck mixing for delayed financial observations, evaluated on second-resolution PAXGUSDT and BTCUSDT using non-overlapping temporal segments and delay-robustness benchmarks. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Wind energy prediction** — <span class="proj-venue">Energies 2025</span> Modular echo state networks with clustering, trained on turbine data; best reported R² of 0.9905. <span class="proj-advisor">Advisor: Prof. Zhili Zhao</span>

### Federated Learning

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/cmu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSocratic** — Verifiable questioning for federated language models, so questioning steps in the federated setting can be checked. <span class="proj-advisor">Advisors: Prof. Qilei Li & Prof. David Camacho</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**After Cooperation Is Learned** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01630">arXiv 2026</a> Gradient routing and optimizer-dependent maintenance of learned cooperation once multi-agent reinforcement learning has already acquired it. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**MOSAIC** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01625">arXiv 2026</a> Margin-oriented semantic–appearance interaction correction for personalized federated vision–language models, going beyond domain-level adaptation. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**FedSAP** — <a class="proj-venue" href="https://arxiv.org/abs/2610.01638">arXiv 2026</a> Structured adaptive partitioning for federated learning on multi-domain heterogeneous edge devices. <span class="proj-advisor">Advisor: Prof. Qilei Li</span>
- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Data heterogeneity survey** — <span class="proj-venue">Expert Systems 2026</span> Led the survey framework on federated learning under non-IID and heterogeneous data, covering healthcare, finance, and IoT, and designed frequency-adaptive semantic distillation with semantic topology and dynamic frequency-based weighting. <span class="proj-advisor">Advisors: Prof. Qilei Li & Prof. David Camacho</span>

### Early Research in Social Computing

- <span class="proj-affils" aria-hidden="true"><img class="proj-affil is-home" src="{{ '/assets/img/affiliations/lzu.png' | relative_url }}" alt="" width="96" height="96" decoding="async"></span>**Social computing in sports media** <span class="proj-meta">(Sep. – Dec. 2023)</span> — Studied sports media and player competitiveness using AI video generation, AIGC, FreeD 3D, volumetric imaging, Python, and Tableau. <span class="proj-advisor">Advisor: Lecturer Dr. Jian Zhan</span>

## Visit history

<div
  id="visitor-map"
  class="visitor-map-card"
  data-map="{{ '/assets/img/visitor-world.svg' | relative_url }}"
>
  <div class="visitor-map-stage"></div>
  <p class="visitor-map-note">Loading visit history…</p>
</div>
