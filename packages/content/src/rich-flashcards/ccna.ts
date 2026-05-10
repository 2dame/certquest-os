/**
 * Cisco CCNA (200-301 v1.1) — Router Kingdom rich flashcards.
 * Lore: CLI Dojo apprentice mentored by Sensei Route.
 *
 * Sources cross-checked: Cisco CCNA 200-301 v1.1 official exam topics
 * (effective Aug 20, 2024). Domains: Network Fundamentals 20%, Network
 * Access 20%, IP Connectivity 25%, IP Services 10%, Security Fundamentals 15%,
 * Automation and Programmability 10%.
 *
 * v1.1 additions covered: Generative+predictive AI/ML in network ops (6.4),
 * Ansible+Terraform (6.6, replacing Puppet/Chef), STP enhancements
 * (Root Guard / Loop Guard / BPDU Filter / BPDU Guard, 2.5.d), cloud-managed
 * device access (2.8).
 */

import { rfc } from '../authoring-rich';
import type { RichFlashcard } from '@certquest/types';

const C = 'ccna';

export const ccnaRichFlashcards: RichFlashcard[] = [
  rfc({
    id: 'ccna-rfc-001',
    certId: C,
    domainId: 'ccna-fund',
    objectiveId: 'ccna-obj-cli',
    term: 'IOS CLI Mode Hierarchy',
    definition: 'User EXEC (Router>): limited monitoring. Privileged EXEC (Router#): full monitoring + entry to config. Global Config (Router(config)#): system-wide settings. Interface Config (Router(config-if)#): per-interface settings. Sub-modes: line, router, vlan, etc., reachable from global.',
    whyItMatters: 'Every CCNA scenario question starts with "from which prompt." Mode awareness saves hours and prevents typing config commands that silently do nothing at the wrong level.',
    memoryHook: 'Sensei Route: "User reads. Privileged commands. Config builds. Interface tunes." Four words, four modes, in order. Climb with `enable` and `configure terminal`; descend with `exit` or `end`.',
    commonTrap: 'Typing `interface gi0/1` at User EXEC and watching it fail. You must `enable` then `configure terminal` first. Privilege climbs explicitly; the prompt always tells you where you are.',
    example: 'Goal: change the IP on Gi0/1. Path: > enable → # configure terminal → (config)# interface GigabitEthernet0/1 → (config-if)# ip address 10.1.1.1 255.255.255.0 → (config-if)# no shutdown → end → # write memory.',
    examAngle: 'When the question shows a config command that "did nothing," check the prompt level shown. Wrong level is the answer. End every config session with `write memory` (or `copy run start`) — the exam tests this.',
    tags: ['ios', 'cli', 'fundamentals'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'ccna-rfc-002',
    certId: C,
    domainId: 'ccna-ip',
    objectiveId: 'ccna-obj-routing',
    term: 'Administrative Distance Table',
    definition: 'Connected: 0. Static: 1. eBGP: 20. EIGRP internal: 90. IGRP: 100. OSPF: 110. IS-IS: 115. RIP: 120. EIGRP external: 170. iBGP: 200. Unknown: 255 (unreachable).',
    whyItMatters: 'When two routes to the same destination compete, the one with lower AD wins. AD questions appear on every CCNA exam — usually as scenarios where multiple protocols announce the same prefix.',
    memoryHook: 'Sensei Route: "Connected counts zero. Static stands at one. eBGP rules at twenty. EIGRP runs ninety. OSPF stands one-ten." Memorize the descending trust: directly seeing > you typing > external trust > internal protocols.',
    commonTrap: 'Mixing up internal and external EIGRP. Internal = 90 (trusted within AS). External = 170 (untrusted, redistributed in). The exam loves this swap.',
    example: 'A router learns 10.0.0.0/24 via OSPF (AD 110) and via static route `ip route 10.0.0.0 255.255.255.0 192.168.1.1` (AD 1). The static route wins; OSPF route stays in OSPF database but not in routing table.',
    examAngle: 'Question shows two routes to same prefix from different protocols. Pick the lower-AD route. If they\'re tied (rare), it goes to metric.',
    tags: ['routing', 'ad', 'ospf', 'eigrp'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'ccna-rfc-003',
    certId: C,
    domainId: 'ccna-access',
    objectiveId: 'ccna-obj-vlan',
    term: 'STP Enhancements: Root Guard, Loop Guard, BPDU Guard, BPDU Filter',
    definition: 'PortFast: skip listening/learning, go straight to forwarding (access ports only). BPDU Guard: shut the port if a BPDU is received (used with PortFast). BPDU Filter: stop sending/receiving BPDUs on a port. Root Guard: disables a port if it would become root via incoming superior BPDU. Loop Guard: blocks a port if BPDUs stop arriving on a non-designated port (prevents unidirectional link loops).',
    whyItMatters: 'CCNA v1.1 explicitly added these (exam topic 2.5.d). They are the difference between a quiet switched network and one that goes down for 30 minutes when somebody plugs in a rogue switch.',
    memoryHook: 'Sensei Route: "Root Guard says \'no new king.\' Loop Guard says \'no silent partner.\' BPDU Guard says \'no surprise BPDUs.\' BPDU Filter says \'silent treatment, both ways.\'"',
    commonTrap: 'Confusing BPDU Guard with BPDU Filter. Guard SHUTS the port if BPDUs appear. Filter STOPS BPDUs from being sent or received (effectively disabling STP on that port — risky).',
    example: 'An access port for a desktop has PortFast enabled. Add `spanning-tree bpduguard enable` — if anyone plugs in a switch instead of a workstation, the port goes err-disabled instantly, protecting the topology.',
    examAngle: 'Question mentions "prevent rogue switch from becoming root" → Root Guard. "Access port should never see a BPDU" → BPDU Guard. "Detect unidirectional link" → Loop Guard. "Stop sending BPDUs entirely" → BPDU Filter.',
    tags: ['stp', 'spanning-tree', 'v1.1', 'switching'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-004',
    certId: C,
    domainId: 'ccna-access',
    objectiveId: 'ccna-obj-vlan',
    term: 'VLAN Trunking, 802.1Q, and Native VLAN',
    definition: 'A trunk carries multiple VLANs over a single link, tagging frames with 802.1Q (4-byte header inserted after source MAC). The native VLAN on a trunk is the one VLAN whose frames are sent untagged. Both ends of the trunk must agree on the native VLAN.',
    whyItMatters: 'Native VLAN mismatch is the most common silent trunk problem in production. CDP/LLDP detects it; the exam tests the symptoms and the fix.',
    memoryHook: 'Sensei Route: "Tagged frames travel between switches. Native frames travel naked. Both ends agree, or the kingdom routes wrong." 802.1Q = "the tag." Native = "the untagged."',
    commonTrap: 'Leaving native VLAN as 1 (default). Best practice: change to a dedicated, unused VLAN ID (e.g., 999). Why: VLAN-hopping attacks exploit native VLAN 1.',
    example: 'Switch A trunk: switchport trunk native vlan 999, allowed 10,20,30,999. Switch B trunk: same. CDP shows neighbors agree. If B were native vlan 1, CDP would log a native VLAN mismatch.',
    examAngle: 'Question mentions "frames showing up on wrong VLAN across a trunk" or "native VLAN mismatch" → fix is to align native VLAN on both ends. "Best security practice for trunks" → dedicated native VLAN, prune unused VLANs.',
    tags: ['vlan', 'trunk', '802.1q'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-005',
    certId: C,
    domainId: 'ccna-security',
    objectiveId: 'ccna-obj-acls',
    term: 'Wildcard Masks and ACL Placement',
    definition: 'A wildcard mask is the inverse of a subnet mask: 0 = "must match," 1 = "any value." /24 → 255.255.255.0 mask → 0.0.0.255 wildcard. Standard ACLs (1–99, 1300–1999) match source IP only — place close to destination. Extended ACLs (100–199, 2000–2699) match source + dest + protocol + port — place close to source.',
    whyItMatters: 'Wildcard math and ACL placement both appear on nearly every CCNA exam. Mis-placing an ACL drops legitimate traffic from networks far away.',
    memoryHook: 'Sensei Route: "Standard close to destination, Extended close to source." (Or: "Standard goes far, Extended stays near.") Wildcard: "0 means must, 1 means free."',
    commonTrap: 'Forgetting the implicit `deny ip any any` at the bottom. Every ACL ends with "deny everything not explicitly permitted." If you only permit one host, every other host is implicitly denied.',
    example: 'Permit only 192.168.1.0/24 to access 10.0.0.5\'s web port: extended ACL `access-list 110 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 443`. Apply close to source (inbound on the LAN-side router interface).',
    examAngle: 'Wildcard for /27 = 0.0.0.31 (mask 255.255.255.224 inverted). For /28 = 0.0.0.15. Memorize the common ones. Standard vs extended decision turns on "is the question filtering destination/protocol?" — if yes, extended.',
    tags: ['acl', 'wildcard', 'security'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-006',
    certId: C,
    domainId: 'ccna-ip',
    objectiveId: 'ccna-obj-routing',
    term: 'OSPF Single-Area Configuration',
    definition: 'OSPFv2 link-state protocol for IPv4. AD 110, metric is cost (10^8 / bandwidth). Single-area = all routers in area 0 (backbone). Form neighbor adjacency on matching: area, hello/dead timers, network type, authentication, MTU. Stub routes injected via `default-information originate`.',
    whyItMatters: 'OSPF dominates routing questions on CCNA. Knowing what causes adjacency to FAIL is more useful than memorizing config — most exam scenarios show two routers that should be neighbors but aren\'t.',
    memoryHook: 'Sensei Route: "Match Area, Match Timers, Match Type, Match MTU, Match Auth." Five matches for adjacency. Mismatch any one and the neighbors stay strangers.',
    commonTrap: 'Forgetting that the wildcard mask in `network` statements is INVERSE of subnet mask. `network 10.0.0.0 0.0.0.255 area 0` matches 10.0.0.0/24, not /8.',
    example: 'router ospf 1 / router-id 1.1.1.1 / network 10.1.1.0 0.0.0.255 area 0 / network 192.168.1.0 0.0.0.3 area 0. The /30 link plus the /24 LAN both join area 0.',
    examAngle: 'Question shows two routers with show ip ospf neighbor returning empty. Check (1) area mismatch, (2) hello/dead timer mismatch, (3) network statement covers the right interface, (4) interface up/up, (5) authentication match.',
    tags: ['ospf', 'routing'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-007',
    certId: C,
    domainId: 'ccna-services',
    objectiveId: 'ccna-obj-routing',
    term: 'NAT/PAT and Inside vs Outside',
    definition: 'NAT (Network Address Translation): one-to-one mapping of private to public IP. PAT (Port Address Translation, aka NAT overload): many private IPs share one public IP, distinguished by source port. Inside Local: private IP as seen inside. Inside Global: public IP after translation. Outside Local/Global: addresses on the external side.',
    whyItMatters: 'Almost every home and small office uses PAT to share one ISP-assigned IP. CCNA tests both the mechanism and the configuration commands.',
    memoryHook: '"Inside Local is your real name. Inside Global is your stage name. Outside Local is what you call them. Outside Global is their real name." The translation hides identities at the border.',
    commonTrap: 'Confusing NAT with PAT in answer text. NAT alone usually implies static one-to-one. PAT or "NAT overload" is many-to-one with port translation. The exam uses precise terms.',
    example: 'Cisco IOS PAT config: `ip nat inside source list 1 interface gi0/1 overload` plus `access-list 1 permit 10.0.0.0 0.0.0.255` — translates the entire 10.0.0.0/24 to gi0/1\'s public IP, distinguishing flows by port.',
    examAngle: 'Question mentions "many internal users share one public IP" → PAT (overload). "One internal server reachable from internet" → static NAT. "Multiple public IPs in a pool" → dynamic NAT.',
    tags: ['nat', 'pat', 'services'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-008',
    certId: C,
    domainId: 'ccna-auto',
    objectiveId: 'ccna-obj-routing',
    term: 'Ansible vs Terraform for Network Automation (CCNA v1.1)',
    definition: 'Ansible: agentless configuration management; pushes idempotent state to devices via SSH/NETCONF; uses YAML playbooks. Terraform: infrastructure provisioning tool; declarative HCL config; tracks resource state; primarily creates/destroys cloud infrastructure including network resources. Both replace older tools (Puppet, Chef) on the v1.1 blueprint.',
    whyItMatters: 'CCNA v1.1 (exam topic 6.6) explicitly tests Ansible AND Terraform — Puppet and Chef were removed. Knowing which tool fits which job is also a real-world hiring criterion.',
    memoryHook: 'Sensei Route: "Ansible Adjusts existing devices. Terraform Tears down and Builds." Ansible = configure what exists. Terraform = create the existing.',
    commonTrap: 'Treating them as interchangeable. Ansible is configuration management (idempotent state on existing devices). Terraform is infrastructure provisioning (with state file). They often work together but solve different layers.',
    example: 'Cloud network team: Terraform provisions VPCs, subnets, security groups, route tables (AWS resources). Ansible then configures interfaces, ACLs, OSPF on existing on-prem routers. Two tools, two layers.',
    examAngle: 'Question mentions "agentless, push configuration to existing devices" → Ansible. "Declarative provisioning of infrastructure with state tracking" → Terraform. Question contrasts CCNA v1.0 vs v1.1 → v1.1 covers Ansible AND Terraform (not Puppet/Chef).',
    tags: ['automation', 'ansible', 'terraform', 'v1.1'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-009',
    certId: C,
    domainId: 'ccna-auto',
    objectiveId: 'ccna-obj-routing',
    term: 'Generative AI and Machine Learning in Network Operations (CCNA v1.1)',
    definition: 'Generative AI in network ops: LLMs assist with config generation, troubleshooting suggestions, documentation, runbook synthesis. Predictive AI / ML: anomaly detection in telemetry, predictive failure analysis, capacity forecasting, automated root-cause analysis. Both feed network observability platforms (e.g., Cisco AI-Native Networking, ThousandEyes).',
    whyItMatters: 'CCNA v1.1 (exam topic 6.4) added generative + predictive AI as testable content, replacing the older "DNA Center vs traditional management" comparison. Networks of 2025+ assume AI-assisted operations.',
    memoryHook: '"Generative creates. Predictive forecasts. Both observe." Three actions, two flavors of AI in network ops.',
    commonTrap: 'Confusing generative AI (creates output — text, configs, diagnoses) with predictive ML (forecasts — anomaly, capacity). Both appear in modern NOCs but solve different problems.',
    example: 'A network engineer asks an AI assistant: "Generate an ACL that allows HTTPS from the management subnet to the data center." Generative AI produces the config. Meanwhile, an ML model on the same platform alerts: "interface utilization on Gi0/1 will hit 90% in 4 days based on trend." Predictive ML.',
    examAngle: 'Question describes AI generating configs/text/explanations → generative AI. Question describes anomaly detection, capacity forecasting, predictive maintenance → ML / predictive AI. Both new on v1.1.',
    tags: ['ai', 'ml', 'automation', 'v1.1'],
    difficulty: 'intermediate',
  }),

  // --- Network Fundamentals domain additions (ccna-fund) ---

  rfc({
    id: 'ccna-rfc-011',
    certId: C,
    domainId: 'ccna-fund',
    objectiveId: 'ccna-obj-cli',
    term: 'IPv4 Subnetting and CIDR Notation',
    definition: 'CIDR notation expresses an IP with its prefix length: 192.168.1.0/24 = host range .1–.254, broadcast .255, subnet mask 255.255.255.0. Subnetting splits a block into smaller networks by borrowing host bits. /25 = 128 addresses (126 usable); /26 = 64 addresses (62 usable). Rule: usable hosts = 2^(host bits) - 2.',
    whyItMatters: 'CCNA questions are saturated with subnetting. Being able to identify the network address, broadcast, and usable host range from a /prefix eliminates wrong answers in under 30 seconds. It also underlies ACL wildcard math.',
    memoryHook: 'Sensei Route: "Borrow bits, double the networks, halve the hosts." Every bit you borrow from the host field doubles your subnet count and cuts your host count in half. /24 to /25 = 2 subnets of 126 hosts each.',
    commonTrap: 'Forgetting to subtract 2 from host count. 2^8 = 256 addresses but only 254 usable — the network address and broadcast are reserved. The exam uses both "total addresses" and "usable hosts" to test this.',
    example: 'Subnet 10.0.0.0/27: mask = 255.255.255.224. Block size = 32. Ranges: .0–.31 (net .0, bcast .31, usable .1–.30), .32–.63 (net .32, bcast .63, usable .33–.62). /27 = 30 usable hosts per subnet.',
    examAngle: 'Given a host IP and prefix, identify network address (zero host bits), broadcast (all host bits 1), and valid host range. For /25: block 128, networks .0 and .128. For /26: block 64, networks .0, .64, .128, .192. Memorize block sizes: /25=128, /26=64, /27=32, /28=16, /29=8, /30=4.',
    tags: ['subnetting', 'cidr', 'ipv4', 'fundamentals'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'ccna-rfc-012',
    certId: C,
    domainId: 'ccna-fund',
    objectiveId: 'ccna-obj-cli',
    term: 'Network Topologies and Device Roles',
    definition: 'Physical topologies: bus (single cable, legacy), ring (tokens circulate, SONET/FDDI), star (all connect to a central switch — dominant LAN topology), mesh (full = every device connected to every other, partial = some), hybrid. Logical topologies describe how data flows, not cable layout. Device roles: hub (Layer 1 repeater, creates collision domain), switch (Layer 2, MAC-based forwarding, each port its own collision domain), router (Layer 3, IP-based forwarding, connects networks, creates separate broadcast domains).',
    whyItMatters: 'CCNA Fundamentals domain includes topology recognition and device-role disambiguation. Exam scenarios frequently show a network diagram and ask which device is causing a broadcast storm or collision domain problem — the answer is always the hub or misconfigured switch.',
    memoryHook: 'Sensei Route: "Hub shares everything, switch knows who\'s who by MAC, router decides where packets go by IP." One sentence, three devices, three layers. Star topology + switch = modern LAN.',
    commonTrap: 'Confusing collision domains with broadcast domains. Each switch PORT is its own collision domain (eliminates collisions). Each router INTERFACE is its own broadcast domain (stops broadcasts from crossing). A hub creates one big collision domain for all connected devices.',
    example: 'Five PCs on a hub generate constant collisions as traffic grows. Replace with a switch: each PC now has a dedicated collision-free segment. Add a router between VLANs: broadcasts stay within each VLAN, preventing broadcast storms from crossing.',
    examAngle: '"How many collision domains?" — count switch ports + router interfaces. "How many broadcast domains?" — count router interfaces (or VLANs). Hub = 1 collision domain for all ports. Switch = 1 collision domain per port. "What device stops broadcasts from crossing?" → router.',
    tags: ['topology', 'switching', 'routing', 'fundamentals'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'ccna-rfc-010',
    certId: C,
    domainId: 'ccna-services',
    objectiveId: 'ccna-obj-routing',
    term: 'Cloud-Managed Device Access (CCNA v1.1)',
    definition: 'Cloud-managed network devices (Meraki, Catalyst-on-Cloud, etc.) are administered through a cloud dashboard rather than per-device CLI. Management plane traffic flows from device to cloud controller via secure tunnel; data plane stays local. Configuration is centralized, devices auto-register via serial number / claim code.',
    whyItMatters: 'CCNA v1.1 (exam topic 2.8) added "cloud managed" to the list of management access methods alongside Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS. Cloud-managed deployments are now mainstream.',
    memoryHook: 'Sensei Route: "Old way: CLI per box. New way: dashboard for the whole kingdom." Cloud-managed = "dashboard view, dashboard config."',
    commonTrap: 'Believing cloud-managed means data flows through the cloud. It does not — only management/config does. User packets still take the local fast path.',
    example: 'A 50-store retail chain uses cloud-managed APs and switches. Configuration changes (new SSID, ACL update) are pushed from one dashboard to all 50 stores at once. Local traffic stays local; only management tunnels to the cloud.',
    examAngle: 'Question lists management access types: Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS, AND cloud managed (v1.1 addition). When the scenario emphasizes centralized multi-site management, cloud-managed is the answer.',
    tags: ['cloud-managed', 'meraki', 'v1.1'],
    difficulty: 'beginner',
  }),
];
