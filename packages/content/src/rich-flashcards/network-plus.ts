/**
 * Network+ (N10-009) — Packet Seas rich flashcards.
 * Lore: network cartographer mentored by Admiral Ping.
 *
 * Sources cross-checked: CompTIA Network+ N10-009 official objectives v4.0
 * (June 2024 launch). Domains: Concepts 23/Implementation 20/Operations 19/
 * Security 14/Troubleshooting 24.
 */

import { rfc } from '../authoring-rich';
import type { RichFlashcard } from '@certquest/types';

const C = 'network-plus';

export const networkPlusRichFlashcards: RichFlashcard[] = [
  rfc({
    id: 'netplus-rfc-001',
    certId: C,
    domainId: 'netplus-fund',
    objectiveId: 'netplus-obj-osi',
    term: 'OSI Model with PDU and Devices per Layer',
    definition: 'L1 Physical (bits, cables, hubs); L2 Data Link (frames, MAC, switches); L3 Network (packets, IP, routers); L4 Transport (segments TCP / datagrams UDP, firewalls); L5 Session (sessions); L6 Presentation (encryption, encoding); L7 Application (data, HTTP/SMTP/DNS).',
    whyItMatters: 'Layered troubleshooting (start at L1, work up) is the single biggest time-saver in the field. Knowing which device lives at which layer turns vague symptoms into bounded problems.',
    memoryHook: 'Bottom-up: "Please Do Not Throw Sausage Pizza Away." Top-down: "All People Seem To Need Data Processing." PDUs by layer: Bits, Frames, Packets, Segments — "BFPS — Big Fish Pack Seas."',
    commonTrap: 'Calling a switch a "Layer 3 device." Plain switches are L2. Multilayer (L3) switches exist but the exam says "switch" alone = Layer 2 unless specified.',
    example: 'A user can ping by IP but not by hostname. Layer 3 works (ping = ICMP at L3). DNS lives at L7. Therefore the issue is L7 — DNS resolution. Don\'t check cabling.',
    examAngle: 'Identify the layer from the symptom. "Cable unplugged" = L1. "MAC table" = L2. "Routing" = L3. "Port blocked" = L4. "Wrong cert" = L6/L7. The layer dictates the answer.',
    tags: ['osi', 'fundamentals'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'netplus-rfc-002',
    certId: C,
    domainId: 'netplus-fund',
    objectiveId: 'netplus-obj-subnet',
    term: 'Subnetting Cheat Pattern (CIDR ↔ Mask ↔ Hosts)',
    definition: 'For an IPv4 /N where N ≥ 24: hosts = 2^(32-N) − 2. /24 = 254 hosts, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2. Subnet mask flips: /24 = 255.255.255.0, /25 = .128, /26 = .192, /27 = .224, /28 = .240, /29 = .248, /30 = .252.',
    whyItMatters: 'Subnetting alone covers ~10% of Network+ and dominates CCNA. Doing it on paper without a calculator is the difference between "passes in 60 minutes" and "runs out the clock."',
    memoryHook: 'Powers of two going right: 128, 192, 224, 240, 248, 252, 254, 255. Memorize this row. Then mask octet = the row entry for that bit count. Hosts = "two to the borrowed-bits, minus two." Always minus two — network and broadcast.',
    commonTrap: 'Forgetting "minus 2." A /24 has 256 addresses but only 254 usable hosts. Almost every subnetting question turns on this.',
    example: 'You need 50 hosts per subnet. 2^6 = 64 ≥ 50+2, so 6 host bits → /26. Mask: 255.255.255.192. Subnets in 192.168.10.0/24: .0/26, .64/26, .128/26, .192/26 — four subnets of 62 hosts each.',
    examAngle: 'The exam will give you a host requirement and ask which mask. Calculate: round host count up to next power of 2, add 2, find that power. /N = 32 − that power.',
    tags: ['subnetting', 'cidr', 'ipv4'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-003',
    certId: C,
    domainId: 'netplus-fund',
    objectiveId: 'netplus-obj-subnet',
    term: 'IPv6 Address Types',
    definition: 'Global Unicast (2000::/3): public, internet-routable. Link-Local (fe80::/10): autoconfigured, single segment only, used for neighbor discovery. Unique Local (fc00::/7, in practice fd00::/8): private, comparable to RFC1918. Multicast (ff00::/8). Loopback (::1). Anycast: address shared by multiple hosts; nearest one answers.',
    whyItMatters: 'N10-009 ramped up IPv6 emphasis dramatically. Knowing which prefix means what is the difference between "I see fe80 — that\'s expected" and a panicked false-positive ticket.',
    memoryHook: '"2 on the internet, fe80 stays home, fd is your basement, ff calls a crowd, ::1 talks to itself." Five prefixes, five sentences.',
    commonTrap: 'Worrying when every interface shows an fe80:: address. That\'s normal — link-local is auto-generated on every IPv6 interface. The absence of one is a problem.',
    example: 'show ipv6 interface brief on a Cisco router displays GigabitEthernet0/0 with both 2001:db8:1::1/64 and fe80::1. Normal. The 2001 is the routable address; the fe80 is for OSPFv3 neighbor adjacency.',
    examAngle: 'The exam will show an IPv6 address and ask its type. First two bytes: 2000–3fff = global; fe80 = link-local; fc/fd = unique local; ff = multicast; ::1 = loopback. Memorize the prefix-to-type table.',
    tags: ['ipv6', 'addressing'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-004',
    certId: C,
    domainId: 'netplus-impl',
    objectiveId: 'netplus-obj-wireless',
    term: 'Wi-Fi 6, 6E, and 7 with Channel Widths',
    definition: 'Wi-Fi 6 (802.11ax): 2.4/5 GHz, OFDMA, MU-MIMO uplink+downlink, channels up to 160 MHz. Wi-Fi 6E: same as 6 plus 6 GHz band (less interference, more 80/160 MHz channels). Wi-Fi 7 (802.11be): adds 320 MHz channels, 4096-QAM, Multi-Link Operation across bands simultaneously.',
    whyItMatters: 'N10-009 added 6E and 7 explicitly. Mis-spec\'ing an AP refresh costs the org a $50k upgrade twice. Knowing what the 6 GHz band requires (clients AND APs that support it) is essential.',
    memoryHook: '6 = "six does five" (5 GHz max). 6E = "six Enables six" (6 GHz). 7 = "seven Spans" (MLO across bands).',
    commonTrap: 'Selling "Wi-Fi 6 will give us 6 GHz." Plain Wi-Fi 6 does NOT include 6 GHz — only the 6E variant does. The marketing is misleading; the spec is clear.',
    example: 'A new office WAP refresh. To future-proof for client devices that arrive over 5 years, spec Wi-Fi 7 APs (320 MHz channel capability, MLO). Older clients fall back to 5 GHz on the same APs.',
    examAngle: 'If the question mentions "320 MHz channels" or "Multi-Link Operation," the answer is Wi-Fi 7. If "6 GHz band," 6E or 7. If just "OFDMA," Wi-Fi 6 or later.',
    tags: ['wifi', 'wireless', 'wifi6', 'wifi7'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-005',
    certId: C,
    domainId: 'netplus-fund',
    objectiveId: 'netplus-obj-osi',
    term: 'SD-WAN and SASE',
    definition: 'SD-WAN: software-defined WAN that abstracts physical links (MPLS/broadband/LTE) into a single logical fabric, applies application-aware routing, and centralizes policy. SASE (Secure Access Service Edge): SD-WAN plus cloud-delivered security services (SWG, CASB, ZTNA, FWaaS) — networking and security collapsed into one cloud-edge platform.',
    whyItMatters: 'N10-009 added SD-WAN and SASE as new objectives. They are the dominant enterprise WAN architecture in 2024–2026; you will not get through Network+ without them.',
    memoryHook: 'SD-WAN = "Software Decides the WAN." SASE (sounds like "sassy") = "SD-WAN plus Security, As one Service."',
    commonTrap: 'Treating SASE and SD-WAN as the same thing. SASE INCLUDES SD-WAN but adds the cloud security stack. Pure SD-WAN doesn\'t include SWG/CASB/ZTNA.',
    example: 'A retail chain has 200 stores on MPLS. Migrating to SD-WAN gives each store dual broadband + LTE failover and central policy. Adding SASE moves their proxy/DLP/firewall functions to the cloud edge — eliminating per-store firewall appliances.',
    examAngle: 'If the question mentions cloud-delivered security combined with WAN routing, the answer is SASE. If it\'s just "WAN with policy and link aggregation," SD-WAN.',
    tags: ['sdwan', 'sase', 'modern-networking'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-006',
    certId: C,
    domainId: 'netplus-trbl',
    objectiveId: 'netplus-obj-tools',
    term: 'ping vs tracert/traceroute vs pathping',
    definition: 'ping sends ICMP echo, returns reachability and round-trip time. tracert (Windows) / traceroute (Linux/macOS) increments TTL to map every hop along the path. pathping combines both — it traces the path then samples each hop over time to identify where loss/latency occurs.',
    whyItMatters: 'These three are the entire troubleshooting toolkit for layer-3 reachability. Knowing which one to use first separates a five-minute fix from a forty-minute hunt.',
    memoryHook: 'ping = "is it alive?" tracert = "how do I get there?" pathping = "where on the way is it broken?"',
    commonTrap: 'Trusting one ping result. ICMP can be deprioritized or blocked at hops while TCP traffic flows fine. A failed ping doesn\'t mean the service is down.',
    example: 'User can\'t reach an internal app. ping the app server: replies. tracert from user to server: stops at hop 4. From hop 4, it\'s either a router ACL or asymmetric routing. pathping confirms hop 4 drops 50% of probes — escalate to network team.',
    examAngle: 'When the question asks "which tool identifies WHERE in the path packets are being lost," the answer is pathping (Windows) or mtr (Linux). Plain ping/traceroute don\'t give per-hop loss statistics.',
    tags: ['troubleshooting', 'cli', 'icmp'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'netplus-rfc-007',
    certId: C,
    domainId: 'netplus-sec',
    objectiveId: 'netplus-obj-osi',
    term: 'Zero Trust Network Access (ZTNA)',
    definition: 'Identity-based network access where every connection is authenticated, authorized, and encrypted regardless of source network location. Replaces VPN-style "if you\'re inside, you\'re trusted." Continuously validates user, device posture, and context per request.',
    whyItMatters: 'N10-009 added Zero Trust explicitly. It\'s the architecture replacing VPN at modern enterprises and the framing for most current security questions.',
    memoryHook: 'Three pillars: "Verify explicitly. Use least privilege. Assume breach." Captain\'s mantra at the Packet Seas: "Trust nothing — verify every chart."',
    commonTrap: 'Calling Zero Trust "VPN with extra steps." It\'s not. VPN extends the trusted perimeter; ZTNA eliminates the perimeter and verifies per-request. Architecturally opposite.',
    example: 'A remote user opens an internal HR app. ZTNA broker checks: who is the user (MFA), is the device managed and compliant, what specific app are they requesting, is this consistent with their role. If yes/yes/yes/yes, broker proxies the connection — without giving the user network-level access to anything else.',
    examAngle: 'Question contrasts ZTNA with traditional VPN. The right answer always emphasizes "per-application access" and "no implicit network trust." Wrong answers say "after VPN, user has full network access."',
    tags: ['zero-trust', 'ztna', 'security'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-008',
    certId: C,
    domainId: 'netplus-impl',
    objectiveId: 'netplus-obj-subnet',
    term: 'VLANs, Trunks, and Native VLAN',
    definition: 'A VLAN is a Layer 2 broadcast domain inside a switch. An access port belongs to one VLAN and carries untagged frames. A trunk port carries multiple VLANs between switches, tagging frames with 802.1Q. The "native VLAN" on a trunk is the one VLAN whose frames are sent untagged — both ends must agree.',
    whyItMatters: 'Native VLAN mismatch is the single most common trunk problem in the field. It silently merges traffic between VLANs that should be isolated.',
    memoryHook: 'Trunk = "Truck carrying many tagged crates" — the crates are VLAN-tagged frames. Native VLAN = the one crate without a label.',
    commonTrap: 'Leaving native VLAN as 1 (default) on both sides. The exam (and security audits) penalize this. Best practice: change native VLAN to an unused VLAN ID, prune unused VLANs from trunks.',
    example: 'Switch A trunk: native 99, allowed 10,20,30,99. Switch B trunk: native 1, allowed 10,20,30. Result: native VLAN mismatch — A\'s VLAN 99 traffic arrives on B as VLAN 1. Show CDP or LLDP neighbor data flags this; fix by aligning native VLAN.',
    examAngle: 'Symptoms of native VLAN mismatch on the exam: "CDP/LLDP error," "frames showing up in wrong VLAN," "VLAN hopping risk." Fix: match native VLAN on both sides.',
    tags: ['vlan', 'trunk', '802.1q'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'netplus-rfc-009',
    certId: C,
    domainId: 'netplus-impl',
    objectiveId: 'netplus-obj-subnet',
    term: 'VXLAN (Virtual Extensible LAN)',
    definition: 'A network virtualization overlay that tunnels Layer 2 Ethernet frames inside UDP/IP packets, using a 24-bit VNI (~16 million segments vs VLAN\'s 12-bit / 4096). Enables multi-site Layer 2 across routed underlays — the foundation of modern data-center fabrics.',
    whyItMatters: 'N10-009 added VXLAN. Modern data centers run on it because traditional VLANs cannot scale beyond 4096 and don\'t cross routed boundaries. Cloud workloads assume VXLAN-like overlays.',
    memoryHook: 'VLAN = "twelve bits, four-thousand limit." VXLAN = "X for Extended — twenty-four bits, sixteen million." The X stands for extended scale.',
    commonTrap: 'Thinking VXLAN replaces VLAN inside a single switch. It doesn\'t — VLANs still exist locally; VXLAN tunnels them across an IP network. They work together, not against.',
    example: 'A company has data centers in two cities. They want VLAN 100 (a critical app subnet) to span both — so VMs can move between sites without changing IP. VXLAN with VNI 10100 tunneled over the WAN link delivers it.',
    examAngle: 'When the question mentions "extending Layer 2 over routed network" or "more than 4096 segments," the answer is VXLAN. When it mentions "MAC-in-IP-in-UDP encapsulation," also VXLAN.',
    tags: ['vxlan', 'overlay', 'data-center'],
    difficulty: 'advanced',
  }),

  rfc({
    id: 'netplus-rfc-010',
    certId: C,
    domainId: 'netplus-ops',
    objectiveId: 'netplus-obj-osi',
    term: 'Infrastructure as Code (IaC) for Networking',
    definition: 'Declarative configuration of network infrastructure (devices, interfaces, ACLs, VLANs, security groups) using version-controlled text files. Tools: Ansible (agentless, push-based), Terraform (cloud-native, state-tracking), Cisco NSO. Enables drift detection, peer review, rollback via git.',
    whyItMatters: 'N10-009 added IaC explicitly. It\'s how modern networks are operated — manual CLI changes are increasingly considered an anti-pattern.',
    memoryHook: 'Three pillars: "Declarative, Versioned, Repeatable." Ansible = "playbook recipes." Terraform = "blueprints with state." Both = "no more clicking."',
    commonTrap: 'Confusing Ansible (configuration management — pushes state) with Terraform (provisioning — creates resources from blueprints). Both are IaC but solve different parts.',
    example: 'A network team commits a Terraform file that defines a new VPC with subnets, NACLs, and route tables. terraform plan shows the changes. After review, terraform apply provisions the entire stack. Reviewable, repeatable, rollback-able.',
    examAngle: 'When the question contrasts IaC with manual CLI work, the right answer always emphasizes "version control," "repeatability," or "drift detection." Wrong answers say "faster typing."',
    tags: ['iac', 'automation', 'ansible', 'terraform'],
    difficulty: 'intermediate',
  }),
];
