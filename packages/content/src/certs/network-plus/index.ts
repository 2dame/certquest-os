/**
 * CompTIA Network+ (N10-009) — Packet Seas theme.
 */

import { q, fc } from '../../authoring';
import { networkPlusLore } from '../../lore/network-plus';

export const CERT_ID = 'network-plus';
export const EXAM_CODE = 'N10-009';

export const meta = {
  id: CERT_ID, provider: 'comptia' as const,
  examName: 'CompTIA Network+', examCode: EXAM_CODE,
  examVersion: 'verify-before-publish',
  officialSourceUrl: 'https://www.comptia.org/certifications/network',
  lastVerifiedDate: '2026-05-01',
  themeName: 'Packet Seas',
  themeBlurb: 'You are a navigator. The packets are your ships. Charts and protocols are how you keep them from sinking.',
  displayOrder: 3,
  lore: networkPlusLore,
};

export const examCodes = [{
  examCode: EXAM_CODE, examName: 'CompTIA Network+',
  scaledScoreMin: 100, scaledScoreMax: 900, passingScaledScore: 720,
  questionCount: 90, timeLimitMinutes: 90,
}];

export const domains = [
  { id: 'netplus-fund', certId: CERT_ID, title: 'Networking Fundamentals', blurb: 'OSI/TCP-IP models, topologies, addressing, subnetting.', weight: 0.23, displayOrder: 1 },
  { id: 'netplus-impl', certId: CERT_ID, title: 'Network Implementations', blurb: 'Switches, routers, wireless, cabling.', weight: 0.20, displayOrder: 2 },
  { id: 'netplus-ops', certId: CERT_ID, title: 'Network Operations', blurb: 'Documentation, monitoring, performance.', weight: 0.19, displayOrder: 3 },
  { id: 'netplus-sec', certId: CERT_ID, title: 'Network Security', blurb: 'Threats, vulnerabilities, hardening, identity.', weight: 0.14, displayOrder: 4 },
  { id: 'netplus-trbl', certId: CERT_ID, title: 'Network Troubleshooting', blurb: 'Methodology, common issues, command-line tools.', weight: 0.24, displayOrder: 5 },
];

export const objectives = [
  { id: 'netplus-obj-osi', certId: CERT_ID, domainId: 'netplus-fund', title: 'OSI Model and Encapsulation', difficulty: 'beginner', estimatedMinutes: 25, prerequisites: [], concepts: ['7 layers', 'PDUs', 'encapsulation'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 1 },
  { id: 'netplus-obj-subnet', certId: CERT_ID, domainId: 'netplus-fund', title: 'IPv4 Subnetting', difficulty: 'intermediate', estimatedMinutes: 40, prerequisites: ['netplus-obj-osi'], concepts: ['CIDR', 'masks', 'broadcast', 'host calculations'], masteryCriteria: { minQuizScore: 80, requiredReviews: 6, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 2 },
  { id: 'netplus-obj-wireless', certId: CERT_ID, domainId: 'netplus-impl', title: 'Wireless Standards and Security', difficulty: 'intermediate', estimatedMinutes: 25, prerequisites: [], concepts: ['802.11ax', 'WPA3', 'channels', 'interference'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: false }, displayOrder: 3 },
  { id: 'netplus-obj-tools', certId: CERT_ID, domainId: 'netplus-trbl', title: 'Command-Line Tools', difficulty: 'intermediate', estimatedMinutes: 30, prerequisites: [], concepts: ['ping', 'traceroute', 'nslookup', 'dig', 'ipconfig', 'ip', 'tcpdump'], masteryCriteria: { minQuizScore: 80, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 4 },
];

export const lessons = [
  {
    id: 'netplus-lesson-osi', certId: CERT_ID, objectiveId: 'netplus-obj-osi',
    title: 'The OSI Model You Will Actually Use', estimatedMinutes: 9,
    loreIntro: {
      scene: 'You arrive at OSI Tower. Admiral Ping is already there, waiting.',
      mentorMessage: 'This region\'s threat: mistaking the wrong layer for the broken one. Today\'s training: The OSI Model You Will Actually Use. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in The OSI Model You Will Actually Use so you can identify and resolve mistaking the wrong layer for the broken one on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'The OSI model is a vocabulary, not a religion. The exam wants you to map symptoms and protocols to layers.' },
      { kind: 'concept', body: '1 Physical: cables, signals. 2 Data Link: MAC, switches, frames. 3 Network: IP, routers, packets. 4 Transport: TCP/UDP, ports, segments. 5 Session: NetBIOS, RPC. 6 Presentation: encryption, encoding. 7 Application: HTTP, SMTP, DNS.' },
      { kind: 'analogy', body: 'Layer 1 is the road. Layer 2 is the postal worker reading the address on the envelope. Layer 3 is the post office routing between cities. Layer 4 is the priority/express service. Layers 5-7 are the letter inside.' },
      { kind: 'common_mistake', body: 'Treating "router" as Layer 4 because it does NAT and port forwarding. Routers are Layer 3 devices that may also perform L4 functions.' },
      { kind: 'check_for_understanding', body: 'Which layer does TLS operate at? Which layer does ARP operate at? (TLS sits between 6 and 7 in practice; ARP is layer 2.)' },
    ],
  },
  {
    id: 'netplus-lesson-subnet', certId: CERT_ID, objectiveId: 'netplus-obj-subnet',
    title: 'Subnetting Without Tears', estimatedMinutes: 12,
    loreIntro: {
      scene: 'You arrive at OSI Tower. Admiral Ping is already there, waiting.',
      mentorMessage: 'This region\'s threat: mistaking the wrong layer for the broken one. Today\'s training: Subnetting Without Tears. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in Subnetting Without Tears so you can identify and resolve mistaking the wrong layer for the broken one on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'Subnetting feels like math. It is actually pattern recognition — and the exam will test you on it under time pressure.' },
      { kind: 'concept', body: '/24 = 256 addresses, 254 usable, mask 255.255.255.0. Each /CIDR step halves or doubles the count: /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4 (2 usable).' },
      { kind: 'decision_table', body: 'Need 50 hosts? Use /26 (62 usable). Need 12 hosts? Use /28 (14 usable). Always pick the next size UP from the host count.' },
      { kind: 'common_mistake', body: 'Forgetting to subtract 2 (network and broadcast addresses are not assignable).' },
    ],
  },
  {
    id: 'netplus-lesson-tools', certId: CERT_ID, objectiveId: 'netplus-obj-tools',
    title: 'The Command-Line Triage Kit', estimatedMinutes: 9,
    loreIntro: {
      scene: 'You arrive at Subnet Isles. Admiral Ping is already there, waiting.',
      mentorMessage: 'This region\'s threat: off-by-one host counts and wildcard confusion. Today\'s training: The Command-Line Triage Kit. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in The Command-Line Triage Kit so you can identify and resolve off-by-one host counts and wildcard confusion on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'When the network breaks, your fastest answer is a command, not a GUI.' },
      { kind: 'command', body: 'ping <host> — basic reachability and RTT.\ntraceroute / tracert <host> — every hop.\nnslookup / dig <host> — DNS resolution.\nipconfig /all (Win) or ip addr (Linux) — local config.\narp -a — local ARP cache.\nnetstat -an — sockets and listening services.\ntcpdump -i <iface> — capture packets.' },
      { kind: 'troubleshoot_flow', body: '"I cannot reach X." → ping X. Fails? → ping gateway. Fails? → check link/IP. Works? → ping IP of X. Works? → DNS issue (nslookup). Fails? → routing issue (traceroute).' },
    ],
  },
];

const C = CERT_ID;

export const flashcards = [
  fc('netplus-fc-001', C, 'netplus-fund', 'netplus-obj-osi', 'OSI Layer 3 protocol example?', 'IP. Routers operate at Layer 3.', 'basic'),
  fc('netplus-fc-002', C, 'netplus-fund', 'netplus-obj-osi', 'OSI Layer 2 device?', 'Switch. It uses MAC addresses.', 'basic'),
  fc('netplus-fc-003', C, 'netplus-fund', 'netplus-obj-osi', 'TCP and UDP operate at which OSI layer?', 'Layer 4 (Transport).', 'basic'),
  fc('netplus-fc-004', C, 'netplus-fund', 'netplus-obj-osi', 'Which layer is encryption (TLS) considered to operate at?', 'Conventionally Layer 6 (Presentation), though TLS is implemented above TCP at Layer 4.', 'basic'),
  fc('netplus-fc-005', C, 'netplus-fund', 'netplus-obj-osi', 'Which layer handles MAC-to-IP address resolution (ARP)?', 'Layer 2/3 boundary. ARP is technically Layer 2 but resolves Layer 3 addresses.', 'basic'),
  fc('netplus-fc-006', C, 'netplus-fund', 'netplus-obj-subnet', 'How many usable hosts in a /26?', '62. (2^6 - 2 = 62.)', 'basic'),
  fc('netplus-fc-007', C, 'netplus-fund', 'netplus-obj-subnet', 'How many usable hosts in a /28?', '14. (2^4 - 2 = 14.)', 'basic'),
  fc('netplus-fc-008', C, 'netplus-fund', 'netplus-obj-subnet', 'CIDR for a 255.255.255.0 mask?', '/24.', 'basic'),
  fc('netplus-fc-009', C, 'netplus-fund', 'netplus-obj-subnet', 'CIDR for a 255.255.255.240 mask?', '/28. (240 = 11110000, four 1s in the last octet → /24 + 4 = /28.)', 'basic'),
  fc('netplus-fc-010', C, 'netplus-fund', 'netplus-obj-subnet', 'Smallest subnet to fit 100 hosts?', '/25. (126 usable hosts.)', 'basic'),
  fc('netplus-fc-011', C, 'netplus-impl', 'netplus-obj-wireless', '802.11ax common name?', 'Wi-Fi 6.', 'basic'),
  fc('netplus-fc-012', C, 'netplus-impl', 'netplus-obj-wireless', '802.11ac common name?', 'Wi-Fi 5.', 'basic'),
  fc('netplus-fc-013', C, 'netplus-impl', 'netplus-obj-wireless', 'Strongest current consumer Wi-Fi security standard?', 'WPA3.', 'basic'),
  fc('netplus-fc-014', C, 'netplus-impl', 'netplus-obj-wireless', 'Non-overlapping 2.4 GHz channels?', '1, 6, 11.', 'basic'),
  fc('netplus-fc-015', C, 'netplus-trbl', 'netplus-obj-tools', 'Command to view path each hop a packet takes (Linux)?', 'traceroute', 'command'),
  fc('netplus-fc-016', C, 'netplus-trbl', 'netplus-obj-tools', 'Command for DNS lookup with detailed output?', 'dig', 'command'),
  fc('netplus-fc-017', C, 'netplus-trbl', 'netplus-obj-tools', 'Command to capture network traffic on Linux?', 'tcpdump', 'command'),
  fc('netplus-fc-018', C, 'netplus-trbl', 'netplus-obj-tools', 'Command to view ARP cache?', 'arp -a', 'command'),
  fc('netplus-fc-019', C, 'netplus-fund', 'netplus-obj-osi', 'PDU at Layer 4?', 'Segment (TCP) or datagram (UDP).', 'basic'),
  fc('netplus-fc-020', C, 'netplus-fund', 'netplus-obj-osi', 'PDU at Layer 3?', 'Packet.', 'basic'),
  fc('netplus-fc-021', C, 'netplus-fund', 'netplus-obj-osi', 'PDU at Layer 2?', 'Frame.', 'basic'),
];

const E = EXAM_CODE;

export const questionBank = [
  q({ id: 'netplus-q-001', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'A user reports they cannot reach internal servers by hostname but can by IP. At which OSI layer is the service that has likely failed?',
    a: [['a','Layer 2'],['b','Layer 3'],['c','Layer 4'],['d','Layer 7',true]],
    why: 'DNS is an Application layer (Layer 7) service. Hostname-only failures point to it.',
    wrong: { a: 'Layer 2 issues affect MAC-level connectivity.', b: 'Layer 3 issues affect IP routing.', c: 'Layer 4 issues affect ports/transport.' },
    tags: ['osi','dns'], time: 45 }),

  q({ id: 'netplus-q-002', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'A network needs to support 50 hosts per subnet. What is the smallest CIDR that accommodates this?',
    a: [['a','/24'],['b','/25'],['c','/26',true],['d','/27']],
    why: '/26 = 62 usable hosts. /27 only allows 30 — not enough.',
    wrong: { a: '/24 works but wastes addresses.', b: '/25 works but wastes addresses.', d: '/27 only supports 30 hosts.' },
    tags: ['subnetting'], difficulty: 'medium', time: 75 }),

  q({ id: 'netplus-q-003', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'What is the broadcast address for the network 192.168.10.64/27?',
    a: [['a','192.168.10.95',true],['b','192.168.10.127'],['c','192.168.10.63'],['d','192.168.10.255']],
    why: 'A /27 has 32 addresses. The block is 64-95. Last address (95) is the broadcast.',
    wrong: { a: '', b: 'That would be the broadcast of 192.168.10.96/27 if the range were different.', c: 'That is the broadcast of the previous block.', d: 'That is the /24 broadcast.' },
    tags: ['subnetting','broadcast'], difficulty: 'hard', time: 90 }),

  q({ id: 'netplus-q-004', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'Which wireless security protocol should be selected for a new corporate deployment?',
    a: [['a','WEP'],['b','WPA'],['c','WPA2'],['d','WPA3',true]],
    why: 'WPA3 is the current standard and addresses weaknesses in WPA2 (KRACK, dictionary attacks).',
    wrong: { a: 'WEP is broken and must not be used.', b: 'WPA is deprecated.', c: 'WPA2 is acceptable but WPA3 is preferred for new deployments.' },
    tags: ['wireless','wpa3'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-005', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A user cannot reach an internal server. Which command sequence is the BEST first response?',
    a: [
      ['a','ping server, then ping gateway, then ping 8.8.8.8'],
      ['b','ping gateway, then ping server IP, then nslookup server name', true],
      ['c','traceroute server, then sfc /scannow'],
      ['d','tcpdump on the server']
    ],
    why: 'Verify local connectivity (gateway), then verify the server is reachable by IP, then verify DNS. This isolates each layer of failure.',
    tags: ['troubleshooting','methodology'], difficulty: 'medium', time: 75 }),

  q({ id: 'netplus-q-006', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'Which 2.4 GHz Wi-Fi channels do NOT overlap?',
    a: [['a','1, 5, 9'],['b','1, 6, 11', true],['c','2, 7, 12'],['d','3, 8, 13']],
    why: '1, 6, 11 are the standard non-overlapping 2.4 GHz channels in North America.',
    tags: ['wireless','channels'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-007', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'At which OSI layer does a switch primarily operate?',
    a: [['a','Layer 1'],['b','Layer 2', true],['c','Layer 3'],['d','Layer 4']],
    why: 'Standard switches forward based on MAC addresses — Layer 2.',
    wrong: { a: 'Hubs are Layer 1.', c: 'Layer 3 switches exist but the question asks about a basic switch.', d: 'Firewalls and load balancers operate at Layer 4.' },
    tags: ['osi','switch'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-008', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A network admin wants to capture all packets on eth0 destined for port 443. Which tcpdump expression is correct?',
    a: [
      ['a','tcpdump -i eth0 port 443', true],
      ['b','tcpdump --interface eth0 --filter 443'],
      ['c','tcpdump eth0:443'],
      ['d','tcpdump capture 443']
    ],
    why: '-i specifies the interface and "port 443" is the standard BPF filter expression.',
    tags: ['tcpdump','tools'], difficulty: 'hard', time: 60 }),

  q({ id: 'netplus-q-009', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'What is the network address of the host 10.20.30.165 with mask 255.255.255.224?',
    a: [['a','10.20.30.128'],['b','10.20.30.160', true],['c','10.20.30.192'],['d','10.20.30.0']],
    why: '/27 (mask 224) = blocks of 32. 165 falls in 160-191. Network address is 160.',
    tags: ['subnetting','network-address'], difficulty: 'hard', time: 90 }),

  q({ id: 'netplus-q-010', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: '802.11ax operates at which frequency bands? (Choose two.)',
    type: 'multiple_select',
    a: [['a','2.4 GHz', true],['b','5 GHz', true],['c','60 GHz'],['d','900 MHz'],['e','3.5 GHz']],
    why: 'Wi-Fi 6 (802.11ax) operates on both 2.4 and 5 GHz. Wi-Fi 6E adds 6 GHz.',
    tags: ['wireless','802.11ax'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-011', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'Which command shows the local ARP cache?',
    a: [['a','netstat -r'],['b','arp -a', true],['c','ipconfig /all'],['d','nslookup']],
    why: 'arp -a displays cached IP-to-MAC mappings.',
    tags: ['arp','tools'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-012', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'A frame is the PDU at which OSI layer?',
    a: [['a','Layer 1'],['b','Layer 2', true],['c','Layer 3'],['d','Layer 4']],
    why: 'Frames are Layer 2 PDUs. Bits at L1, packets at L3, segments at L4.',
    tags: ['osi','pdu'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-013', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A user reports slow web access. Ping to the gateway is 1 ms, ping to 8.8.8.8 is 250 ms with 30% loss, ping to internal servers is 1 ms. What is the most likely problem area?',
    a: [
      ['a','Local switch'],
      ['b','User\'s NIC'],
      ['c','ISP or upstream link', true],
      ['d','User\'s computer']
    ],
    why: 'Internal pings are healthy; external is slow with packet loss. The break is upstream of your gateway — the ISP.',
    tags: ['troubleshooting','isp'], difficulty: 'medium', time: 75 }),

  q({ id: 'netplus-q-014', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'How many /27 subnets can be created from a /24?',
    a: [['a','4'],['b','8', true],['c','16'],['d','32']],
    why: 'Going from /24 to /27 borrows 3 bits = 2^3 = 8 subnets.',
    tags: ['subnetting','vlsm'], difficulty: 'medium', time: 60 }),

  q({ id: 'netplus-q-015', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-tools',
    q: 'Which port and protocol does syslog typically use?',
    a: [['a','TCP 22'],['b','UDP 514', true],['c','TCP 443'],['d','UDP 53']],
    why: 'Syslog defaults to UDP 514. Some implementations support TCP for reliability.',
    tags: ['syslog','ports'], difficulty: 'medium', time: 30 }),

  // ── FUNDAMENTALS (14 new) ─────────────────────────────────────────────────

  q({ id: 'netplus-q-016', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'What is the decimal value of the binary number 11000000?',
    a: [['a','128'],['b','192', true],['c','224'],['d','240']],
    why: '11000000 = 128 + 64 = 192. Recognizing binary-to-decimal is essential for reading subnet masks.',
    wrong: { a: '10000000 = 128.', c: '11100000 = 224.', d: '11110000 = 240.' },
    tags: ['binary','subnetting'], difficulty: 'easy', time: 40 }),

  q({ id: 'netplus-q-017', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'Which of the following IP address ranges is a private IPv4 address range per RFC 1918?',
    a: [['a','172.32.0.0/12'],['b','172.16.0.0/12', true],['c','192.169.0.0/16'],['d','10.256.0.0/8']],
    why: 'RFC 1918 defines 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31), and 192.168.0.0/16 as private.',
    wrong: { a: '172.32 is outside the /12 private range.', c: '192.168, not 192.169.', d: '256 is not a valid octet.' },
    tags: ['private-ip','rfc1918'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-018', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'A host sends a packet to 255.255.255.255. What type of transmission is this?',
    a: [['a','Unicast'],['b','Multicast'],['c','Broadcast', true],['d','Anycast']],
    why: '255.255.255.255 is the limited broadcast address — sent to every host on the local network segment.',
    wrong: { a: 'Unicast is one-to-one.', b: 'Multicast uses the 224.0.0.0/4 range.', d: 'Anycast routes to the nearest of many.' },
    tags: ['broadcast','addressing'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-019', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'A host needs to send data to a group of receivers subscribed to the same stream. Which transmission type is MOST appropriate?',
    a: [['a','Unicast'],['b','Broadcast'],['c','Multicast', true],['d','Anycast']],
    why: 'Multicast delivers one packet to multiple subscribed receivers efficiently, avoiding the bandwidth waste of broadcast.',
    tags: ['multicast','addressing'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-020', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'Which of the following is a valid IPv6 link-local address prefix?',
    a: [['a','2001::/32'],['b','FC00::/7'],['c','FE80::/10', true],['d','FF00::/8']],
    why: 'FE80::/10 is the link-local prefix. These are auto-configured and not routed beyond the local segment.',
    wrong: { a: '2001::/32 is Teredo tunneling.', b: 'FC00::/7 is unique-local (like private IPv4).', d: 'FF00::/8 is IPv6 multicast.' },
    tags: ['ipv6','link-local'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-021', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'An administrator wants to enable IPv6 on a network that also runs IPv4 without replacing infrastructure. Which transition method allows both protocols to run on the same interface simultaneously?',
    a: [['a','6to4 tunneling'],['b','Dual stack', true],['c','NAT64'],['d','Teredo']],
    why: 'Dual stack means a device runs both IPv4 and IPv6 simultaneously on the same interface — no tunneling required.',
    wrong: { a: '6to4 encapsulates IPv6 in IPv4.', c: 'NAT64 translates between IPv6-only and IPv4-only hosts.', d: 'Teredo tunnels IPv6 through IPv4 NAT.' },
    tags: ['ipv6','dual-stack'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-022', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'At which OSI layer does ARP (Address Resolution Protocol) operate?',
    a: [['a','Layer 1'],['b','Layer 2', true],['c','Layer 3'],['d','Layer 4']],
    why: 'ARP resolves Layer 3 IP addresses to Layer 2 MAC addresses and is considered a Layer 2 protocol.',
    trap: 'ARP resolves IP (L3) addresses but itself operates at Layer 2. It is often listed at the "L2/L3 boundary" but on the exam choose Layer 2.',
    tags: ['arp','osi'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-023', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'Which PDU name corresponds to OSI Layer 3?',
    a: [['a','Bit'],['b','Frame'],['c','Packet', true],['d','Segment']],
    why: 'Layer 1=Bit, Layer 2=Frame, Layer 3=Packet, Layer 4=Segment. These are the standard PDU names tested on Network+.',
    tags: ['osi','pdu'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-024', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'ICMP is primarily used for which purpose?',
    a: [['a','Reliable data transfer'],['b','Name-to-IP resolution'],['c','Network diagnostics and error reporting', true],['d','Encrypted tunneling']],
    why: 'ICMP is the diagnostic and control protocol for IP networks — used by ping, traceroute, and to deliver unreachable/TTL-expired messages.',
    wrong: { a: 'TCP provides reliable transfer.', b: 'DNS handles name resolution.', d: 'IPsec handles tunneling.' },
    tags: ['icmp','protocols'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-025', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'During encapsulation, at which layer is a Layer 2 header (containing MAC addresses) added to the packet?',
    a: [['a','Layer 4 — Transport'],['b','Layer 3 — Network'],['c','Layer 2 — Data Link', true],['d','Layer 1 — Physical']],
    why: 'Encapsulation adds the Layer 2 header (source and destination MAC) at the Data Link layer, wrapping the Layer 3 packet into a frame.',
    tags: ['encapsulation','osi'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-026', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'What is the default subnet mask for a Class B IPv4 network?',
    a: [['a','255.0.0.0'],['b','255.255.0.0', true],['c','255.255.255.0'],['d','255.255.255.128']],
    why: 'Class A default is /8, Class B is /16 (255.255.0.0), Class C is /24. These defaults are tested directly on the exam.',
    tags: ['classful','subnet-mask'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-027', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'A network engineer has the 192.168.5.0/24 block and must create subnets of varying sizes to minimize address waste. What technique is this called?',
    a: [['a','Route summarization'],['b','VLSM (Variable-Length Subnet Masking)', true],['c','Supernetting'],['d','NAT overloading']],
    why: 'VLSM allows using different prefix lengths on different subnets of the same parent, minimizing wasted addresses.',
    wrong: { a: 'Route summarization aggregates routes for advertisement.', c: 'Supernetting combines networks.', d: 'NAT overloading maps many private IPs to one public IP.' },
    tags: ['vlsm','subnetting'], difficulty: 'medium', time: 50 }),

  q({ id: 'netplus-q-028', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-subnet',
    q: 'A network administrator wants to summarize the routes 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24, and 10.1.3.0/24 into a single advertisement. What summary route covers all four?',
    a: [['a','10.1.0.0/22', true],['b','10.1.0.0/23'],['c','10.1.0.0/21'],['d','10.0.0.0/8']],
    why: '10.1.0.0 through 10.1.3.255 spans exactly 4 /24 blocks = /22 (4 × 256 = 1024 addresses).',
    wrong: { b: '/23 only covers two /24 blocks (512 addresses).', c: '/21 covers eight /24 blocks — more than needed.', d: '/8 is the entire Class A range.' },
    tags: ['route-summarization','subnetting'], difficulty: 'hard', time: 90 }),

  q({ id: 'netplus-q-029', certId: C, examCode: E, domainId: 'netplus-fund', objectiveId: 'netplus-obj-osi',
    q: 'Which of the following BEST describes a Class A IPv4 address?',
    a: [
      ['a','First octet 128–191, default mask /16'],
      ['b','First octet 1–126, default mask /8', true],
      ['c','First octet 192–223, default mask /24'],
      ['d','First octet 224–239, reserved for multicast']
    ],
    why: 'Class A: first octet 1–126 (127 is loopback), default /8. Class B: 128–191, /16. Class C: 192–223, /24. Class D: 224–239, multicast.',
    tags: ['classful','ipv4'], difficulty: 'medium', time: 45 }),

  // ── IMPLEMENTATIONS (15 new) ──────────────────────────────────────────────

  q({ id: 'netplus-q-030', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A switch port is configured to belong to a single VLAN and connects to an end device. What mode should the port be in?',
    a: [['a','Trunk'],['b','Access', true],['c','Dynamic Desirable'],['d','Monitor']],
    why: 'Access ports carry traffic for one VLAN and connect to end devices. Trunk ports carry multiple VLANs between switches.',
    wrong: { a: 'Trunk ports carry 802.1Q-tagged traffic for multiple VLANs.', c: 'Dynamic Desirable negotiates trunking via DTP.', d: 'Monitor/SPAN is for traffic capture.' },
    tags: ['vlans','switching'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-031', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'In Spanning Tree Protocol (STP), how is the root bridge elected?',
    a: [
      ['a','The switch with the highest MAC address'],
      ['b','The switch with the lowest bridge ID (priority + MAC address)', true],
      ['c','The switch configured first on the network'],
      ['d','The switch with the most active ports']
    ],
    why: 'STP root bridge = lowest bridge ID. Bridge ID = configurable priority (default 32768) + MAC. Lower priority wins; tie breaks to lower MAC.',
    trap: 'The root bridge has the LOWEST bridge ID, not highest. On exam questions about STP, "lowest wins."',
    tags: ['stp','switching'], difficulty: 'medium', time: 50 }),

  q({ id: 'netplus-q-032', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'What standard defines 802.1Q VLAN tagging?',
    a: [['a','IEEE 802.3'],['b','IEEE 802.1X'],['c','IEEE 802.1Q', true],['d','IEEE 802.11']],
    why: '802.1Q inserts a 4-byte tag into Ethernet frames to carry VLAN ID across trunk links.',
    wrong: { a: '802.3 is Ethernet.', b: '802.1X is port-based NAC.', d: '802.11 is wireless LAN.' },
    tags: ['vlans','802.1q'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-033', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A network engineer wants to bundle four physical links between two switches into one logical link for bandwidth and redundancy. Which technology achieves this?',
    a: [['a','STP'],['b','VLAN trunking'],['c','EtherChannel (LACP)', true],['d','Spanning Tree PortFast']],
    why: 'EtherChannel (using LACP or PAgP) aggregates multiple physical links into a single logical link for throughput and redundancy.',
    wrong: { a: 'STP prevents loops but does not aggregate bandwidth.', b: 'VLAN trunking carries multiple VLANs but does not bundle links.', d: 'PortFast bypasses STP states on edge ports.' },
    tags: ['etherchannel','lacp'], difficulty: 'medium', time: 50 }),

  q({ id: 'netplus-q-034', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'Which PoE standard delivers up to 30 W per port and is sometimes called PoE+?',
    a: [['a','802.3af'],['b','802.3at', true],['c','802.3bt'],['d','802.3ab']],
    why: '802.3af (PoE) = 15.4 W; 802.3at (PoE+) = 30 W; 802.3bt (PoE++) = up to 90 W.',
    trap: '802.3bt is the highest at ~90 W for powering devices like PTZ cameras and laptops — do not confuse with 802.3at.',
    tags: ['poe','standards'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-035', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A technician needs to connect a single-mode fiber patch cable to a switch using a small form-factor connector common in data center environments. Which connector type should be used?',
    a: [['a','SC'],['b','ST'],['c','LC', true],['d','MPO']],
    why: 'LC (Lucent Connector) is the dominant small form-factor fiber connector in modern data center switches and SFP transceivers.',
    wrong: { a: 'SC is larger and older.', b: 'ST uses a twist-lock mechanism, mostly legacy.', d: 'MPO is used for parallel 40/100 GbE ribbon fiber arrays.' },
    tags: ['fiber','connectors'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-036', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A switch has an SFP+ slot. Which type of module does it accept?',
    a: [['a','QSFP+ for 40 GbE'],['b','SFP for 1 GbE only'],['c','SFP+ for 10 GbE', true],['d','CFP for 100 GbE']],
    why: 'SFP+ slots accept 10 GbE transceivers. SFP (without +) is 1 GbE; QSFP+ is 40 GbE; CFP/QSFP28 is 100 GbE.',
    tags: ['sfp','transceivers'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-037', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'During a wireless site survey, a technician finds significant dead zones near the elevator banks and stairwells. What is the PRIMARY recommendation?',
    a: [
      ['a','Increase the transmit power on existing APs'],
      ['b','Add access points near the dead-zone areas', true],
      ['c','Switch from 5 GHz to 2.4 GHz on all APs'],
      ['d','Enable channel bonding on the existing APs']
    ],
    why: 'Dead zones require additional AP placement. Increasing power can cause co-channel interference and does not address RF shadows.',
    wrong: { a: 'Higher power causes interference with neighboring APs.', c: '2.4 GHz has more range but also more congestion; the fix is coverage, not band.', d: 'Bonding widens channels but does not extend coverage to dead zones.' },
    tags: ['wireless','site-survey'], difficulty: 'medium', time: 50 }),

  q({ id: 'netplus-q-038', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: '802.11 Wi-Fi 6E adds access to which frequency band not available in Wi-Fi 6?',
    a: [['a','2.4 GHz'],['b','5 GHz'],['c','6 GHz', true],['d','60 GHz']],
    why: 'Wi-Fi 6E (802.11ax extended) adds the 6 GHz band, offering wide channels and reduced congestion.',
    tags: ['wireless','wifi6e'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-039', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'Which wireless technology allows an access point to communicate with multiple clients simultaneously using separate spatial streams?',
    a: [['a','MIMO'],['b','MU-MIMO', true],['c','OFDMA'],['d','Beamforming']],
    why: 'MU-MIMO (Multi-User MIMO) enables simultaneous communication with multiple clients. Regular MIMO serves only one client at a time per AP.',
    trap: 'MIMO serves multiple streams to ONE device. MU-MIMO serves multiple DEVICES at the same time.',
    tags: ['wireless','mu-mimo'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-040', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A cabling technician must follow TIA-568B wiring on both ends of a straight-through cable. What is the correct color order for pin 1?',
    a: [['a','Blue'],['b','Orange'],['c','White/Orange', true],['d','White/Green']],
    why: 'TIA-568B pin order: 1=White/Orange, 2=Orange, 3=White/Green, 4=Blue, 5=White/Blue, 6=Green, 7=White/Brown, 8=Brown.',
    trap: 'TIA-568A starts with White/Green on pin 1. A crossover cable uses 568A on one end and 568B on the other.',
    tags: ['cabling','tia568'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-041', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A network switch does not have PoE capability, but a new IP phone requires power over Ethernet. What device provides the most targeted solution?',
    a: [['a','Replace the switch with a PoE-capable model'],['b','Install a PoE injector on the phone\'s port', true],['c','Add a UPS to the switch'],['d','Use a PoE splitter on the switch side']],
    why: 'A PoE injector inserts DC power into the Ethernet cable between a non-PoE switch and the end device — no switch replacement needed.',
    wrong: { a: 'Valid but expensive; an injector is targeted and cheaper for one device.', d: 'A splitter is on the device side to separate data and power, not add power to a non-PoE run.' },
    tags: ['poe','injector'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-042', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'Which wireless feature automatically optimizes the client-to-AP connection as a client moves between APs on the same network?',
    a: [['a','Channel bonding'],['b','Band steering'],['c','Wireless roaming', true],['d','SSID bridging']],
    why: 'Wireless roaming (and features like 802.11r Fast BSS Transition) allows clients to move between APs with minimal disruption.',
    tags: ['wireless','roaming'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-043', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A cable installer needs to certify that a new Cat 6A installation meets specification. Which tool is MOST appropriate?',
    a: [['a','Cable toner and probe'],['b','Time-domain reflectometer (TDR)'],['c','Cable certification tester (e.g., Fluke DTX)', true],['d','Wi-Fi analyzer']],
    why: 'Cable certification testers measure and document insertion loss, return loss, crosstalk, and other parameters against TIA/ISO specifications.',
    wrong: { a: 'Toner/probe locates cables, does not certify performance.', b: 'TDR measures distance to a fault, not full certification parameters.', d: 'Wi-Fi analyzers are for wireless, not copper.' },
    tags: ['cabling','certification'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-044', certId: C, examCode: E, domainId: 'netplus-impl', objectiveId: 'netplus-obj-wireless',
    q: 'A network uses LACP to bundle links. In LACP, what mode must BOTH sides be in to form an EtherChannel?',
    a: [
      ['a','Both must be set to "on" (static)'],
      ['b','One must be Active, the other can be Passive or Active', true],
      ['c','Both must be set to "PAgP desirable"'],
      ['d','Both must be set to Passive']
    ],
    why: 'LACP forms when at least one end is Active (initiates negotiation). Active+Active or Active+Passive both work. Passive+Passive will NOT form.',
    trap: 'Passive+Passive never forms an LACP bundle. At least one side must be Active.',
    tags: ['lacp','etherchannel'], difficulty: 'hard', time: 60 }),

  // ── OPERATIONS (17 new) ───────────────────────────────────────────────────

  q({ id: 'netplus-q-045', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'What is the key difference between a logical network diagram and a physical network diagram?',
    a: [
      ['a','Logical shows IP addressing and routing; physical shows device locations and cable runs', true],
      ['b','Physical uses color coding; logical uses black and white'],
      ['c','Logical diagrams are only for wireless networks'],
      ['d','They are the same diagram with different labels']
    ],
    why: 'Logical diagrams show addressing, protocols, and traffic flow. Physical diagrams show actual hardware placement, rack layouts, and cabling paths.',
    tags: ['documentation','diagrams'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-046', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which DNS record type maps a hostname to an IPv6 address?',
    a: [['a','A'],['b','AAAA', true],['c','PTR'],['d','CNAME']],
    why: 'AAAA records map hostnames to IPv6 addresses. A records map to IPv4. PTR is reverse lookup. CNAME is an alias.',
    tags: ['dns','ipv6'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-047', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which DNS record type is used to designate the mail server(s) responsible for accepting email for a domain?',
    a: [['a','A'],['b','TXT'],['c','MX', true],['d','SRV']],
    why: 'MX (Mail Exchanger) records specify the mail servers for a domain and their priority values.',
    tags: ['dns','mx'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-048', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A DHCP server assigns addresses from the 192.168.100.50–192.168.100.200 range. A new printer needs a permanent IP of 192.168.100.100. What DHCP feature ensures it always gets that address?',
    a: [['a','DHCP relay agent'],['b','DHCP exclusion'],['c','DHCP reservation', true],['d','DHCP superscope']],
    why: 'A DHCP reservation ties a specific IP address to a device\'s MAC address, ensuring it always receives that address.',
    wrong: { a: 'Relay agent forwards DHCP broadcasts across routers.', b: 'Exclusion removes addresses from the scope pool but does not assign them.', d: 'Superscope combines multiple scopes for large subnets.' },
    tags: ['dhcp','reservation'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-049', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A DHCP client on a remote subnet needs to reach a DHCP server on a different subnet. Which device/feature forwards the DHCP broadcast?',
    a: [['a','DHCP reservation'],['b','DHCP relay agent (IP helper address)', true],['c','DNS forwarder'],['d','Proxy ARP']],
    why: 'DHCP relay agents (configured with "ip helper-address" on a router) forward DHCP broadcasts as unicasts to the DHCP server.',
    tags: ['dhcp','relay'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-050', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which version of SNMP introduced encryption and authentication, addressing the clear-text vulnerabilities of earlier versions?',
    a: [['a','SNMPv1'],['b','SNMPv2c'],['c','SNMPv3', true],['d','SNMP over TLS (SNMPTLS)']],
    why: 'SNMPv3 added authentication (MD5/SHA) and privacy (DES/AES encryption). v1 and v2c use community strings in clear text.',
    trap: 'SNMPv2c improved performance but kept the clear-text community string vulnerability. Only v3 is considered secure.',
    tags: ['snmp','security'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-051', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A syslog message has severity level 2. What does this level indicate?',
    a: [['a','Informational'],['b','Warning'],['c','Critical', true],['d','Debug']],
    why: 'Syslog levels: 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice, 6=Informational, 7=Debug. Lower number = higher severity.',
    trap: 'Remember: 0 is most severe, 7 is least. Many people get these inverted.',
    tags: ['syslog','severity'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-052', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'What is the PRIMARY purpose of NetFlow?',
    a: [
      ['a','To capture full packet payloads for forensics'],
      ['b','To monitor and export IP traffic flow metadata for analysis', true],
      ['c','To configure routing protocols remotely'],
      ['d','To enforce QoS policies on WAN links']
    ],
    why: 'NetFlow collects metadata about network flows (source/dest IP, port, protocol, byte count) — not full payloads — and exports it for traffic analysis.',
    wrong: { a: 'Wireshark/tcpdump capture full payloads.', c: 'SNMP and CLI handle configuration.', d: 'QoS uses DiffServ/DSCP markings.' },
    tags: ['netflow','monitoring'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-053', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'An NTP server synchronized to a GPS clock is stratum 1. A router synced to that server is which stratum?',
    a: [['a','Stratum 0'],['b','Stratum 1'],['c','Stratum 2', true],['d','Stratum 3']],
    why: 'Each NTP hop adds one stratum. GPS reference = stratum 0, server directly connected = stratum 1, device synced to that server = stratum 2.',
    tags: ['ntp','stratum'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-054', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which tool helps network administrators track and manage all assigned IP addresses across subnets in a large network?',
    a: [['a','SIEM'],['b','IPAM (IP Address Management)', true],['c','SNMP trap receiver'],['d','Protocol analyzer']],
    why: 'IPAM software maintains a database of IP address assignments, subnets, and availability — preventing duplicate IPs and simplifying audits.',
    tags: ['ipam','operations'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-055', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'What is the purpose of establishing a performance baseline on a network?',
    a: [
      ['a','To block unauthorized users from the network'],
      ['b','To define normal behavior so anomalies can be detected', true],
      ['c','To set QoS priority for real-time traffic'],
      ['d','To automatically block DDoS traffic']
    ],
    why: 'A baseline captures normal traffic volumes, latency, and utilization. Deviations from baseline trigger alerts and help identify problems.',
    tags: ['baseline','monitoring'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-056', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A technician is scheduling maintenance that will take a switch offline for 30 minutes. What process formally authorizes and documents this activity?',
    a: [['a','Incident report'],['b','Change management / change window', true],['c','Root cause analysis'],['d','SLA review']],
    why: 'Change management processes require approval, documentation, and scheduling of maintenance windows to minimize unplanned downtime and risk.',
    tags: ['change-management','operations'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-057', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which term describes the ability of a system to continue operating at full capacity even when one component fails?',
    a: [['a','High availability'],['b','Fault tolerance', true],['c','Disaster recovery'],['d','Business continuity']],
    why: 'Fault tolerance means zero downtime on component failure (e.g., RAID-1 serving reads from the surviving disk). High availability tolerates short outages.',
    trap: 'High availability uses redundancy to minimize downtime. Fault tolerance uses redundancy to eliminate it entirely.',
    tags: ['fault-tolerance','ha'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-058', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A load balancer distributes incoming requests to servers in order, cycling through all servers equally. Which algorithm is this?',
    a: [['a','Least connections'],['b','Round-robin', true],['c','Weighted round-robin'],['d','IP hash']],
    why: 'Round-robin sends each new request to the next server in a circular list. Least connections sends to the server with fewest active sessions.',
    tags: ['load-balancing','algorithms'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-059', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'Which DNS record type provides an alias, mapping one hostname to another canonical hostname?',
    a: [['a','A'],['b','PTR'],['c','CNAME', true],['d','SOA']],
    why: 'CNAME records point one name to another name (the canonical name). The resolver then looks up the canonical name.',
    tags: ['dns','cname'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-060', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'A DNS record that maps an IP address back to a hostname is called what?',
    a: [['a','A record'],['b','MX record'],['c','PTR record', true],['d','SRV record']],
    why: 'PTR (Pointer) records provide reverse DNS lookup — IP to hostname. They live in the in-addr.arpa zone.',
    tags: ['dns','ptr'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-061', certId: C, examCode: E, domainId: 'netplus-ops', objectiveId: 'netplus-obj-osi',
    q: 'What type of documentation records port assignments, VLAN memberships, and IP addresses for every switch port in a network?',
    a: [['a','Network topology diagram'],['b','Cable management plan'],['c','Port inventory / wiring schedule', true],['d','Network baseline report']],
    why: 'A port inventory or wiring schedule provides per-port detail: device connected, VLAN, IP, patch panel location — essential for troubleshooting and audits.',
    tags: ['documentation','asset-management'], difficulty: 'medium', time: 40 }),

  // ── SECURITY (12 new) ─────────────────────────────────────────────────────

  q({ id: 'netplus-q-062', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'An attacker sends forged ARP replies to associate their MAC address with the gateway IP, intercepting traffic intended for the gateway. What attack is this?',
    a: [['a','MAC flooding'],['b','ARP spoofing (ARP poisoning)', true],['c','VLAN hopping'],['d','IP spoofing']],
    why: 'ARP spoofing poisons the ARP cache of victims to redirect traffic through the attacker — enabling man-in-the-middle attacks.',
    tags: ['arp-spoofing','attacks'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-063', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'An attacker fills a switch CAM table with thousands of fake MAC addresses, causing the switch to flood frames out all ports. What attack is this?',
    a: [['a','ARP spoofing'],['b','MAC flooding', true],['c','STP manipulation'],['d','VLAN hopping']],
    why: 'MAC flooding exhausts the switch CAM table, forcing the switch into hub behavior (flooding all ports), allowing the attacker to capture traffic.',
    tags: ['mac-flooding','attacks'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-064', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'Which security zone concept places publicly accessible servers (web, email, DNS) on a network segment isolated from both the internet and internal LAN?',
    a: [['a','Honeypot network'],['b','Management VLAN'],['c','DMZ (demilitarized zone)', true],['d','Guest VLAN']],
    why: 'A DMZ (screened subnet) isolates public-facing servers so a compromise does not directly expose the internal network.',
    tags: ['dmz','network-security'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-065', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'Which type of firewall tracks the state of active connections and allows return traffic for established sessions?',
    a: [['a','Packet filter (stateless)'],['b','Stateful inspection firewall', true],['c','Application proxy firewall'],['d','WAF']],
    why: 'Stateful firewalls track TCP/UDP session state in a state table, allowing return traffic without explicit outbound-to-inbound rules.',
    trap: 'Stateless packet filters check every packet independently — they cannot track connection state and require explicit rules in both directions.',
    tags: ['firewall','stateful'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-066', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'In an ACL, if no rule matches a packet, what happens by default?',
    a: [['a','The packet is logged and forwarded'],['b','The packet is forwarded on the best-effort path'],['c','The packet is silently dropped (implicit deny)', true],['d','The packet triggers an ICMP unreachable message']],
    why: 'ACLs have an implicit deny-all at the end. Any traffic not explicitly permitted is dropped.',
    trap: 'Not all ACLs send an ICMP unreachable — many silently discard. The exam wants "implicit deny."',
    tags: ['acl','firewall'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-067', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'Which protocol provides centralized authentication, authorization, and accounting (AAA) and encrypts only the password by default?',
    a: [['a','TACACS+'],['b','RADIUS', true],['c','Kerberos'],['d','LDAP']],
    why: 'RADIUS encrypts only the password field in the access-request packet. TACACS+ encrypts the entire body.',
    trap: 'TACACS+ encrypts everything and separates authentication from authorization. RADIUS bundles them and encrypts only the password.',
    tags: ['radius','tacacs','aaa'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-068', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-wireless',
    q: 'A company wants to ensure only corporate devices can connect to the network via 802.1X. Which protocol family provides port-based Network Access Control?',
    a: [['a','802.11i'],['b','802.1X', true],['c','802.3af'],['d','802.1Q']],
    why: '802.1X is the IEEE standard for port-based NAC. Devices must authenticate (typically via EAP + RADIUS) before the switch port opens.',
    tags: ['802.1x','nac'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-069', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-wireless',
    q: 'A security team deploys a system that deliberately appears to be a vulnerable server, designed to lure and monitor attackers without risking real data. What is this called?',
    a: [['a','SIEM'],['b','IDS'],['c','Honeynet'],['d','Honeypot', true]],
    why: 'A honeypot is a decoy system designed to attract attackers. A honeynet is a network of multiple honeypots.',
    tags: ['honeypot','security'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-070', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-wireless',
    q: 'An attacker broadcasts deauthentication frames to force wireless clients off their legitimate AP. What attack is this?',
    a: [['a','Evil twin'],['b','War driving'],['c','Replay attack'],['d','Wireless deauthentication attack', true]],
    why: 'Deauth attacks exploit the unprotected management frame flaw in 802.11 (pre-802.11w). Clients are kicked off and may connect to an attacker\'s evil twin.',
    tags: ['wireless-attacks','deauth'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-071', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-wireless',
    q: 'Which VPN protocol encapsulates data at Layer 2 and is often combined with IPsec for security?',
    a: [['a','SSL VPN'],['b','IPsec tunnel mode'],['c','L2TP', true],['d','GRE only']],
    why: 'L2TP (Layer 2 Tunneling Protocol) tunnels Layer 2 frames but provides no encryption — IPsec is paired with it (L2TP/IPsec) for security.',
    trap: 'L2TP alone has no encryption. The exam may ask about L2TP/IPsec as a full solution.',
    tags: ['vpn','l2tp'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-072', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-wireless',
    q: 'An attacker drives around a neighborhood scanning for open or weakly secured Wi-Fi networks. What is this activity called?',
    a: [['a','Evil twin attack'],['b','Deauthentication attack'],['c','War driving', true],['d','Bluejacking']],
    why: 'War driving is the practice of scanning for wireless networks while in a moving vehicle, mapping SSIDs and their security configurations.',
    tags: ['wireless-attacks','war-driving'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-073', certId: C, examCode: E, domainId: 'netplus-sec', objectiveId: 'netplus-obj-osi',
    q: 'An attacker accesses a trunk port and sends frames tagged with VLAN 200 to reach a device on that VLAN without authorization. What attack is this?',
    a: [['a','ARP spoofing'],['b','MAC flooding'],['c','VLAN hopping', true],['d','Double-tagging attack']],
    why: 'VLAN hopping can be done via double-tagging or by negotiating a trunk link (DTP). An attacker on a trunk port can send traffic to any VLAN.',
    trap: 'Double-tagging is a specific VLAN hopping technique. Both "VLAN hopping" and "double-tagging" may appear on the exam — they are related.',
    tags: ['vlan-hopping','attacks'], difficulty: 'hard', time: 55 }),

  // ── TROUBLESHOOTING (17 new) ──────────────────────────────────────────────

  q({ id: 'netplus-q-074', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'The CompTIA Network+ troubleshooting methodology includes which step IMMEDIATELY after identifying the problem?',
    a: [
      ['a','Implement the solution'],
      ['b','Establish a theory of probable cause', true],
      ['c','Document findings'],
      ['d','Escalate to the vendor']
    ],
    why: 'CompTIA\'s 7-step methodology: 1-Identify, 2-Establish theory, 3-Test theory, 4-Establish action plan, 5-Implement, 6-Verify, 7-Document.',
    tags: ['troubleshooting','methodology'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-075', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A Windows workstation shows the IP address 169.254.88.12. What does this indicate?',
    a: [
      ['a','The device is configured with a static IP'],
      ['b','The device failed to receive a DHCP lease and assigned itself an APIPA address', true],
      ['c','The device is on an IPv6 link-local address'],
      ['d','The DHCP server assigned a reserved address']
    ],
    why: '169.254.x.x is an APIPA (Automatic Private IP Addressing) address — Windows self-assigns this when DHCP fails.',
    trap: 'IPv6 link-local starts with FE80. 169.254.x.x is IPv4 APIPA — a sign DHCP is unreachable.',
    tags: ['dhcp','apipa','troubleshooting'], difficulty: 'easy', time: 30 }),

  q({ id: 'netplus-q-076', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A traceroute shows asterisks (*) at hops 4 and 5 but the destination still responds. What is the MOST likely explanation?',
    a: [
      ['a','The destination is offline'],
      ['b','There is packet loss on the entire path'],
      ['c','Intermediate routers are not responding to ICMP/UDP probes but are forwarding traffic', true],
      ['d','The local router is filtering outbound traffic']
    ],
    why: 'Many routers drop TTL-expired probes (ICMP or UDP) but still forward normal traffic. Asterisks only mean no ICMP response — not that the hop is broken.',
    trap: 'Asterisks in traceroute do NOT always mean the path is broken. If the final destination responds, those intermediate hops just drop TTL probes.',
    tags: ['traceroute','icmp'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-077', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A cable test shows high near-end crosstalk (NEXT). What does this indicate about the cable?',
    a: [
      ['a','The cable is too long and signal is attenuating'],
      ['b','The cable has an open circuit'],
      ['c','Signal from one pair is interfering with an adjacent pair near the source', true],
      ['d','The cable is a crossover instead of straight-through']
    ],
    why: 'NEXT measures signal coupling between adjacent pairs near the source end — caused by poor twists, damaged insulation, or incorrect termination.',
    tags: ['cabling','crosstalk'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-078', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'Users on one side of a network report the link is up but throughput is extremely low with many retransmissions. The switch shows CRC errors. What is the MOST likely cause?',
    a: [
      ['a','A duplicate IP address'],
      ['b','A duplex mismatch between the NIC and switch port', true],
      ['c','An incorrect default gateway'],
      ['d','DNS resolution failure']
    ],
    why: 'Duplex mismatches cause late collisions and CRC errors on the full-duplex side, resulting in poor throughput despite the link remaining up.',
    trap: 'Duplex mismatches don\'t drop the link — they degrade performance silently. This is a classic trap question.',
    tags: ['duplex-mismatch','troubleshooting'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-079', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A router\'s routing table has no route for destination 10.20.30.0/24 and no default route. What happens to packets destined for that network?',
    a: [
      ['a','They are forwarded to the closest match'],
      ['b','They are dropped and the router sends ICMP Destination Unreachable', true],
      ['c','They are held in a queue until a route appears'],
      ['d','They are sent back to the sender unchanged']
    ],
    why: 'When no route matches and there is no default route, the router drops the packet and sends an ICMP Destination Unreachable message to the source.',
    tags: ['routing','icmp'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-080', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'Users cannot resolve any hostnames. Ping to 8.8.8.8 succeeds. Ping to www.google.com fails. Which tool confirms whether DNS is responding?',
    a: [['a','traceroute 8.8.8.8'],['b','netstat -an'],['c','nslookup www.google.com', true],['d','ipconfig /flushdns']],
    why: 'nslookup directly tests DNS resolution. Since IP connectivity works (ping 8.8.8.8 succeeds), the fault is in DNS, and nslookup will confirm whether the DNS server responds.',
    tags: ['dns','nslookup','troubleshooting'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-081', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'What is the FIRST step in a top-down OSI troubleshooting approach?',
    a: [
      ['a','Check physical cables and link lights'],
      ['b','Start at the Application layer and work downward', true],
      ['c','Check routing tables first'],
      ['d','Verify DHCP is responding']
    ],
    why: 'Top-down starts at Layer 7 (Application) — verifying the application/service works — then moves down through the OSI stack.',
    trap: 'Bottom-up starts at Layer 1 (Physical). Top-down starts at Layer 7. Know both approaches for the exam.',
    tags: ['troubleshooting','osi'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-082', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A technician uses netstat -an and sees a local port in LISTEN state. What does this indicate?',
    a: [
      ['a','The port is actively sending data'],
      ['b','A service is waiting for incoming connections on that port', true],
      ['c','The connection was closed by the remote host'],
      ['d','The port is blocked by a firewall']
    ],
    why: 'LISTEN in netstat means a service has bound to that port and is accepting new incoming TCP connections.',
    tags: ['netstat','tools'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-083', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'Multiple users on the same switch report that broadcasts are flooding all ports continuously, slowing the network to a halt. Which issue is MOST likely?',
    a: [
      ['a','A DHCP server is malfunctioning'],
      ['b','A routing loop has formed'],
      ['c','A switching loop is causing a broadcast storm', true],
      ['d','The default gateway is down']
    ],
    why: 'Switching loops cause broadcast frames to circulate forever (broadcast storm) because Layer 2 has no TTL. STP should prevent this but can fail if misconfigured or disabled.',
    tags: ['stp','broadcast-storm','troubleshooting'], difficulty: 'medium', time: 50 }),

  q({ id: 'netplus-q-084', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A fiber uplink experiences intermittent high packet loss. No errors appear on the copper side. Which is the MOST likely cause specific to fiber?',
    a: [
      ['a','Duplex mismatch'],
      ['b','High attenuation due to dirty fiber connectors or excessive bends', true],
      ['c','VLAN misconfiguration'],
      ['d','IP address conflict']
    ],
    why: 'Fiber attenuation from dirty connectors, excessive bends (bend radius violations), or damaged fiber causes intermittent loss — clean and inspect connectors first.',
    tags: ['fiber','attenuation'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-085', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A VPN client authenticates successfully but cannot reach any resources on the remote network. Traffic from the VPN server to those resources is not reaching them. Which is the MOST likely cause?',
    a: [
      ['a','Incorrect VPN credentials'],
      ['b','Missing or incorrect routes on the VPN server or firewall for the remote subnet', true],
      ['c','A DNS server failure'],
      ['d','An expired certificate on the client']
    ],
    why: 'If VPN authentication succeeds but traffic doesn\'t pass, routing is the culprit. The VPN server or firewall lacks a route to the destination subnet, or the firewall blocks VPN traffic.',
    wrong: { a: 'Credential failure would prevent VPN tunnel establishment.', d: 'Expired cert causes tunnel failure, not post-connect routing issues.' },
    tags: ['vpn','routing','troubleshooting'], difficulty: 'hard', time: 60 }),

  q({ id: 'netplus-q-086', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A switch port repeatedly goes up and down every few seconds. What is this behavior called?',
    a: [['a','Broadcast storm'],['b','Duplex mismatch'],['c','Port flapping', true],['d','STP loop']],
    why: 'Port flapping (rapid link state transitions) can be caused by a faulty cable, faulty NIC, STP topology changes, or a misconfigured interface.',
    tags: ['port-flapping','troubleshooting'], difficulty: 'medium', time: 40 }),

  q({ id: 'netplus-q-087', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A cable test shows an "open" fault 35 meters from one end. What does this indicate?',
    a: [
      ['a','The cable pairs are crossed'],
      ['b','There is excessive crosstalk'],
      ['c','The cable conductor is broken at that distance', true],
      ['d','The cable impedance is mismatched']
    ],
    why: 'An open fault means the circuit is broken — no continuity. TDR (time-domain reflectometer) can identify the exact distance to the break.',
    tags: ['cabling','tdr','open-fault'], difficulty: 'medium', time: 45 }),

  q({ id: 'netplus-q-088', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'Which ping flag on Linux specifies the packet size to send for testing MTU-related issues?',
    a: [['a','ping -c'],['b','ping -t'],['c','ping -s', true],['d','ping -n']],
    why: 'ping -s <size> sets the data payload size. Combined with the -M do (no fragment) flag, it tests MTU path discovery.',
    wrong: { a: '-c sets the count.', b: '-t on Linux sets TTL.', d: '-n suppresses name resolution.' },
    tags: ['ping','mtu','tools'], difficulty: 'hard', time: 55 }),

  q({ id: 'netplus-q-089', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A Wireshark capture shows a high rate of TCP retransmissions and duplicate ACKs between two hosts. What does this MOST likely indicate?',
    a: [
      ['a','A DNS failure'],
      ['b','Packet loss on the network path causing TCP retransmissions', true],
      ['c','A VLAN configuration error'],
      ['d','The server\'s NIC is operating in half-duplex']
    ],
    why: 'TCP retransmissions and duplicate ACKs are direct evidence of packet loss — TCP\'s reliability mechanism kicks in to retransmit dropped segments.',
    trap: 'Duplicate ACKs alone can also trigger fast retransmit — in any case, they indicate segments are not arriving in order, implying loss or reordering.',
    tags: ['wireshark','tcp','troubleshooting'], difficulty: 'exam_level', time: 75 }),

  q({ id: 'netplus-q-090', certId: C, examCode: E, domainId: 'netplus-trbl', objectiveId: 'netplus-obj-tools',
    q: 'A user reports intermittent connectivity that only occurs during periods of high network utilization. Cables and hardware test clean. What is MOST likely causing this?',
    a: [
      ['a','A routing loop'],
      ['b','Network congestion and buffer overflow causing packet drops', true],
      ['c','A DNS caching issue'],
      ['d','A duplex mismatch on the uplink']
    ],
    why: 'Intermittent issues tied to utilization spikes indicate congestion — switch buffers fill and packets are dropped during peak load.',
    tags: ['congestion','troubleshooting'], difficulty: 'exam_level', time: 75 }),
];

export const sideQuests = [{
  id: 'netplus-quest-subnet', certId: CERT_ID, objectiveId: 'netplus-obj-subnet',
  template: 'cable_crafter' as const,
  title: 'The Subnetting Drill',
  story: 'Your manager hands you a list of network requirements and asks for the right CIDR for each. You have five minutes.',
  payload: {
    passThreshold: 80,
    items: [
      { id: 'i1', label: 'Need 100 hosts', answer: '/25', distractors: ['/24', '/26', '/27'] },
      { id: 'i2', label: 'Need 30 hosts', answer: '/27', distractors: ['/26', '/28', '/29'] },
      { id: 'i3', label: 'Need 14 hosts', answer: '/28', distractors: ['/27', '/29', '/30'] },
      { id: 'i4', label: 'Need 6 hosts', answer: '/29', distractors: ['/28', '/30', '/27'] },
      { id: 'i5', label: 'Point-to-point link (2 hosts)', answer: '/30', distractors: ['/31', '/29', '/28'] },
    ],
  },
}];

export const bossBattles = [{
  id: 'netplus-boss-outage', certId: CERT_ID, objectiveIds: ['netplus-obj-osi','netplus-obj-tools','netplus-obj-subnet'],
  title: 'The Branch Office Outage',
  storySetup: 'A 40-person branch office cannot reach corporate resources. Their internet works fine. Site-to-site VPN to HQ is up. You have CLI access to their router.',
  scenario: 'Walk through your full diagnostic: which OSI layer do you start at, which commands do you run, and how do you isolate whether the problem is in their LAN, the VPN, or HQ\'s firewall?',
  constraints: ['Remote CLI only', 'No HQ admin available', 'Branch staff cannot help technically'],
  rubric: {
    passThreshold: 75,
    dimensions: [
      { key: 'layer_isolation', weight: 0.30, description: 'Did you isolate the failure to a specific OSI layer?' },
      { key: 'tool_choice', weight: 0.25, description: 'Did you choose appropriate commands?' },
      { key: 'sequence', weight: 0.25, description: 'Was your diagnostic order efficient?' },
      { key: 'communication', weight: 0.20, description: 'Did you communicate status to non-technical branch staff?' },
    ],
  },
  remediation: { layer_isolation: ['netplus-fc-001','netplus-fc-002'], tool_choice: ['netplus-fc-015','netplus-fc-016'], sequence: [], communication: [] },
}];

export const practiceExams = [{
  id: 'netplus-mini-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'Network+ Mini Practice Exam', mode: 'mini' as const,
  questionCount: 10, timeLimitSeconds: 15 * 60,
  passingScaledScore: 720, scaledScoreMax: 900, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'netplus-fund', questionCount: 3 },
    { domainId: 'netplus-impl', questionCount: 2 },
    { domainId: 'netplus-ops', questionCount: 1 },
    { domainId: 'netplus-sec', questionCount: 1 },
    { domainId: 'netplus-trbl', questionCount: 3 },
  ],
  difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.25, exam_level: 0.05 },
  unlockRequirements: { minReadiness: 0, minDomainReadiness: 0, requiredBossBattlesPassed: [], minQuizAttempts: 0, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}, {
  id: 'netplus-full-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'Network+ Full Practice Exam', mode: 'full' as const,
  questionCount: 90, timeLimitSeconds: 90 * 60,
  passingScaledScore: 720, scaledScoreMax: 900, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'netplus-fund', questionCount: 21 },
    { domainId: 'netplus-impl', questionCount: 18 },
    { domainId: 'netplus-ops', questionCount: 17 },
    { domainId: 'netplus-sec', questionCount: 13 },
    { domainId: 'netplus-trbl', questionCount: 21 },
  ],
  difficultyMix: { easy: 0.15, medium: 0.45, hard: 0.30, exam_level: 0.10 },
  unlockRequirements: { minReadiness: 80, minDomainReadiness: 65, requiredBossBattlesPassed: ['netplus-boss-outage'], minQuizAttempts: 3, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}];

export const glossary = [
  { term: 'CIDR', definition: 'Classless Inter-Domain Routing — the slash notation for subnet masks.' },
  { term: 'VLAN', definition: 'Virtual LAN — a logical Layer 2 segment that isolates traffic on a switch.' },
  { term: 'NAT', definition: 'Network Address Translation — mapping private IPs to public ones at the router.' },
  { term: 'BGP', definition: 'Border Gateway Protocol — the routing protocol used between autonomous systems on the internet.' },
];

export const acronyms = [
  { acronym: 'OSPF', expansion: 'Open Shortest Path First', meaning: 'Link-state interior gateway routing protocol.' },
  { acronym: 'STP', expansion: 'Spanning Tree Protocol', meaning: 'Layer 2 protocol that prevents switch loops.' },
  { acronym: 'SNMP', expansion: 'Simple Network Management Protocol', meaning: 'Protocol for monitoring and managing network devices.' },
];

export const examTraps = [
  { trap: 'Subnet borrowing', explanation: 'Always count the network and broadcast addresses as unusable. /30 has 4 addresses but only 2 usable.' },
  { trap: 'Channel overlap', explanation: '2.4 GHz uses 1, 6, 11. Any other combination has overlap.' },
];
