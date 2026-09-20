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

## Research Experience

**Research Assistant, Shenzhen University** · Oct. 2025 - May 2026

Nuclear sensor monitoring and energy-system AI with Shenzhen University.

- **Artificial Intelligence for Critical Heat Flux in Energy Systems: From Predictive Accuracy to Engineering Use** — review in preparation for submission to _Energy_.
- **Mamba-In: An Informer-based Industrial Long-Term Time-Series Prediction for High-Reliability Sensor Online Monitoring in Nuclear Applications** — under review at EAAI. Periodic manual calibration remains the most widely used sensor maintenance approach in nuclear applications, but it is labor-intensive, depends on refueling outages, and cannot detect sensor degradation between calibration intervals. Although online monitoring and signal reconstruction have been studied for nuclear power plants, many approaches focus on calibration verification, short-term reconstruction, or accident-parameter prediction, rather than on long-horizon multivariate virtual sensing for condition-based maintenance. This paper proposes a hybrid analytical-redundancy model for online monitoring that performs both nuclear sensor forecasting and fault detection. The model formulates virtual sensing as long-horizon multivariate forecasting, where predicted trajectories are used to generate residuals for fault detection and to provide reconstructed signals when physical sensors become unreliable. Architecturally, the proposed model combines a Mamba-based selective state-space branch for local temporal evolution with an Informer-style ProbSparse attention branch for long-range cross-sensor dependency modeling. An adaptive gating module dynamically fuses the two branches, enabling the model to balance degradation-sensitive local patterns and system-level coupling under different input conditions. Experiments on a benchmark nuclear reactor dataset collected from a primary loop mock-up facility cover four multi-step forecasting settings and three simulated sensor fault types, with fault-injection analysis performed on representative mass-flow-meter and thermocouple channels. Compared with existing methods, the proposed model achieves the best overall forecasting performance. Ablation and fault-injection results confirm the complementary benefits of the Mamba and attention branches and show that the model can support residual-based detection of representative sensor faults, including constant bias, linear drift, and additive noise. These results indicate that the proposed model is a promising virtual-sensor framework for online sensor monitoring and can support the transition from periodic manual calibration to condition-based maintenance in nuclear applications.

My other research connects reliable learning and model evaluation with human–AI interaction and applied machine learning.

### Learning Systems and Human–AI Interaction

#### Federated and Heterogeneous Learning

Led the framework of a survey on data heterogeneity published in _Expert Systems_ (2026), alongside frequency-adaptive semantic distillation research. Recent co-authored submissions address structured partitioning for heterogeneous edge devices (FedSAP, AAAI 2027), semantic–appearance correction for personalized federated vision–language models (AAAI 2027), and verifiable questioning for federated language models (FedSocratic, ICLR 2027).

#### Unlearning, Context Effects, and Model Evaluation

**Reasoning after Unlearning** — first author; submitted to ICLR 2027. This study evaluates original, unlearned, and target-excluded retrained Llama checkpoints on TOFU, separating context effects, answer exposure, and use of supplied answer information through matched controls, answer masking, and identity substitution. Related co-authored ICLR 2027 submissions examine auxiliary supervision in multimodal unlearning and misleading comparison feedback in model selection.

#### Human–AI Interaction and LLM Judges

**When Outputs Become Outcomes** — first author; submitted to CHI 2027. The study distinguishes agreement with an assessment, acceptance of a judge's authority, and subsequent action in livestream games and academic reviewing. Observational, interview, and presentation-comparison methods examine source attribution and human mediation.

#### Collaborative Multi-Agent Reinforcement Learning Research

Co-authored an AAAI 2027 submission on gradient routing and optimizer-dependent maintenance of learned cooperation.

### Applied Machine Learning

#### Healthcare and Clinical Language

- **TRACE** — accepted at ACM MM 2026. Report supervision during training supports concept-based breast ultrasound diagnosis with image-only inference. The work connects BI-RADS concepts, structured clinical descriptions, and concept-edit distillation.
- **Spike and EEG detection:** RT-DETR and spatiotemporal graph methods for juvenile and adult rat electrophysiology data, in collaboration with Peking University; algorithm development and signal analysis for symptom studies.
- **LLM-based TCM symptom-text augmentation:** independent undergraduate honors thesis combining dataset curation, prompting, and fine-tuning. Thesis experiments reduced text length by up to 44.1%, increased terminology tokens 4.4-fold, and achieved diagnostic accuracy of up to 81.3%.
- **Dental orthodontic case retrieval:** an ongoing intelligent case-retrieval project.

#### Industrial Inspection and Physical Inverse Design

- **FREDNet** — ICASSP 2026. Frequency and decomposed-spatial learning with attention fusion for surface-defect detection; contributions include data curation, training, benchmarking, ablations, and cross-domain evaluation on NEU-DET and GC-10, with a reported 4.8% improvement in mAP@0.5.
- **Metasurface inverse design** — _AIP Advances_ (2025). CNN–Transformer regression using polarization-conversion spectra and Gaussian-noise augmentation; reported mean MSE of 0.00331.

#### Time-Series Forecasting and Energy Systems

- **ReLaMix** — arXiv preprint (2026). Residual bottleneck mixing for delayed financial observations, evaluated on second-resolution PAXGUSDT and BTCUSDT using non-overlapping temporal segments and delay-robustness benchmarks.
- **Wind energy prediction** — _Energies_ (2025). Modular echo state networks, clustering, and training on turbine data; reported best R² of 0.9905.

#### Earlier Interdisciplinary Work

- **Computational social science and sports media** (Sep.–Dec. 2023): AI video generation, Python, Tableau, FreeD 3D, volumetric imaging, and AIGC for studying sports media and player competitiveness.
