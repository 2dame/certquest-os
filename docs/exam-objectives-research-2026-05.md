# Exam Objectives Research — May 2026

Cross-checked the six certification paths against current published vendor
objectives. This document captures findings and the resulting changes to
the codebase.

## Method

Web searches against vendor pages (comptia.org, docs.aws.amazon.com,
learningnetwork.cisco.com), official PDFs hosted via studylib/d1.awsstatic
mirrors, and reputable training-vendor reference pages (Professor Messer,
Tutorials Dojo, Wendell Odom). Each domain weight, passing score, and
content addition was confirmed across at least two independent sources.

## Findings

### CompTIA A+ Core 1 (220-1201 V15) — Code matches official

- Launched March 25 2025; old 220-1101 retired Sept 25 2025.
- Domain weights: Mobile 13% / Network 23% / Hardware 25% / Cloud 11% /
  Troubleshoot 28%. Codebase value: matches.
- Passing score: 675 (scaled 100–900). Codebase: matches.
- Notable V15 additions: AI basics, Zero Trust, eSIM, Windows 11 depth,
  ReFS/XFS file systems.
- The six-step troubleshooting methodology is no longer formally tested
  but appears in the objectives document as competency context. Cert pack
  retains the methodology objective as it remains the practical framework.
- **No changes required.**

### CompTIA A+ Core 2 (220-1202 V15) — WEIGHTS REQUIRED CORRECTION

- Same launch/retirement dates as Core 1.
- **Official domain weights:** OS **28%** / Security **28%** / Software
  Troubleshooting **23%** / Operational Procedures **21%**.
- **Codebase had:** OS 31% / Security 25% / Software Troubleshooting 22% /
  Operational Procedures 22%.
- Passing score: 700 (scaled 100–900). Codebase examCodes block: matches.
- **CHANGED:** Domain weights in `packages/content/src/certs/a-plus-core2/index.ts`
  updated from 31/25/22/22 to 28/28/23/21 to match the official V15 v3.0
  objectives document.

### CompTIA Network+ (N10-009) — Code matches

- Launched June 20 2024.
- Domain weights: Networking Concepts 23% / Network Implementation 20% /
  Network Operations 19% / Network Security 14% / Network Troubleshooting
  24%. Codebase: matches.
- Passing score: 720 (scaled 100–900). Codebase: matches.
- N10-009 additions worth flashcards: SD-WAN, SASE/SSE, Zero Trust, IaC
  (Ansible/Terraform), VXLAN, IPv6 transition (NAT64, dual-stack), MDF/IDF
  facility planning.
- All six are covered in the new rich flashcard set.
- **No metadata changes required.**

### AWS Certified Cloud Practitioner (CLF-C02) — Code matches

- Launched September 19 2023.
- Domain weights: Cloud Concepts 24% / Security & Compliance 30% / Cloud
  Technology & Services 34% / Billing, Pricing, & Support 12%. Codebase:
  matches.
- Passing score: 700 (scaled 100–1000). Codebase: matches.
- Added vs CLF-C01: AWS Cloud Adoption Framework (AWS CAF) as an explicit
  task statement. Covered in the new rich flashcard set (`ccp-rfc-010`).
- **No metadata changes required.**

### AWS Certified Solutions Architect — Associate (SAA-C03) — DISPLAY ORDER REQUIRED CORRECTION

- Domain weights: Design Secure Architectures **30%** / Design Resilient
  Architectures **26%** / Design High-Performing Architectures **24%** /
  Design Cost-Optimized Architectures **20%**. Codebase weight values:
  match.
- **Codebase displayOrder:** Resilient was displayOrder 1, Performance 2,
  Secure 3, Cost 4. Official ordering on the exam guide is Secure → Resilient
  → Performance → Cost.
- **CHANGED:** Reordered domains in
  `packages/content/src/certs/aws-saa/index.ts` so `saa-secure` is
  displayOrder 1, `saa-resilient` 2, `saa-perf` 3, `saa-cost` 4. No domain
  IDs renamed (those are §1-locked).
- Passing score: 720 (scaled 100–1000). Codebase: matches.

### Cisco CCNA (200-301 v1.1) — OBJECTIVES ADDED FOR v1.1 NEW CONTENT

- v1.1 effective August 20 2024. Domain weights unchanged from v1.0:
  Network Fundamentals 20% / Network Access 20% / IP Connectivity 25% /
  IP Services 10% / Security Fundamentals 15% / Automation 10%.
- Codebase weight values: match.
- Passing score: ~825 (scaled 300–1000; Cisco does not publish an exact
  passing score). Codebase examCodes: 825 retained.
- v1.1 additions (replacing or extending v1.0 topics):
  - **2.5.d**: STP enhancements — Root Guard, Loop Guard, BPDU Filter, BPDU Guard.
  - **2.8**: device management access now includes "cloud managed" alongside
    Telnet/SSH/HTTP/HTTPS/console/TACACS+/RADIUS.
  - **6.4**: replaced "Compare traditional campus device management with
    Cisco DNA Center" with "Explain AI (generative and predictive) and
    machine learning in network operations."
  - **6.6**: removed Puppet and Chef; added Ansible AND Terraform
    (Infrastructure as Code).
- **CHANGED:** Added four new objectives to
  `packages/content/src/certs/ccna/index.ts` to explicitly track v1.1
  content: `ccna-obj-stp-enhancements`, `ccna-obj-cloud-managed`,
  `ccna-obj-ansible-terraform`, `ccna-obj-ai-ml-network-ops`.
- All four are covered in the new rich flashcard set
  (`ccna-rfc-003`, `ccna-rfc-008`, `ccna-rfc-009`, `ccna-rfc-010`).
- Note: a v2.0 update launched February 3 2026 with broader changes
  (deeper AI integration, automation expansion, troubleshooting moved to
  CCNP). CertQuest OS targets v1.1 per project scope; v2.0 migration is
  out of scope for this build pass.

## Summary of Changes Applied

| File | Change |
|---|---|
| `packages/content/src/certs/a-plus-core2/index.ts` | Domain weights 31/25/22/22 → 28/28/23/21 |
| `packages/content/src/certs/aws-saa/index.ts` | displayOrder reshuffled to Secure/Resilient/Perf/Cost |
| `packages/content/src/certs/ccna/index.ts` | Four new objectives added for v1.1 topics |

No cert IDs, exam codes, or domain IDs were renamed (per AGENTS.md §1).

## Sources Consulted

- CompTIA A+ official page: https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/
- CompTIA A+ Core 1 220-1201 objectives v4.0 (Nov 2024 publication)
- CompTIA A+ Core 2 220-1202 objectives v3.0 (Nov 2024 publication)
- CompTIA Network+: https://www.comptia.org/en-us/certifications/network/
- AWS CCP exam guide: https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html
- AWS SAA exam guide: https://docs.aws.amazon.com/aws-certification/latest/examguides/solutions-architect-associate-03.html
- Cisco CCNA: https://learningnetwork.cisco.com/s/ccna
- Cisco blog on v1.1: https://blogs.cisco.com/learning/understanding-the-updated-ccna-v1-1-with-ai-machine-learning-and-more
- Wendell Odom on v1.1: https://www.certskills.com/ccna2024-01/
- Daniels Networking Blog on v1.1: https://lostintransit.se/2024/04/23/ccna-200-301-updated-to-version-1-1/
- Professor Messer N10-009 overview: https://www.professormesser.com/network-plus/n10-009/
