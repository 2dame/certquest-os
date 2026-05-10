/**
 * Cisco CCNA (200-301 v1.1) — Router Kingdom theme.
 */

import { q, fc } from '../../authoring';
import { ccnaLore } from '../../lore/ccna';

export const CERT_ID = 'ccna';
export const EXAM_CODE = '200-301';

export const meta = {
  id: CERT_ID, provider: 'cisco' as const,
  examName: 'Cisco Certified Network Associate', examCode: EXAM_CODE,
  examVersion: 'verify-before-publish',
  officialSourceUrl: 'https://learningnetwork.cisco.com/s/ccna',
  lastVerifiedDate: '2026-05-01',
  themeName: 'Router Kingdom',
  themeBlurb: 'A kingdom of routers and switches. Each command at the CLI is a decree. Mistype one and the kingdom routes packets to the wrong continent.',
  displayOrder: 6,
  lore: ccnaLore,
};

export const examCodes = [{
  examCode: EXAM_CODE, examName: 'Cisco Certified Network Associate',
  scaledScoreMin: 300, scaledScoreMax: 1000, passingScaledScore: 825,
  questionCount: 100, timeLimitMinutes: 120,
}];

export const domains = [
  { id: 'ccna-fund', certId: CERT_ID, title: 'Network Fundamentals', blurb: 'Components, topologies, IPv4/IPv6, wireless principles.', weight: 0.20, displayOrder: 1 },
  { id: 'ccna-access', certId: CERT_ID, title: 'Network Access', blurb: 'VLANs, trunks, EtherChannel, STP, Wireless LAN.', weight: 0.20, displayOrder: 2 },
  { id: 'ccna-ip', certId: CERT_ID, title: 'IP Connectivity', blurb: 'Routing, OSPF, FHRPs.', weight: 0.25, displayOrder: 3 },
  { id: 'ccna-services', certId: CERT_ID, title: 'IP Services', blurb: 'NAT, NTP, DHCP, DNS, SNMP, syslog.', weight: 0.10, displayOrder: 4 },
  { id: 'ccna-security', certId: CERT_ID, title: 'Security Fundamentals', blurb: 'ACLs, port security, AAA, wireless security.', weight: 0.15, displayOrder: 5 },
  { id: 'ccna-auto', certId: CERT_ID, title: 'Automation and Programmability', blurb: 'REST APIs, Ansible, Terraform basics, JSON, YAML.', weight: 0.10, displayOrder: 6 },
];

export const objectives = [
  { id: 'ccna-obj-cli', certId: CERT_ID, domainId: 'ccna-fund', title: 'Cisco IOS CLI Basics', difficulty: 'beginner', estimatedMinutes: 30, prerequisites: [], concepts: ['user EXEC', 'privileged EXEC', 'global config', 'interface config'], masteryCriteria: { minQuizScore: 75, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 1 },
  { id: 'ccna-obj-vlan', certId: CERT_ID, domainId: 'ccna-access', title: 'VLANs and Trunking', difficulty: 'intermediate', estimatedMinutes: 30, prerequisites: ['ccna-obj-cli'], concepts: ['VLAN configuration', '802.1Q', 'native VLAN', 'voice VLAN'], masteryCriteria: { minQuizScore: 80, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 2 },
  { id: 'ccna-obj-routing', certId: CERT_ID, domainId: 'ccna-ip', title: 'Static and Dynamic Routing', difficulty: 'intermediate', estimatedMinutes: 35, prerequisites: ['ccna-obj-cli'], concepts: ['static routes', 'OSPF single-area', 'administrative distance'], masteryCriteria: { minQuizScore: 80, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 3 },
  { id: 'ccna-obj-acls', certId: CERT_ID, domainId: 'ccna-security', title: 'Access Control Lists', difficulty: 'intermediate', estimatedMinutes: 25, prerequisites: ['ccna-obj-cli'], concepts: ['standard ACL', 'extended ACL', 'wildcard masks', 'placement'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 4 },
  // v1.1 (effective Aug 20, 2024) additions:
  { id: 'ccna-obj-stp-enhancements', certId: CERT_ID, domainId: 'ccna-access', title: 'STP Enhancements (v1.1, topic 2.5.d)', difficulty: 'intermediate', estimatedMinutes: 20, prerequisites: ['ccna-obj-vlan'], concepts: ['Root Guard', 'Loop Guard', 'BPDU Guard', 'BPDU Filter'], masteryCriteria: { minQuizScore: 75, requiredReviews: 3, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 5 },
  { id: 'ccna-obj-cloud-managed', certId: CERT_ID, domainId: 'ccna-services', title: 'Cloud-Managed Device Access (v1.1, topic 2.8)', difficulty: 'beginner', estimatedMinutes: 15, prerequisites: [], concepts: ['Meraki dashboard', 'cloud-managed APs/switches', 'centralized config'], masteryCriteria: { minQuizScore: 70, requiredReviews: 2, requiredBossBattles: 0, requiresSelfExplanation: false }, displayOrder: 6 },
  { id: 'ccna-obj-ansible-terraform', certId: CERT_ID, domainId: 'ccna-auto', title: 'Ansible and Terraform (v1.1, topic 6.6)', difficulty: 'intermediate', estimatedMinutes: 25, prerequisites: [], concepts: ['Ansible playbooks', 'Terraform state', 'IaC declarative', 'replaces Puppet/Chef on v1.1'], masteryCriteria: { minQuizScore: 75, requiredReviews: 3, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 7 },
  { id: 'ccna-obj-ai-ml-network-ops', certId: CERT_ID, domainId: 'ccna-auto', title: 'Generative AI and ML in Network Operations (v1.1, topic 6.4)', difficulty: 'beginner', estimatedMinutes: 15, prerequisites: [], concepts: ['generative AI for config/troubleshooting', 'predictive ML for anomaly detection', 'capacity forecasting'], masteryCriteria: { minQuizScore: 70, requiredReviews: 2, requiredBossBattles: 0, requiresSelfExplanation: false }, displayOrder: 8 },
];

export const lessons = [
  {
    id: 'ccna-lesson-cli', certId: CERT_ID, objectiveId: 'ccna-obj-cli',
    title: 'The Four CLI Modes', estimatedMinutes: 9,
    loreIntro: {
      scene: 'You arrive at Subnet Dojo. Sensei Route is already there, waiting.',
      mentorMessage: 'This region\'s threat: binary mistakes and wildcard mask errors. Today\'s training: The Four CLI Modes. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in The Four CLI Modes so you can identify and resolve binary mistakes and wildcard mask errors on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'Every CCNA scenario starts with knowing which prompt you are at.' },
      { kind: 'concept', body: 'User EXEC (Router>): limited monitoring commands. Privileged EXEC (Router#): full monitoring and the gateway to config. Global Config (Router(config)#): system-wide settings. Interface Config (Router(config-if)#): per-interface settings.' },
      { kind: 'command', body: 'enable — go from User to Privileged.\nconfigure terminal (or conf t) — enter global config.\ninterface gi0/1 — enter interface config.\nexit — go up one level.\nend (or Ctrl+Z) — return to Privileged from any config mode.\nshow running-config — view active config.\nwrite memory (or copy run start) — save config.' },
      { kind: 'common_mistake', body: 'Typing config commands at User EXEC and watching them fail silently. Always check the prompt.' },
    ],
  },
  {
    id: 'ccna-lesson-vlan', certId: CERT_ID, objectiveId: 'ccna-obj-vlan',
    title: 'VLANs and 802.1Q Trunks', estimatedMinutes: 10,
    loreIntro: {
      scene: 'You arrive at VLAN Gate. Sensei Route is already there, waiting.',
      mentorMessage: 'This region\'s threat: native VLAN mismatches and bad trunks. Today\'s training: VLANs and 802.1Q Trunks. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in VLANs and 802.1Q Trunks so you can identify and resolve native VLAN mismatches and bad trunks on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'VLANs split a switch into multiple logical switches. Trunks carry multiple VLANs over a single link between switches.' },
      { kind: 'command', body: 'vlan 10\n name Sales\n!\ninterface gi0/1\n switchport mode access\n switchport access vlan 10\n!\ninterface gi0/24\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30' },
      { kind: 'concept', body: 'Native VLAN: untagged on a trunk. Both ends must agree or you get a "native VLAN mismatch." Default is VLAN 1; many shops change it for security.' },
      { kind: 'common_mistake', body: 'Forgetting that VLAN 1 is enabled on every port by default. Leaving it as the native VLAN is a common audit finding.' },
    ],
  },
  {
    id: 'ccna-lesson-acl', certId: CERT_ID, objectiveId: 'ccna-obj-acls',
    title: 'ACLs Without Tears', estimatedMinutes: 9,
    loreIntro: {
      scene: 'You arrive at ACL Wall. Sensei Route is already there, waiting.',
      mentorMessage: 'This region\'s threat: forgotten implicit deny and wrong placement. Today\'s training: ACLs Without Tears. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in ACLs Without Tears so you can identify and resolve forgotten implicit deny and wrong placement on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'ACLs are top-down with an implicit deny at the bottom. Order matters and forgetting the implicit deny will burn you on the exam.' },
      { kind: 'concept', body: 'Standard ACL (1-99, 1300-1999): filters by source IP only. Place close to the destination. Extended ACL (100-199, 2000-2699): filters by source, destination, protocol, port. Place close to the source.' },
      { kind: 'command', body: 'access-list 110 permit tcp 192.168.1.0 0.0.0.255 host 10.10.10.5 eq 443\naccess-list 110 deny ip any any\n!\ninterface gi0/1\n ip access-group 110 in' },
      { kind: 'common_mistake', body: 'Wildcard masks are inverse of subnet masks. /24 = mask 255.255.255.0 = wildcard 0.0.0.255.' },
    ],
  },

  // --- v1.1 additions (effective Aug 20, 2024) ---

  {
    id: 'ccna-lesson-stp-enhancements', certId: CERT_ID, objectiveId: 'ccna-obj-stp-enhancements',
    title: 'STP Enhancements: Guards and Filters', estimatedMinutes: 8,
    loreIntro: {
      scene: 'You arrive at the Spanning Tree Fortress. Sensei Route points to four sentinels standing at the gate.',
      mentorMessage: 'These four guards stop rogue switches from seizing the Root Bridge throne. Miss any one and a misconfigured closet switch rewrites the whole kingdom\'s topology in seconds.',
      missionObjective: 'Identify when to apply Root Guard, Loop Guard, BPDU Guard, and BPDU Filter, and explain what each one does on a misbehaving port.',
    },
    blocks: [
      { kind: 'concept', body: 'BPDU Guard: enabled on PortFast access ports. If a BPDU is received, the port immediately goes err-disabled. Protects the topology from rogue switches accidentally connected to access ports.' },
      { kind: 'concept', body: 'Root Guard: prevents a port from becoming a root port if a superior BPDU arrives. Enforces which switch is allowed to be Root Bridge — place on ports toward less-trusted switches.' },
      { kind: 'concept', body: 'Loop Guard: if a non-designated port stops receiving BPDUs (unidirectional link failure), it moves to loop-inconsistent state instead of mistakenly forwarding. Prevents phantom loops on fiber links.' },
      { kind: 'concept', body: 'BPDU Filter: stops a port from sending or receiving BPDUs, effectively disabling STP on that port. Useful only at known edge boundaries — misapplied, it can create permanent loops.' },
      { kind: 'command', body: 'interface Gi0/1\n spanning-tree portfast\n spanning-tree bpduguard enable\n!\ninterface Gi0/24\n spanning-tree guard root\n!\ninterface Gi0/12\n spanning-tree guard loop\n spanning-tree bpdufilter enable' },
      { kind: 'common_mistake', body: 'BPDU Guard shuts the port when it sees a BPDU. BPDU Filter silences the port — sends nothing, hears nothing. Guard is for protection; Filter disables STP entirely and is riskier. Do not confuse them on the exam.' },
    ],
  },

  {
    id: 'ccna-lesson-cloud-managed', certId: CERT_ID, objectiveId: 'ccna-obj-cloud-managed',
    title: 'Cloud-Managed Device Access', estimatedMinutes: 7,
    loreIntro: {
      scene: 'The Royal Signal Tower projects its authority through the cloud now. Sensei Route shows you the web dashboard that controls all 50 branch sites at once.',
      mentorMessage: 'v1.1 added cloud-managed to the list alongside Telnet, SSH, console, HTTP, HTTPS, TACACS+, and RADIUS. Understand what it is and — crucially — what it is not.',
      missionObjective: 'Explain cloud-managed network device access and contrast it with traditional per-device CLI management.',
    },
    blocks: [
      { kind: 'concept', body: 'Cloud-managed network devices (Cisco Meraki, Catalyst Center in cloud mode) are configured through a centralized web dashboard. The management plane tunnels to the cloud controller; the data plane stays local. Users never experience cloud latency for their traffic.' },
      { kind: 'concept', body: 'CCNA v1.1 topic 2.8 expands the management access list: Telnet, SSH, HTTP, HTTPS, console, TACACS+/RADIUS, AND cloud-managed. The exam may list all seven and ask which is new in v1.1 — cloud-managed is the addition.' },
      { kind: 'exam_angle', body: '"Centralized multi-site management without CLI per device" → cloud-managed. "Only management traffic uses the cloud, user data stays local" → distinguishing feature of cloud-managed vs full cloud forwarding.' },
      { kind: 'common_mistake', body: 'Cloud-managed does NOT mean user traffic flows through the cloud — only the management plane does. Confusing management plane with data plane is the most common mistake on questions about this topic.' },
    ],
  },

  {
    id: 'ccna-lesson-ansible-terraform', certId: CERT_ID, objectiveId: 'ccna-obj-ansible-terraform',
    title: 'Ansible and Terraform for Network Automation', estimatedMinutes: 9,
    loreIntro: {
      scene: 'The Royal Automation Guild has retired the Puppet Scribes and Chef Cooks. Sensei Route hands you two new tools and a warning.',
      mentorMessage: 'v1.1 retired Puppet and Chef and replaced them with Ansible and Terraform. Knowing which tool does what is both an exam point and a real hiring criterion.',
      missionObjective: 'Distinguish Ansible from Terraform and select the right tool for configuration management vs infrastructure provisioning scenarios.',
    },
    blocks: [
      { kind: 'concept', body: 'Ansible: agentless configuration management. Connects to existing devices via SSH or NETCONF and pushes idempotent state declared in YAML playbooks. No software installed on targets. Best for configuring interfaces, VLANs, ACLs, routing protocols on existing equipment.' },
      { kind: 'concept', body: 'Terraform: infrastructure-as-code provisioning tool. Declarative HCL configuration describes desired resources. Tracks state in a state file. Creates, modifies, and destroys cloud infrastructure — VPCs, subnets, route tables, security groups — as code objects.' },
      { kind: 'concept', body: 'Key distinction: Ansible configures EXISTING devices. Terraform CREATES infrastructure. In practice, Terraform provisions cloud network resources and Ansible then configures the on-prem or VM-level settings.' },
      { kind: 'exam_angle', body: 'v1.1 explicitly lists Ansible AND Terraform (replacing Puppet and Chef from v1.0). If a question asks which tools replaced Puppet/Chef, the answer is both Ansible and Terraform. "Agentless YAML push" → Ansible. "Declarative provisioning with state file" → Terraform.' },
      { kind: 'common_mistake', body: 'Treating Ansible and Terraform as interchangeable. Ansible pushes config to what exists. Terraform creates what should exist. Wrong choice in a scenario question eliminates the answer.' },
    ],
  },

  {
    id: 'ccna-lesson-ai-ml', certId: CERT_ID, objectiveId: 'ccna-obj-ai-ml-network-ops',
    title: 'Generative AI and ML in Network Operations', estimatedMinutes: 7,
    loreIntro: {
      scene: 'A new Oracle joins the Royal Court — not human, but a machine intelligence. Sensei Route explains the difference between what it creates and what it predicts.',
      mentorMessage: 'v1.1 topic 6.4 replaced DNA Center vs traditional management with AI and ML in network operations. Two flavors: generative AI creates content, predictive ML forecasts patterns.',
      missionObjective: 'Distinguish generative AI from predictive ML and describe a concrete network operations use case for each.',
    },
    blocks: [
      { kind: 'concept', body: 'Generative AI in network ops: large language models (LLMs) generate CLI configurations from natural-language prompts, explain error messages, produce network documentation, and synthesize runbooks. Input = human prompt. Output = text or config.' },
      { kind: 'concept', body: 'Predictive AI / ML in network ops: models trained on historical telemetry detect anomalies, forecast capacity exhaustion, identify likely hardware failures before they occur, and correlate root causes across events. Input = metric streams. Output = predictions and alerts.' },
      { kind: 'exam_angle', body: 'CCNA v1.1 topic 6.4. "AI generates a config / explains a command" → generative AI. "Model detects anomaly / predicts utilization spike / forecasts failure" → predictive ML. Both are new on v1.1; neither was covered on v1.0.' },
      { kind: 'common_mistake', body: 'Generative AI does NOT predict the future — it generates output from input. Predictive ML does NOT write configs — it forecasts patterns. They solve different problems and the exam tests whether you can distinguish the two by scenario description.' },
    ],
  },
];

const C = CERT_ID;

export const flashcards = [
  fc('ccna-fc-001', C, 'ccna-fund', 'ccna-obj-cli', 'Command to enter privileged EXEC mode?', 'enable', 'command'),
  fc('ccna-fc-002', C, 'ccna-fund', 'ccna-obj-cli', 'Command to enter global config?', 'configure terminal (or conf t)', 'command'),
  fc('ccna-fc-003', C, 'ccna-fund', 'ccna-obj-cli', 'Command to save config?', 'copy running-config startup-config (or write memory)', 'command'),
  fc('ccna-fc-004', C, 'ccna-fund', 'ccna-obj-cli', 'Command to view current config?', 'show running-config', 'command'),
  fc('ccna-fc-005', C, 'ccna-fund', 'ccna-obj-cli', 'Command to view IP info on all interfaces?', 'show ip interface brief', 'command'),
  fc('ccna-fc-006', C, 'ccna-access', 'ccna-obj-vlan', 'Command to create VLAN 10 named Sales?', 'vlan 10 / name Sales', 'command'),
  fc('ccna-fc-007', C, 'ccna-access', 'ccna-obj-vlan', 'Command to make a port an access port in VLAN 10?', 'switchport mode access / switchport access vlan 10', 'command'),
  fc('ccna-fc-008', C, 'ccna-access', 'ccna-obj-vlan', 'Command to make a port a trunk?', 'switchport mode trunk', 'command'),
  fc('ccna-fc-009', C, 'ccna-access', 'ccna-obj-vlan', 'What is 802.1Q?', 'IEEE standard for VLAN tagging on Ethernet trunks.', 'basic'),
  fc('ccna-fc-010', C, 'ccna-access', 'ccna-obj-vlan', 'What is the native VLAN?', 'The VLAN whose traffic is sent untagged across a trunk. Default is VLAN 1.', 'basic'),
  fc('ccna-fc-011', C, 'ccna-ip', 'ccna-obj-routing', 'OSPF default administrative distance?', '110', 'basic'),
  fc('ccna-fc-012', C, 'ccna-ip', 'ccna-obj-routing', 'EIGRP default administrative distance?', '90 (internal)', 'basic'),
  fc('ccna-fc-013', C, 'ccna-ip', 'ccna-obj-routing', 'Static route default administrative distance?', '1', 'basic'),
  fc('ccna-fc-014', C, 'ccna-ip', 'ccna-obj-routing', 'Connected route administrative distance?', '0', 'basic'),
  fc('ccna-fc-015', C, 'ccna-ip', 'ccna-obj-routing', 'Command to add a static route to 10.0.0.0/24 via 192.168.1.1?', 'ip route 10.0.0.0 255.255.255.0 192.168.1.1', 'command'),
  fc('ccna-fc-016', C, 'ccna-ip', 'ccna-obj-routing', 'Command to enable OSPF process 1?', 'router ospf 1 / network 10.0.0.0 0.0.0.255 area 0', 'command'),
  fc('ccna-fc-017', C, 'ccna-security', 'ccna-obj-acls', 'Wildcard mask for /27?', '0.0.0.31. (Inverse of 255.255.255.224.)', 'basic'),
  fc('ccna-fc-018', C, 'ccna-security', 'ccna-obj-acls', 'Standard ACL number range?', '1-99 and 1300-1999.', 'basic'),
  fc('ccna-fc-019', C, 'ccna-security', 'ccna-obj-acls', 'Where to place an extended ACL?', 'Close to the source of the traffic to deny.', 'basic'),
  fc('ccna-fc-020', C, 'ccna-security', 'ccna-obj-acls', 'Implicit rule at the end of every ACL?', 'deny ip any any (implicit deny).', 'basic'),
];

const E = EXAM_CODE;

export const questionBank = [
  q({ id: 'ccna-q-001', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A technician is in privileged EXEC mode. Which command takes them to global configuration?',
    a: [['a','enable'],['b','configure terminal', true],['c','interface'],['d','config-if']],
    why: 'configure terminal moves from privileged EXEC to global config.',
    wrong: { a: 'enable goes from user to privileged.', c: '"interface" is not a standalone navigation command at this level.', d: 'config-if is a prompt suffix, not a command.' },
    tags: ['cli','modes'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-002', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'Two switches connect via a trunk. Switch A has native VLAN 99; Switch B has native VLAN 1. What is the result?',
    a: [
      ['a','Both VLANs work normally'],
      ['b','Native VLAN mismatch — CDP errors and possible traffic issues', true],
      ['c','Trunk negotiation fails completely'],
      ['d','VLAN 1 is automatically renumbered']
    ],
    why: 'Native VLANs on both ends of a trunk must match. Mismatches cause CDP errors and can cause untagged traffic to land in the wrong VLAN.',
    tags: ['vlan','trunk','native-vlan'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-003', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router has both an OSPF route and a static route to the same destination. The static route has no AD specified. Which is preferred?',
    a: [['a','OSPF (AD 110)'],['b','Static (AD 1)', true],['c','They load-balance'],['d','First in routing table wins']],
    why: 'Lower administrative distance wins. Static routes default to AD 1; OSPF is 110.',
    tags: ['routing','administrative-distance'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-004', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'Which ACL configuration permits HTTP traffic from 192.168.1.0/24 to host 10.0.0.5 and denies everything else?',
    a: [
      ['a','access-list 100 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 80', true],
      ['b','access-list 100 permit tcp 192.168.1.0 255.255.255.0 host 10.0.0.5 eq 80'],
      ['c','access-list 1 permit 192.168.1.0 0.0.0.255 to 10.0.0.5 port 80'],
      ['d','access-list 100 permit http 192.168.1.0/24 host 10.0.0.5']
    ],
    why: 'Extended ACL syntax: access-list <num> permit tcp <src> <wildcard> <dst> eq <port>. Wildcard for /24 is 0.0.0.255. Implicit deny at end blocks everything else.',
    wrong: { b: 'ACLs use wildcard masks, not subnet masks.', c: '"to" and "port" are not Cisco IOS syntax.', d: 'IOS does not accept slash notation or "http" keyword in the standard way.' },
    tags: ['acl','extended-acl'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-005', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'Which command saves the current configuration so it survives a reboot?',
    a: [
      ['a','show running-config'],
      ['b','copy running-config startup-config', true],
      ['c','reload'],
      ['d','write erase']
    ],
    why: 'Running-config is in RAM and lost on reboot. Copying it to startup-config (NVRAM) makes it persistent. "write memory" is the same thing.',
    wrong: { d: 'write erase deletes startup-config.' },
    tags: ['cli','config-saving'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-006', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'What is the wildcard mask for OSPF to advertise the 192.168.10.0/24 network?',
    a: [['a','255.255.255.0'],['b','0.0.0.255', true],['c','0.0.0.0'],['d','255.255.255.255']],
    why: 'OSPF network statements use wildcard masks (inverse of subnet mask). /24 = 255.255.255.0 subnet = 0.0.0.255 wildcard.',
    tags: ['ospf','wildcard'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-007', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'You configure a switch port: switchport mode access / switchport access vlan 20. The PC plugged in does not get an IP. show vlan brief lists VLAN 20 as active. What is the MOST likely issue?',
    a: [
      ['a','VLAN 20 is not on the trunk to the router/DHCP server', true],
      ['b','VLAN 20 needs to be in shutdown'],
      ['c','The PC must use a static IP'],
      ['d','802.1Q is not supported on access ports']
    ],
    why: 'Access port is correct, VLAN exists. The break is most likely upstream — DHCP for VLAN 20 must be reachable via a trunk.',
    tags: ['vlan','dhcp','troubleshooting'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-008', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cli',
    q: 'Which service translates private IPs to a public IP for outbound internet on a Cisco router?',
    a: [['a','DHCP'],['b','NAT', true],['c','OSPF'],['d','SNMP']],
    why: 'NAT (specifically PAT in most setups) translates internal addresses to a public address.',
    tags: ['nat'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-009', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A standard ACL is BEST placed where on the network?',
    a: [['a','Close to the source'],['b','Close to the destination', true],['c','Anywhere; placement does not matter'],['d','Only on routers, never on switches']],
    why: 'Standard ACLs filter only on source IP. Placing them close to the source could block legitimate traffic to other destinations. Place near destination.',
    tags: ['acl','placement'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-010', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A router shows these interfaces in "show ip interface brief": Gi0/0 status up, protocol down. What does this indicate?',
    a: [
      ['a','Layer 1 problem'],
      ['b','Layer 2 problem (frame mismatch, keepalive, etc.)', true],
      ['c','Layer 3 problem'],
      ['d','Layer 4 problem']
    ],
    why: 'Status up means Layer 1 (electrical) is working. Protocol down means Layer 2 is failing — encapsulation mismatch, missing keepalives, etc.',
    tags: ['troubleshooting','interfaces'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccna-q-011', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'What is the administrative distance of a connected route?',
    a: [['a','0', true],['b','1'],['c','90'],['d','110']],
    why: 'Connected (directly attached) routes have AD 0 — the most trusted.',
    tags: ['administrative-distance'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-012', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-cli',
    q: 'Which data format is most commonly used by REST APIs and is human-readable?',
    a: [['a','XML'],['b','JSON', true],['c','YAML'],['d','Binary']],
    why: 'JSON is the dominant REST API format. YAML is also human-readable but more common for config files.',
    tags: ['json','rest','automation'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-013', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'PBQ-style: Order the following CLI commands to configure VLAN 30 on access port Gi0/5.',
    a: [
      ['a','vlan 30'],
      ['b','interface gi0/5'],
      ['c','switchport mode access'],
      ['d','switchport access vlan 30'],
      ['e','configure terminal'],
    ],
    correctAnswers: ['e','a','b','c','d'] as unknown as string[],
    type: 'ordering',
    why: 'Enter global config, create the VLAN, drop into the interface, set access mode, assign the VLAN.',
    tags: ['vlan','cli','pbq'], difficulty: 'medium', pbq: true, time: 90,
  } as any),

  q({ id: 'ccna-q-014', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cli',
    q: 'Which protocol synchronizes time across network devices and is critical for accurate logs?',
    a: [['a','SNMP'],['b','NTP', true],['c','SSH'],['d','Syslog']],
    why: 'NTP (Network Time Protocol) keeps clocks in sync. Without it, log correlation across devices is nearly impossible.',
    tags: ['ntp'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-015', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'What is the wildcard mask equivalent of subnet mask 255.255.255.240?',
    a: [['a','0.0.0.15', true],['b','0.0.0.31'],['c','0.0.15.255'],['d','0.0.0.240']],
    why: 'Wildcard is the inverse: 240 = 11110000, inverted = 00001111 = 15.',
    tags: ['wildcard','subnetting'], difficulty: 'medium', time: 60 }),
  q({ id: 'ccna-q-016', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'Where should a standard ACL be placed for maximum effectiveness?',
    a: [['a','As close to the source as possible'],['b','As close to the destination as possible', true],['c','On the WAN edge only'],['d','It does not matter']],
    why: 'Standard ACLs filter on source IP only, so placing them near the destination prevents accidentally blocking the source from reaching other legitimate destinations.',
    tags: ['acl','placement'], difficulty: 'medium', time: 60 }),
  q({ id: 'ccna-q-017', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A router has these ACL rules in order: 10 permit tcp any any eq 80, 20 deny ip any any. What happens to ICMP traffic?',
    a: [['a','Permitted by rule 10'],['b','Denied by rule 20', true],['c','Implicitly permitted'],['d','Logged only']],
    why: 'Rule 10 permits only TCP port 80. ICMP does not match, so it falls through to rule 20 which denies all IP traffic.',
    tags: ['acl','order'], difficulty: 'medium', time: 70 }),
  q({ id: 'ccna-q-018', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'What does the implicit "deny any" at the end of every ACL mean for a list with only permit statements?',
    a: [['a','Nothing — only listed permits matter'],['b','Anything not explicitly permitted is denied', true],['c','All traffic is permitted'],['d','The router crashes']],
    why: 'Every Cisco ACL ends with an invisible deny ip any any. If you only write permits, traffic that does not match is silently dropped.',
    tags: ['acl','implicit-deny'], difficulty: 'easy', time: 45 }),
  q({ id: 'ccna-q-019', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-cli',
    q: 'Which data format uses indentation and is commonly used by Ansible playbooks?',
    a: [['a','XML'],['b','JSON'],['c','YAML', true],['d','CSV']],
    why: 'YAML uses indentation to denote structure and is the standard format for Ansible playbooks. JSON is more common for REST APIs.',
    tags: ['yaml','ansible'], difficulty: 'easy', time: 30 }),
  q({ id: 'ccna-q-020', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-cli',
    q: 'A REST API call returns the HTTP status code 401. What does it indicate?',
    a: [['a','Success'],['b','Resource not found'],['c','Authentication required or failed', true],['d','Server error']],
    why: '401 Unauthorized means the request lacks valid authentication credentials. 403 means authenticated but forbidden, 404 means not found, 500 is server error.',
    tags: ['rest','http-codes'], difficulty: 'easy', time: 35 }),
  q({ id: 'ccna-q-021', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-cli',
    q: 'What does idempotency mean in the context of network automation?',
    a: [['a','The script runs faster each time'],['b','Running the same operation multiple times produces the same result', true],['c','Each run produces different output'],['d','The script requires manual approval']],
    why: 'Idempotency means a config push can be re-run safely. If the device is already in the desired state, nothing changes. Ansible and Terraform are built on this principle.',
    tags: ['automation','idempotency'], difficulty: 'medium', time: 50 }),
  q({ id: 'ccna-q-022', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'Which command applies an ACL named BLOCK_GUEST inbound on interface GigabitEthernet0/1?',
    a: [['a','access-list BLOCK_GUEST in'],['b','ip access-group BLOCK_GUEST in', true],['c','apply acl BLOCK_GUEST inbound'],['d','ip acl BLOCK_GUEST in']],
    why: 'ip access-group <name> {in|out} is the interface-level command. access-list creates the list itself in global config.',
    tags: ['acl','interface'], difficulty: 'medium', time: 50 }),

  // v1.1 objective questions — STP Enhancements (2.5.d)
  q({ id: 'ccna-q-023', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-stp-enhancements',
    q: 'A PortFast-enabled access port receives a BPDU from a newly connected device. Which STP feature automatically err-disables the port to protect the topology?',
    a: [
      ['a','Root Guard'],
      ['b','BPDU Guard', true],
      ['c','Loop Guard'],
      ['d','BPDU Filter'],
    ],
    why: 'BPDU Guard err-disables a PortFast port the moment it receives any BPDU, preventing a rogue switch from participating in the STP topology.',
    wrong: { a: 'Root Guard blocks a port from becoming root, not from receiving BPDUs on an access port.', c: 'Loop Guard handles unidirectional link failures on non-designated ports.', d: 'BPDU Filter suppresses BPDUs but does not err-disable the port.' },
    tags: ['stp','bpdu-guard','v1.1'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-024', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-stp-enhancements',
    q: 'A network admin wants to prevent a specific switch port from ever becoming a root port, even if a superior BPDU arrives. Which feature accomplishes this?',
    a: [
      ['a','BPDU Guard'],
      ['b','BPDU Filter'],
      ['c','Root Guard', true],
      ['d','PortFast'],
    ],
    why: 'Root Guard rejects superior BPDUs on configured ports by placing them in root-inconsistent state, ensuring the current root bridge retains its role.',
    wrong: { a: 'BPDU Guard err-disables a port when any BPDU is received — it is not selective about superior BPDUs.', b: 'BPDU Filter suppresses all BPDUs entirely; it does not protect root bridge placement.', d: 'PortFast speeds up convergence but does not protect root bridge selection.' },
    tags: ['stp','root-guard','v1.1'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccna-q-025', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-stp-enhancements',
    q: 'A switch port connects to a fiber uplink. The fiber is a unidirectional failure — the switch receives BPDUs but cannot send them. Which STP feature prevents this from creating a forwarding loop?',
    a: [
      ['a','BPDU Guard'],
      ['b','Root Guard'],
      ['c','BPDU Filter'],
      ['d','Loop Guard', true],
    ],
    why: 'Loop Guard detects when a non-designated port stops receiving BPDUs and moves it to loop-inconsistent state rather than allowing it to transition to forwarding, preventing a loop on unidirectional fiber links.',
    wrong: { a: 'BPDU Guard reacts to receiving unexpected BPDUs, not to the absence of them.', b: 'Root Guard prevents root-bridge takeover via superior BPDUs.', c: 'BPDU Filter disables BPDUs on a port; it does not detect unidirectional failures.' },
    tags: ['stp','loop-guard','v1.1'], difficulty: 'hard', time: 60 }),

  // v1.1 objective questions — Cloud-Managed Device Access (2.8)
  q({ id: 'ccna-q-026', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'CCNA v1.1 topic 2.8 added a new device management access method to the list of Telnet, SSH, HTTP, HTTPS, console, TACACS+, and RADIUS. Which method was added?',
    a: [
      ['a','NETCONF'],
      ['b','RESTCONF'],
      ['c','Cloud-managed', true],
      ['d','SNMP'],
    ],
    why: 'CCNA v1.1 added cloud-managed device access to the official topic list. NETCONF and RESTCONF appear elsewhere in the blueprint; SNMP is monitoring, not configuration access.',
    tags: ['cloud-managed','v1.1'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-027', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'A retail chain manages network switches and access points at 50 stores from one web dashboard. Configuration changes push to all sites simultaneously without logging into each device separately. Which management model is this?',
    a: [
      ['a','SSH per-device'],
      ['b','TACACS+ centralized auth'],
      ['c','Cloud-managed', true],
      ['d','Console over out-of-band'],
    ],
    why: 'Cloud-managed network devices are administered through a centralized cloud dashboard. Configuration pushes from one portal to all enrolled devices, eliminating per-device CLI sessions.',
    tags: ['cloud-managed','v1.1'], difficulty: 'easy', time: 35 }),

  q({ id: 'ccna-q-028', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'In a cloud-managed network deployment, which plane uses the cloud controller for communication?',
    a: [
      ['a','Data plane — user traffic forwarded through cloud'],
      ['b','Management plane — config and policies from cloud controller', true],
      ['c','Both data and management planes use the cloud'],
      ['d','Control plane routing protocols run in cloud'],
    ],
    why: 'In cloud-managed deployments, only the management plane communicates with the cloud controller. User data traffic forwards locally at the device — the cloud is not in the data path.',
    wrong: { a: 'User traffic does not traverse the cloud in cloud-managed models; it stays local.' },
    tags: ['cloud-managed','management-plane','v1.1'], difficulty: 'medium', time: 50 }),

  // v1.1 objective questions — Ansible and Terraform (6.6)
  q({ id: 'ccna-q-029', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ansible-terraform',
    q: 'A network engineer wants to push VLAN configuration to 100 existing Cisco switches using YAML playbooks over SSH, without installing any agent on the switches. Which tool fits?',
    a: [
      ['a','Terraform'],
      ['b','Ansible', true],
      ['c','Puppet'],
      ['d','Chef'],
    ],
    why: 'Ansible is agentless, uses SSH, and pushes idempotent state defined in YAML playbooks. It configures existing devices without requiring software installed on targets. Puppet and Chef are not on the CCNA v1.1 blueprint.',
    wrong: { a: 'Terraform provisions infrastructure; it does not push config to existing switches via SSH playbooks.', c: 'Puppet was removed from CCNA v1.1.', d: 'Chef was removed from CCNA v1.1.' },
    tags: ['ansible','automation','v1.1'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-030', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ansible-terraform',
    q: 'A team needs to provision VPCs, subnets, and route tables in AWS as code, tracking what was created in a state file so changes can be applied incrementally. Which tool fits?',
    a: [
      ['a','Ansible'],
      ['b','Terraform', true],
      ['c','NETCONF'],
      ['d','Python scripts'],
    ],
    why: 'Terraform is an infrastructure-as-code provisioning tool. Its state file tracks what has been provisioned, enabling incremental updates. It is the right tool for creating cloud network resources (VPCs, subnets, route tables).',
    wrong: { a: 'Ansible is a configuration management tool for existing devices, not an infrastructure provisioner with state tracking.' },
    tags: ['terraform','automation','v1.1'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-031', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ansible-terraform',
    q: 'Which change was made to the automation tools covered in CCNA when the exam updated to v1.1?',
    a: [
      ['a','Puppet and Chef were added to the blueprint'],
      ['b','Ansible replaced Terraform as the only covered tool'],
      ['c','Ansible and Terraform replaced Puppet and Chef on the blueprint', true],
      ['d','No automation tool changes were made in v1.1'],
    ],
    why: 'CCNA v1.1 (topic 6.6) explicitly replaced Puppet and Chef with Ansible and Terraform. Questions referencing v1.1 automation tools should name Ansible and Terraform; Puppet and Chef are v1.0-era content.',
    tags: ['ansible','terraform','v1.1'], difficulty: 'easy', time: 35 }),

  // v1.1 objective questions — Generative AI and ML in Network Operations (6.4)
  q({ id: 'ccna-q-032', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ai-ml-network-ops',
    q: 'A network engineer types a natural-language prompt and an AI assistant returns a complete OSPF configuration block. Which type of AI is this?',
    a: [
      ['a','Predictive ML'],
      ['b','Generative AI', true],
      ['c','Rule-based expert system'],
      ['d','Supervised classification'],
    ],
    why: 'Generative AI produces new content (text, configs, documentation) from a prompt. When input is a natural-language request and output is a generated artifact such as a configuration, it is generative AI.',
    wrong: { a: 'Predictive ML forecasts future values from historical data — it does not generate configurations from prompts.' },
    tags: ['ai','generative','v1.1'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-033', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ai-ml-network-ops',
    q: 'A network platform monitors interface utilization telemetry and alerts the team that Gi0/1 will reach 90% capacity in 3 days based on historical trend. Which AI/ML capability is this?',
    a: [
      ['a','Generative AI'],
      ['b','SNMP threshold alerting'],
      ['c','Predictive ML', true],
      ['d','Rule-based automation'],
    ],
    why: 'Predictive ML forecasts future states from historical patterns — detecting anomalies, predicting failures, and forecasting capacity exhaustion before they occur. Input is metric history; output is a prediction.',
    wrong: { a: 'Generative AI creates content from prompts; it does not forecast future metric trends.', b: 'SNMP threshold alerting fires when a threshold is crossed now, not 3 days from now.' },
    tags: ['ml','predictive','v1.1'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-034', certId: C, examCode: E, domainId: 'ccna-auto', objectiveId: 'ccna-obj-ai-ml-network-ops',
    q: 'According to CCNA v1.1 topic 6.4, which topic replaced "DNA Center vs traditional campus device management"?',
    a: [
      ['a','Puppet and Chef configuration management'],
      ['b','NETCONF and RESTCONF protocols'],
      ['c','Generative and predictive AI and ML in network operations', true],
      ['d','Terraform infrastructure-as-code'],
    ],
    why: 'CCNA v1.1 replaced the "DNA Center vs traditional" comparison in topic 6.4 with generative AI and machine learning in network operations — specifically covering both generative AI (config generation, troubleshooting) and predictive ML (anomaly detection, capacity forecasting).',
    tags: ['ai','ml','v1.1'], difficulty: 'medium', time: 40 }),

  // ── Network Fundamentals (ccna-q-035 through ccna-q-051) ─────────────────

  q({ id: 'ccna-q-035', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A host has IP address 192.168.10.45/27. What is the network address and broadcast address of this subnet?',
    a: [
      ['a','Network: 192.168.10.32, Broadcast: 192.168.10.63', true],
      ['b','Network: 192.168.10.0, Broadcast: 192.168.10.255'],
      ['c','Network: 192.168.10.32, Broadcast: 192.168.10.55'],
      ['d','Network: 192.168.10.40, Broadcast: 192.168.10.47'],
    ],
    why: '/27 = 255.255.255.224 with 32-host blocks (0–31, 32–63, 64–95…). Host .45 falls in the 32–63 block: network .32, broadcast .63.',
    wrong: { b: '/27 is not a /24. The subnet is not the entire .0 block.' },
    tags: ['subnetting','cidr'], difficulty: 'hard', time: 90 }),

  q({ id: 'ccna-q-036', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A router interface has IPv6 address 2001:DB8:ACAD:1::/64. Using EUI-64, it derives its interface ID from MAC address 00:1A:2B:3C:4D:5E. What is the EUI-64 interface ID?',
    a: [
      ['a','021A:2BFF:FE3C:4D5E', true],
      ['b','001A:2B3C:4D5E'],
      ['c','FF1A:2BFF:3C4D:5EFF'],
      ['d','021A:2B3C:FE4D:5EFF'],
    ],
    why: 'EUI-64: split MAC (00:1A:2B | 3C:4D:5E), insert FF:FE in the middle → 00:1A:2B:FF:FE:3C:4D:5E, then flip the 7th bit of the first byte: 00 → 02. Result: 021A:2BFF:FE3C:4D5E.',
    trap: 'The 7th bit (universal/local bit) of the first MAC octet is flipped: 00 (00000000) → 02 (00000010). Students often forget this step.',
    tags: ['ipv6','eui-64'], difficulty: 'hard', time: 90 }),

  q({ id: 'ccna-q-037', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'Which IPv6 address type is automatically assigned to every IPv6-enabled interface, starts with FE80::/10, and is only valid on a single link segment?',
    a: [
      ['a','Unique local address'],
      ['b','Global unicast address'],
      ['c','Link-local address', true],
      ['d','Multicast address'],
    ],
    why: 'Link-local addresses (FE80::/10) are automatically configured on every IPv6 interface and are only reachable within the local link — they are never routed.',
    wrong: { a: 'Unique local (FC00::/7) is the IPv6 equivalent of RFC 1918 private addresses — routable within an organization but not globally.' },
    tags: ['ipv6','address-types'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-038', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A network has three switches and a hub connected to one switch port. Which statement correctly describes collision and broadcast domains?',
    a: [
      ['a','Each switch port is a collision domain; all devices share one broadcast domain', true],
      ['b','Each switch is a broadcast domain'],
      ['c','Hubs extend broadcast domains but not collision domains'],
      ['d','Switches and hubs both create collision domains per port'],
    ],
    why: 'Switches create a separate collision domain per port (full-duplex). All switch ports in the same VLAN share one broadcast domain. A hub shares ONE collision domain among all connected devices.',
    trap: 'Routers segment broadcast domains. Switches segment collision domains. Hubs extend collision domains.',
    tags: ['collision-domain','broadcast-domain','switching'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-039', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'An Ethernet frame has these fields in order. Which field comes IMMEDIATELY before the destination MAC address?',
    a: [
      ['a','FCS'],
      ['b','Source MAC'],
      ['c','Preamble / SFD', true],
      ['d','EtherType'],
    ],
    why: 'Ethernet frame format: Preamble (7 bytes) + SFD (1 byte) → Destination MAC (6 bytes) → Source MAC (6 bytes) → EtherType (2 bytes) → Payload → FCS (4 bytes).',
    tags: ['ethernet','frame-format'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-040', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'When does CSMA/CD apply, and which duplex mode uses it?',
    a: [
      ['a','Full-duplex on switches'],
      ['b','Half-duplex on hubs or legacy connections', true],
      ['c','Full-duplex on all Ethernet links'],
      ['d','Only on fiber links'],
    ],
    why: 'CSMA/CD (Carrier Sense Multiple Access / Collision Detection) applies to half-duplex Ethernet where devices share a medium and can collide. Full-duplex eliminates collisions so CSMA/CD is disabled.',
    tags: ['csma-cd','half-duplex','duplex'], difficulty: 'easy', time: 45 }),

  q({ id: 'ccna-q-041', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A technician runs "show interfaces GigabitEthernet0/0" on a Cisco router. The output shows "GigabitEthernet0/0 is administratively down, line protocol is down." What is the MOST likely cause?',
    a: [
      ['a','The cable is unplugged'],
      ['b','A "shutdown" command was applied to the interface', true],
      ['c','Speed or duplex mismatch'],
      ['d','The interface has no IP address assigned'],
    ],
    why: '"Administratively down" specifically means a shutdown command was applied. Physical/cable issues cause "down, line protocol is down" without the "administratively" qualifier.',
    trap: '"Administratively down" = shutdown command applied. "Down/down" without administratively = physical layer issue. "Up/down" = Layer 2 problem.',
    tags: ['show-interfaces','troubleshooting','cli'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-042', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A router has "enable secret cisco123" and "enable password letmein" both configured. When a user types "enable", which password is required?',
    a: [
      ['a','letmein'],
      ['b','cisco123', true],
      ['c','Both must be entered'],
      ['d','Neither — the router prompts for neither'],
    ],
    why: 'When both are configured, "enable secret" always takes precedence. It uses MD5 hashing and is more secure. "enable password" is only used if no secret is configured.',
    tags: ['passwords','enable-secret','security'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-043', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A network admin wants to discover what Cisco device is directly connected to Gi0/1 including its IP address and platform. Which command provides this without leaving the local device?',
    a: [
      ['a','show ip route'],
      ['b','show cdp neighbors detail', true],
      ['c','show arp'],
      ['d','show vlan brief'],
    ],
    why: 'CDP (Cisco Discovery Protocol) collects information about directly connected Cisco devices. "show cdp neighbors detail" shows platform, IOS version, and management IP addresses of adjacent devices.',
    wrong: { d: '"show vlan brief" displays VLAN configuration on a switch, not neighbor device details.' },
    tags: ['cdp','neighbors'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-044', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'An IP phone needs to be powered by the Ethernet port on a switch. The phone requires 25.5W of power. Which PoE standard must the switch port support at a minimum?',
    a: [
      ['a','802.3af (PoE)'],
      ['b','802.3at (PoE+)', true],
      ['c','802.3bt (PoE++)'],
      ['d','No standard is needed — PoE auto-negotiates'],
    ],
    why: '802.3af delivers up to 15.4W. 802.3at (PoE+) delivers up to 30W. The phone needs 25.5W, so 802.3at is the minimum standard that covers the requirement.',
    trap: 'Know the wattage: 802.3af = 15.4W, 802.3at = 30W, 802.3bt = 90W. The exam gives wattage and asks which standard.',
    tags: ['poe','802.3at'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-045', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A TCP client sends a SYN to a server. The server responds with SYN-ACK. What does the client send next to complete the 3-way handshake?',
    a: [
      ['a','FIN'],
      ['b','RST'],
      ['c','ACK', true],
      ['d','Another SYN'],
    ],
    why: 'TCP 3-way handshake: SYN → SYN-ACK → ACK. The final ACK from the client completes the handshake and establishes the connection.',
    tags: ['tcp','3-way-handshake'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-046', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A workstation resolves "www.example.com." Which DNS resolution order does it follow?',
    a: [
      ['a','DNS server → local cache → hosts file'],
      ['b','Local cache → hosts file → DNS server', true],
      ['c','hosts file → DNS server → local cache'],
      ['d','DNS server → root server → TLD server'],
    ],
    why: 'A client first checks its local DNS cache, then the hosts file, then queries a DNS server. The order: local cache → hosts file → DNS resolver → root/TLD hierarchy if needed.',
    tags: ['dns','resolution'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-047', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A Cisco router has a loopback interface configured with IP 10.0.0.1/32. What is the primary operational benefit of a loopback interface?',
    a: [
      ['a','It provides a second path for packet forwarding'],
      ['b','It is always up unless the router is powered off, providing a stable management address', true],
      ['c','It improves routing performance by caching packets'],
      ['d','It is used only for testing physical interfaces'],
    ],
    why: 'Loopback interfaces are virtual and never go down unless the router is shut off or the interface is administratively shut. Used as stable management IPs and OSPF router IDs.',
    tags: ['loopback','management'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-048', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'Which comparison correctly distinguishes cloud vs on-prem networking components?',
    a: [
      ['a','An on-prem switch is analogous to a cloud virtual router'],
      ['b','A cloud vSwitch (virtual switch) performs the same Layer 2 switching function as a physical switch, but is software-defined', true],
      ['c','Cloud vNICs are physical NICs installed in a data center'],
      ['d','A virtual router in the cloud requires physical routing hardware'],
    ],
    why: 'Cloud networking virtualizes physical components: a vSwitch replaces a physical switch, a virtual router replaces a physical router, and a vNIC is a software-defined NIC — all providing equivalent Layer 2/3 functions without physical hardware.',
    tags: ['cloud','virtual-networking'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-049', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A campus network needs to connect two buildings 350 meters apart. Cost and electromagnetic interference (EMI) are concerns in the environment. Which physical medium is MOST appropriate?',
    a: [
      ['a','Cat6 UTP copper'],
      ['b','Coaxial cable'],
      ['c','Single-mode fiber optic cable', true],
      ['d','Wireless bridge only'],
    ],
    why: 'Cat6 UTP has a maximum segment length of 100 meters — insufficient for 350m. Fiber is immune to EMI, supports distances of kilometers, and is the correct choice for this distance in an interference-prone environment.',
    wrong: { a: 'Cat6 copper is limited to 100 meters maximum segment length.' },
    tags: ['fiber','copper','physical-layer'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-050', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'Which wireless topology has all devices communicating through a central access point (AP) rather than directly with each other?',
    a: [
      ['a','Ad-hoc (IBSS)'],
      ['b','Mesh'],
      ['c','Infrastructure mode (BSS)', true],
      ['d','Peer-to-peer'],
    ],
    why: 'Infrastructure mode (BSS — Basic Service Set) uses an AP as the central coordinator. Devices communicate to the AP, not directly to each other. Ad-hoc mode has no AP — devices connect directly.',
    tags: ['wireless','bss','infrastructure-mode'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-051', certId: C, examCode: E, domainId: 'ccna-fund', objectiveId: 'ccna-obj-cli',
    q: 'A network engineer runs "show version" on a Cisco IOS router. Which information does this command display? (Choose TWO.)',
    type: 'multiple_select',
    a: [
      ['a','IOS version and feature set', true],
      ['b','System uptime', true],
      ['c','Currently active VLANs'],
      ['d','Routing table entries'],
      ['e','ACL statistics'],
    ],
    why: '"show version" displays IOS version, hardware model, system uptime, interfaces, boot flash image, and configuration register. VLANs, routes, and ACLs are shown by their respective show commands.',
    tags: ['show-version','cli'], difficulty: 'easy', time: 40 }),

  // ── Network Access (ccna-q-052 through ccna-q-065) ────────────────────────

  q({ id: 'ccna-q-052', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A technician runs "show vlan brief" and sees VLAN 40 is not listed. A port is configured as "switchport access vlan 40" and the PC cannot communicate. What is the MOST likely issue?',
    a: [
      ['a','The PC needs a static IP'],
      ['b','VLAN 40 was never created on the switch', true],
      ['c','The trunk link is down'],
      ['d','The native VLAN must be 40'],
    ],
    why: 'If VLAN 40 is not in "show vlan brief," it does not exist on the switch. Assigning a port to a non-existent VLAN means the port is inactive. Create the VLAN first with "vlan 40".',
    tags: ['vlan','troubleshooting'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccna-q-053', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A company uses VLAN 10 for data and needs VLAN 20 traffic to communicate between two switches. Router-on-a-stick subinterface commands are shown below. Which command creates the subinterface for VLAN 20 on interface Gi0/0?\n\nRouter(config)# interface gi0/0.20\nRouter(config-subif)# encapsulation dot1q 20\nRouter(config-subif)# ip address 192.168.20.1 255.255.255.0\n\nWhich of the following is TRUE about this configuration?',
    a: [
      ['a','This interface handles VLAN 10 traffic'],
      ['b','This subinterface tags traffic with VLAN ID 20 using 802.1Q', true],
      ['c','Subinterface .20 means the interface uses port 20'],
      ['d','The "encapsulation dot1q" command is optional'],
    ],
    why: '"encapsulation dot1q 20" tags all frames on subinterface Gi0/0.20 with VLAN ID 20 per 802.1Q. The ".20" is just a naming convention — the VLAN ID is set by the encapsulation command.',
    trap: 'The subinterface number (gi0/0.20) does not have to match the VLAN ID (20) — it is convention only. The VLAN ID binding is done by "encapsulation dot1q <vlan-id>".',
    tags: ['vlan','router-on-a-stick','dot1q'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-054', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'Two switches are connected with a trunk. Switch A is configured for "switchport nonegotiate" and Switch B is "switchport mode dynamic auto." What state will the trunk be in?',
    a: [
      ['a','Trunk — dynamic desirable initiates trunking'],
      ['b','Access — both sides default to access mode'],
      ['c','Not a trunk — nonegotiate disables DTP and dynamic auto waits to be asked', true],
      ['d','The switches will form a trunk because dynamic auto upgrades automatically'],
    ],
    why: '"switchport nonegotiate" disables DTP on one end. "dynamic auto" passively waits for the other end to initiate trunking via DTP. Since DTP is disabled on one end, neither side initiates — the link stays as access.',
    trap: 'Dynamic auto will trunk only if the other end is dynamic desirable or already trunk. With nonegotiate or access on the other end, dynamic auto stays as access.',
    tags: ['dtp','trunk','negotiation'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-055', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'An IP phone needs to be connected to a switch access port. The phone sends data VLAN traffic tagged and voice VLAN traffic tagged. Which commands correctly configure the port for both data VLAN 10 and voice VLAN 100?',
    a: [
      ['a','switchport access vlan 10 / switchport voice vlan 100', true],
      ['b','switchport trunk allowed vlan 10,100'],
      ['c','switchport mode trunk / encapsulation dot1q 100'],
      ['d','switchport access vlan 100 / switchport voice vlan 10'],
    ],
    why: '"switchport access vlan 10" assigns the data VLAN. "switchport voice vlan 100" enables the voice VLAN and instructs the phone to tag voice traffic with VLAN 100. The port remains an access port (not trunk mode).',
    tags: ['vlan','voice-vlan'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-056', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'In which STP port state does a port receive BPDUs, is not forwarding data frames, and is building the MAC address table?',
    a: [
      ['a','Blocking'],
      ['b','Listening'],
      ['c','Learning', true],
      ['d','Forwarding'],
    ],
    why: 'In the Learning state, a port receives and sends BPDUs and begins populating the MAC address table from frame source addresses. It does NOT forward data frames. In Blocking, the port only receives BPDUs.',
    trap: 'Listening: processes BPDUs, no data forwarding, no MAC learning. Learning: processes BPDUs, no data forwarding, MAC learning active. Forwarding: everything active.',
    tags: ['stp','port-states'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-057', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A switch has STP port roles. The port that provides the best path back to the Root Bridge on a non-root switch is called?',
    a: [
      ['a','Designated port'],
      ['b','Root port', true],
      ['c','Non-designated port'],
      ['d','PortFast port'],
    ],
    why: 'Each non-root switch has exactly ONE root port — the port with the lowest cost path to the Root Bridge. The designated port is the port on each segment that forwards toward the root.',
    tags: ['stp','port-roles'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-058', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-stp-enhancements',
    q: 'Compared to 802.1D STP, what is the primary convergence improvement of RSTP (802.1w)?',
    a: [
      ['a','RSTP eliminates the need for port roles'],
      ['b','RSTP converges in 1–2 seconds vs. 30–50 seconds for 802.1D', true],
      ['c','RSTP requires more BPDUs per second'],
      ['d','RSTP uses a different root bridge election process'],
    ],
    why: 'RSTP achieves rapid convergence (1–2 seconds) through port proposal/agreement handshakes and by eliminating listening and learning timer delays. 802.1D required 30–50 seconds for convergence.',
    tags: ['rstp','stp','convergence'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-059', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A network admin configures EtherChannel between two switches. Switch A uses "channel-group 1 mode active" and Switch B uses "channel-group 1 mode passive." Which protocol is in use and will the channel form?',
    a: [
      ['a','PAgP — the channel forms'],
      ['b','LACP — the channel forms', true],
      ['c','PAgP — the channel does not form (passive-passive)'],
      ['d','LACP — the channel does not form'],
    ],
    why: '"active" and "passive" are LACP (IEEE 802.3ad) keywords. LACP forms a channel when at least one side is active. LACP passive-passive would not form. PAgP uses "desirable" and "auto."',
    trap: 'LACP: active (initiates) + passive (waits) = forms. active + active = forms. passive + passive = does not form. PAgP: desirable + auto = forms. auto + auto = does not form.',
    tags: ['etherchannel','lacp'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-060', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'An EtherChannel is formed between two switches. Switch A uses src-mac as the load-balancing method. How does the switch decide which physical link to use for each frame?',
    a: [
      ['a','Traffic is distributed evenly across all links using a round-robin algorithm'],
      ['b','The switch hashes the source MAC address to select the outgoing link', true],
      ['c','The switch uses the lowest-numbered link for all traffic'],
      ['d','EtherChannel load balancing uses destination IP by default'],
    ],
    why: 'EtherChannel uses a hashing algorithm (configurable: src-mac, dst-mac, src-ip, dst-ip, or combinations). With src-mac, the source MAC is hashed to select the physical link. This means all traffic from the same source always uses the same link.',
    tags: ['etherchannel','load-balancing'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-061', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'An organization deploys a Cisco WLC with lightweight APs. Which statement correctly describes this architecture vs. autonomous APs?',
    a: [
      ['a','Autonomous APs are centrally managed; lightweight APs self-configure'],
      ['b','Lightweight APs with a WLC centralize configuration and RF management; autonomous APs configure independently', true],
      ['c','WLC is only used for security; lightweight APs handle all configuration'],
      ['d','Autonomous APs require a WLC; lightweight APs do not'],
    ],
    why: 'In a WLC architecture, lightweight APs (LAPs) offload configuration, management, and RF decisions to the WLC. Autonomous APs are standalone — each configured individually with full IOS software.',
    tags: ['wireless','wlc','autonomous-ap'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-062', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A guest network requires the highest level of wireless security for enterprise authentication using 802.1X with a RADIUS server. Which WLAN security mode is appropriate?',
    a: [
      ['a','WPA2-Personal (PSK)'],
      ['b','WPA2-Enterprise (802.1X with RADIUS)', true],
      ['c','WPA3-Personal'],
      ['d','Open authentication'],
    ],
    why: 'WPA2-Enterprise uses 802.1X with a RADIUS server for per-user authentication. WPA2-Personal uses a pre-shared key for all users, which is less secure for enterprise environments.',
    tags: ['wireless-security','wpa2','802.1x'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-063', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A Cisco AP at a remote branch has limited WAN bandwidth. Cisco recommends this AP switch its traffic locally and maintain operation if WAN connectivity to the WLC fails. Which AP mode is this?',
    a: [
      ['a','Local mode'],
      ['b','Monitor mode'],
      ['c','Sniffer mode'],
      ['d','FlexConnect mode', true],
    ],
    why: 'FlexConnect (formerly HREAP) allows an AP to switch traffic locally and continue operation if the WAN link to the WLC goes down. In Local mode, all traffic tunnels to the WLC — if WAN fails, the AP stops serving clients.',
    tags: ['wireless','flexconnect','local-mode'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-064', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A switch has "show vlan brief" output showing port Fa0/5 in VLAN 1 (default). A technician adds the command "switchport access vlan 30" but VLAN 30 is not in the database. What happens?',
    a: [
      ['a','The port immediately joins VLAN 30 and traffic flows'],
      ['b','IOS on Catalyst switches auto-creates VLAN 30 and assigns the port', true],
      ['c','The command is rejected with an error'],
      ['d','The port stays in VLAN 1 and the command has no effect'],
    ],
    why: 'Cisco IOS on Catalyst switches automatically creates the VLAN in the database when you assign a port to a nonexistent VLAN via switchport access vlan. Other platforms may reject the command if the VLAN does not exist.',
    tags: ['vlan','auto-create'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-065', certId: C, examCode: E, domainId: 'ccna-access', objectiveId: 'ccna-obj-vlan',
    q: 'A native VLAN mismatch is detected between two switches by CDP (Syslog message: "Native VLAN mismatch discovered on GigabitEthernet0/1 (VLAN 1), with Switch2 GigabitEthernet0/1 (VLAN 99)"). What should the admin do to fix this?',
    a: [
      ['a','Change the native VLAN on both switches to match', true],
      ['b','Disable CDP on both switches'],
      ['c','Change the trunk to access mode'],
      ['d','Assign all ports to VLAN 1'],
    ],
    why: 'Both ends of an 802.1Q trunk must have the same native VLAN configured. Set both switches to the same VLAN ID with "switchport trunk native vlan <id>" on the trunk interfaces.',
    tags: ['native-vlan','mismatch','trunk'], difficulty: 'easy', time: 30 }),

  // ── IP Connectivity (ccna-q-066 through ccna-q-087) ─────────────────────

  q({ id: 'ccna-q-066', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router must be configured with a static route to reach 10.10.20.0/24 via next-hop 192.168.1.2. Which command is correct?',
    a: [
      ['a','ip route 10.10.20.0 255.255.255.0 192.168.1.2', true],
      ['b','ip route 10.10.20.0/24 192.168.1.2'],
      ['c','route add 10.10.20.0 mask 255.255.255.0 192.168.1.2'],
      ['d','ip static-route 10.10.20.0 255.255.255.0 via 192.168.1.2'],
    ],
    why: 'Cisco IOS static route syntax: ip route <destination-network> <subnet-mask> {<next-hop-IP> | <exit-interface>}. Slash notation is not used; the mask is dotted decimal.',
    tags: ['static-route','cli'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-067', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router needs to forward ALL traffic with no matching specific route to a next-hop ISP at 203.0.113.1. Which command configures the default route?',
    a: [
      ['a','ip route 0.0.0.0 0.0.0.0 203.0.113.1', true],
      ['b','ip route default 203.0.113.1'],
      ['c','ip default-gateway 203.0.113.1'],
      ['d','ip route 255.255.255.255 0.0.0.0 203.0.113.1'],
    ],
    why: 'A default route is a static route to 0.0.0.0/0. It matches every destination when no more specific route exists. "ip default-gateway" is for devices with no routing enabled (like Layer 2 switches).',
    tags: ['default-route','static-route'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-068', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router has these routes in its table: static route to 10.0.0.0/8, OSPF route to 10.1.0.0/16, and connected route to 10.1.1.0/24. A packet arrives destined for 10.1.1.55. Which route is used?',
    a: [
      ['a','10.0.0.0/8 static route'],
      ['b','10.1.0.0/16 OSPF route'],
      ['c','10.1.1.0/24 connected route', true],
      ['d','All three routes load-balance'],
    ],
    why: 'Longest prefix match wins. /24 is more specific than /16 which is more specific than /8. The connected route to 10.1.1.0/24 matches the destination most specifically.',
    trap: 'Longest prefix match is applied BEFORE administrative distance. A connected /24 beats an OSPF /16 even though OSPF has lower AD than static — the prefix length is evaluated first.',
    tags: ['longest-prefix-match','routing-table'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-069', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'In OSPF, two routers are stuck in the EXSTART state. What is the MOST likely cause?',
    a: [
      ['a','Mismatched MTU sizes on the connecting interfaces', true],
      ['b','Mismatched OSPF process IDs'],
      ['c','Missing "network" statements'],
      ['d','Duplicate router IDs'],
    ],
    why: 'The EXSTART state is where the Master/Slave relationship is negotiated via DBD packets. MTU mismatch is the most common cause of being stuck in EXSTART — routers cannot agree on packet sizes for database exchange.',
    trap: 'OSPF neighbor states in order: Down → Init → 2-Way → Exstart → Exchange → Loading → Full. Getting stuck between states indicates what layer the problem is at.',
    tags: ['ospf','neighbor-states','exstart'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-070', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'On an OSPF broadcast network, which router is elected Designated Router (DR)?',
    a: [
      ['a','The router with the highest OSPF cost'],
      ['b','The router with the lowest router ID'],
      ['c','The router with the highest OSPF priority, then highest router ID as tiebreaker', true],
      ['d','The router with the most interfaces in OSPF'],
    ],
    why: 'DR/BDR election: highest priority wins (default 1, range 0–255). Priority 0 means never become DR/BDR. Tiebreaker: highest router ID. Election is non-preemptive once a DR is elected.',
    trap: 'OSPF DR election is non-preemptive. If you add a router with a higher priority later, it does NOT become DR unless you clear OSPF processes.',
    tags: ['ospf','dr','bdr','election'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-071', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router has loopback 0 (1.1.1.1/32), loopback 1 (2.2.2.2/32), and a manually configured "router-id 3.3.3.3" under OSPF. What is the OSPF router ID?',
    a: [
      ['a','1.1.1.1 (highest loopback)'],
      ['b','2.2.2.2 (highest loopback)'],
      ['c','3.3.3.3 (manually configured)', true],
      ['d','The highest active interface IP'],
    ],
    why: 'OSPF router ID selection priority: 1) Manually configured router-id > 2) Highest loopback IP > 3) Highest non-loopback active interface IP. Manual always wins.',
    tags: ['ospf','router-id'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-072', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A network has 50 routers across 5 geographic sites. The architect wants to reduce SPF computation by confining LSA flooding to each site and summarizing routes at site boundaries. Which OSPF design is appropriate?',
    a: [
      ['a','Single-area OSPF (all in area 0)'],
      ['b','Multi-area OSPF with each site as a separate area connected to backbone area 0', true],
      ['c','OSPF with all routers as ABRs'],
      ['d','OSPF virtual links across every site'],
    ],
    why: 'Multi-area OSPF limits LSA flooding within each area. ABRs summarize routes between areas, reducing routing table size. SPF calculations are per-area, not network-wide. All areas must connect to area 0 (backbone).',
    tags: ['ospf','multi-area'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-073', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'An OSPF router receives Hello packets on interface Gi0/0 but the neighbor relationship does not form. The interface is configured as "ip ospf 1 area 0" and both routers have matching hello/dead timers. What else could prevent the neighbor relationship?',
    a: [
      ['a','The interface is configured as an OSPF passive interface', true],
      ['b','The OSPF process ID is different on each router'],
      ['c','The routers are in the same OSPF area'],
      ['d','The subnet mask on the interface is /30'],
    ],
    why: 'A passive interface advertises the network in OSPF LSAs but suppresses OSPF Hello packets — no adjacency can form. If the interface is passive, it will not send Hellos even though the command "ip ospf 1 area 0" is applied.',
    wrong: { b: 'OSPF process IDs are locally significant and do NOT have to match between neighbors.' },
    tags: ['ospf','passive-interface'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-074', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'Which command configures an IPv6 static route to 2001:DB8:ACAD:2::/64 via next-hop 2001:DB8:ACAD:1::1?',
    a: [
      ['a','ipv6 route 2001:DB8:ACAD:2::/64 2001:DB8:ACAD:1::1', true],
      ['b','ip route 2001:DB8:ACAD:2::/64 2001:DB8:ACAD:1::1'],
      ['c','ipv6 static-route 2001:DB8:ACAD:2:: /64 via 2001:DB8:ACAD:1::1'],
      ['d','route ipv6 2001:DB8:ACAD:2::/64 next-hop 2001:DB8:ACAD:1::1'],
    ],
    why: 'IPv6 static route syntax: "ipv6 route <prefix>/<length> <next-hop>". The "ip route" command is IPv4 only. The ipv6 keyword is required.',
    tags: ['ipv6','static-route'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-075', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'OSPFv3 is used to route IPv6. Which statement is TRUE about OSPFv3 compared to OSPFv2?',
    a: [
      ['a','OSPFv3 uses IPv4 for transport and IPv6 for routing'],
      ['b','OSPFv3 is configured per link, not per network prefix, and runs directly over IPv6', true],
      ['c','OSPFv3 has lower administrative distance than OSPFv2'],
      ['d','OSPFv3 requires Area 0 to be configured on every interface'],
    ],
    why: 'OSPFv3 runs over IPv6, is configured per interface (using "ipv6 ospf 1 area 0" on the interface rather than a global network statement), and uses link-local addresses as next-hops. Same area/DR/BDR logic as OSPFv2.',
    tags: ['ospfv3','ipv6'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-076', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'HSRP is configured on two routers. Router A has priority 110 and preemption enabled; Router B has priority 100 (default). Router A boots after Router B. Which router becomes Active?',
    a: [
      ['a','Router B — it was elected first and elections are non-preemptive'],
      ['b','Router A — higher priority with preemption enabled forces it to become Active', true],
      ['c','Both become Active — split brain'],
      ['d','Neither — a new election requires manual intervention'],
    ],
    why: 'HSRP preemption allows a router with higher priority to take over the Active role even after another router has become Active. Without preemption, the first router to be Active keeps the role regardless of priority.',
    trap: 'HSRP is non-preemptive by default. You must explicitly configure "standby <group> preempt" for a higher-priority router to take over after losing the role.',
    tags: ['hsrp','fhrp','preemption'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-077', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'Which FHRP is an open standard (non-Cisco proprietary) that uses a master/backup election?',
    a: [
      ['a','HSRP (Hot Standby Router Protocol)'],
      ['b','GLBP (Gateway Load Balancing Protocol)'],
      ['c','VRRP (Virtual Router Redundancy Protocol)', true],
      ['d','IRDP (ICMP Router Discovery Protocol)'],
    ],
    why: 'VRRP (RFC 5798) is an open standard. HSRP and GLBP are Cisco proprietary. VRRP calls them Master and Backup (vs HSRP Active/Standby). GLBP uniquely supports load balancing across multiple gateways.',
    tags: ['vrrp','hsrp','glbp','fhrp'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-078', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A Cisco router performs PAT (overload). Inside hosts at 192.168.1.x use outside address 203.0.113.5. Which command enables dynamic PAT on interface GigabitEthernet0/0 (the outside interface)?',
    a: [
      ['a','ip nat inside source list 1 interface gi0/0 overload', true],
      ['b','ip nat outside source list 1 interface gi0/0 overload'],
      ['c','ip nat pool MYPOOL 203.0.113.5 203.0.113.5 netmask 255.255.255.255'],
      ['d','ip pat enable gi0/0'],
    ],
    why: 'PAT syntax: "ip nat inside source list <acl> interface <outside-int> overload". The "overload" keyword enables PAT (port-based multiplexing). The ACL matches inside source addresses. "ip nat outside" translates destination addresses, not source.',
    tags: ['nat','pat','cli'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-079', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router interface Gi0/1 connects to internal LAN hosts. Interface Gi0/0 connects to the ISP. For NAT to work, which interface designation is correct?',
    a: [
      ['a','Gi0/1 is ip nat outside; Gi0/0 is ip nat inside'],
      ['b','Gi0/1 is ip nat inside; Gi0/0 is ip nat outside', true],
      ['c','Both interfaces should be ip nat inside'],
      ['d','NAT designation is applied globally, not per interface'],
    ],
    why: '"ip nat inside" goes on the interface facing the private hosts. "ip nat outside" goes on the interface facing the public network (ISP). NAT translates addresses as traffic crosses from inside to outside.',
    tags: ['nat','inside','outside'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-080', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A company uses OSPF as the primary routing protocol and wants a backup static route to the same destination that activates only when OSPF fails. Which technique accomplishes this?',
    a: [
      ['a','Redistribute the static route into OSPF'],
      ['b','Configure the static route with an AD of 120 (floating static route)', true],
      ['c','Configure the static route with AD of 1'],
      ['d','Create a static route and disable the OSPF network statement'],
    ],
    why: 'A floating static route has an AD higher than OSPF (110). Set it to 115 or any value >110. While OSPF learns the route, the static is hidden (higher AD). If OSPF loses the route, the static float activates.',
    tags: ['floating-static','administrative-distance'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-081', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'Two separate routing domains — one running OSPF and one running EIGRP — need to share routes. Which concept describes this operation?',
    a: [
      ['a','Route summarization'],
      ['b','Route redistribution', true],
      ['c','Route filtering'],
      ['d','Equal-cost multipath'],
    ],
    why: 'Route redistribution imports routes learned by one routing protocol into another. An ABR/ASBR running both protocols takes EIGRP routes and injects them into OSPF (and vice versa).',
    tags: ['redistribution','ospf','eigrp'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-082', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A technician runs "show ip route" and sees the entry: O 10.2.0.0/16 [110/20] via 192.168.1.1, 00:01:05, Gi0/0. What does the "110/20" mean?',
    a: [
      ['a','Interface bandwidth 110 Mbps, route age 20 seconds'],
      ['b','Administrative distance 110, metric (cost) 20', true],
      ['c','Process ID 110, area number 20'],
      ['d','Hello timer 110, dead timer 20'],
    ],
    why: 'In the routing table format, [AD/metric]. For OSPF: [110/cost]. The O indicates OSPF, 110 is OSPF\'s administrative distance, and 20 is the accumulated OSPF cost to that network.',
    tags: ['show-ip-route','administrative-distance','ospf-cost'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-083', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A GRE tunnel is needed between Router A (10.0.0.1) and Router B (10.0.0.2) to carry multicast routing traffic over a non-multicast WAN. Which command creates the tunnel source on Router A?',
    a: [
      ['a','tunnel source 10.0.0.1', true],
      ['b','gre tunnel source 10.0.0.1'],
      ['c','ip tunnel source 10.0.0.1'],
      ['d','interface tunnel0 / ip address 10.0.0.1'],
    ],
    why: 'GRE tunnel config on Cisco IOS uses "tunnel source <IP>" and "tunnel destination <IP>" under the tunnel interface. The source is the local router\'s IP; destination is the remote router\'s IP.',
    tags: ['gre','tunnel','cli'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-084', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'VXLAN (Virtual Extensible LAN) is used in modern data centers. What primary problem does VXLAN solve compared to traditional VLANs?',
    a: [
      ['a','VXLAN provides faster Layer 2 forwarding than 802.1Q'],
      ['b','VXLAN extends Layer 2 segments over a Layer 3 network, supporting up to 16 million segments vs 4,094 VLANs', true],
      ['c','VXLAN replaces spanning tree with a link-state protocol'],
      ['d','VXLAN compresses Ethernet frames for WAN transport'],
    ],
    why: 'VXLAN encapsulates Layer 2 frames in UDP packets, enabling L2 extension across L3 networks. It supports 24-bit VNI (Virtual Network Identifier) = ~16 million segments vs 12-bit VLAN IDs (4,094).',
    tags: ['vxlan','overlay','data-center'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-085', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A router has the following routing table entries for destination 172.16.5.10:\n  S 172.16.0.0/16 [1/0] via 10.0.0.1\n  O 172.16.5.0/24 [110/50] via 10.0.0.2\n  Which route is selected?',
    a: [
      ['a','S 172.16.0.0/16 — lower AD (1)'],
      ['b','O 172.16.5.0/24 — longer prefix match wins', true],
      ['c','Both are used with load balancing'],
      ['d','The router drops the packet — duplicate routes are not supported'],
    ],
    why: 'Longest prefix match is evaluated first — /24 is more specific than /16. The OSPF /24 route is selected regardless of the static route\'s lower AD.',
    tags: ['longest-prefix-match','routing-table'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-086', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'A technician wants to verify OSPF neighbor relationships on a router. Which command shows neighbor states, including Full adjacency?',
    a: [
      ['a','show ip ospf database'],
      ['b','show ip ospf neighbor', true],
      ['c','show ip route ospf'],
      ['d','debug ip ospf adj'],
    ],
    why: '"show ip ospf neighbor" displays all OSPF neighbors, their state (2-Way, Full, etc.), the DR/BDR role, and the dead timer countdown. "show ip route ospf" shows OSPF-learned routes, not neighbor states.',
    tags: ['ospf','show-commands','troubleshooting'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-087', certId: C, examCode: E, domainId: 'ccna-ip', objectiveId: 'ccna-obj-routing',
    q: 'An OSPF area has 200 routers with continuous changes. The network architect wants to reduce LSA flooding to area 0 from this area. Which OSPF router role performs inter-area summarization?',
    a: [
      ['a','ASBR (AS Boundary Router)'],
      ['b','IR (Internal Router)'],
      ['c','ABR (Area Border Router)', true],
      ['d','DR (Designated Router)'],
    ],
    why: 'ABRs sit on the boundary between OSPF areas. They can summarize routes with "area <id> range <prefix>" to reduce the number of LSAs advertised into area 0, reducing database size on backbone routers.',
    tags: ['ospf','abr','summarization'], difficulty: 'medium', time: 60 }),

  // ── IP Services (ccna-q-088 through ccna-q-092) ──────────────────────────

  q({ id: 'ccna-q-088', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'A router must synchronize its clock with an NTP server at 216.239.35.0. Which command configures the router as an NTP client?',
    a: [
      ['a','ntp master 216.239.35.0'],
      ['b','ntp server 216.239.35.0', true],
      ['c','clock set ntp 216.239.35.0'],
      ['d','timesource ntp 216.239.35.0'],
    ],
    why: '"ntp server <IP>" configures the router to synchronize its clock from the specified NTP server. "ntp master" makes the router itself an NTP server (stratum source).',
    tags: ['ntp','cli'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-089', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'DHCP snooping is enabled on a switch. What attack does it prevent?',
    a: [
      ['a','VLAN hopping attacks'],
      ['b','Rogue DHCP server attacks by filtering DHCP replies on untrusted ports', true],
      ['c','STP topology changes'],
      ['d','ARP poisoning on access ports'],
    ],
    why: 'DHCP snooping marks switch ports as trusted (uplinks to legitimate DHCP servers) or untrusted (access ports). DHCP server replies (OFFER/ACK) received on untrusted ports are dropped, preventing rogue DHCP servers.',
    wrong: { d: 'ARP poisoning is mitigated by Dynamic ARP Inspection (DAI), which depends on DHCP snooping binding tables.' },
    tags: ['dhcp-snooping','security'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-090', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'Dynamic ARP Inspection (DAI) is configured on a switch. Which feature must be enabled first because DAI relies on its binding table?',
    a: [
      ['a','Port security'],
      ['b','DHCP snooping', true],
      ['c','802.1X authentication'],
      ['d','Root Guard'],
    ],
    why: 'DAI validates ARP packets against the DHCP snooping binding table, which maps IP-to-MAC bindings learned from legitimate DHCP transactions. Without DHCP snooping, DAI has no table to validate against.',
    tags: ['dai','dhcp-snooping','arp'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-091', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'A syslog message shows: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down. What does the severity level "5" indicate?',
    a: [
      ['a','Emergency'],
      ['b','Error'],
      ['c','Notice', true],
      ['d','Debug'],
    ],
    why: 'Syslog severity levels: 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice (normal but significant), 6=Informational, 7=Debug. Level 5 is Notice.',
    trap: 'Lower syslog severity number = higher severity. Emergency (0) is most critical; Debug (7) is least critical. The interface state change is level 5 (Notice), not an error.',
    tags: ['syslog','severity-levels'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-092', certId: C, examCode: E, domainId: 'ccna-services', objectiveId: 'ccna-obj-cloud-managed',
    q: 'A network team needs SNMP monitoring with authentication and encryption of SNMP messages. Which SNMP version provides both?',
    a: [
      ['a','SNMPv1'],
      ['b','SNMPv2c'],
      ['c','SNMPv3 with authPriv mode', true],
      ['d','SNMPv2 with community strings'],
    ],
    why: 'SNMPv3 authPriv mode provides authentication (HMAC-MD5/SHA) and privacy (encryption with DES/AES). SNMPv1 and SNMPv2c use community strings which are transmitted in cleartext.',
    trap: 'SNMPv3 has three security levels: noAuthNoPriv (no security), authNoPriv (authentication only), authPriv (authentication + encryption). The exam tests which level provides encryption.',
    tags: ['snmp','snmpv3','security'], difficulty: 'medium', time: 60 }),

  // ── Security Fundamentals (ccna-q-093 through ccna-q-100) ────────────────

  q({ id: 'ccna-q-093', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A standard ACL 10 permits 192.168.1.0/24. The team wants to use a named ACL for the same purpose. Which command sequence is equivalent?',
    a: [
      ['a','ip access-list standard PERMIT_LAN\n permit 192.168.1.0 0.0.0.255', true],
      ['b','ip access-list extended PERMIT_LAN\n permit ip 192.168.1.0 0.0.0.255 any'],
      ['c','access-list PERMIT_LAN permit 192.168.1.0/24'],
      ['d','ip access-list PERMIT_LAN\n source 192.168.1.0 wildcard 0.0.0.255'],
    ],
    why: '"ip access-list standard <name>" creates a named standard ACL. Entries use the same source+wildcard syntax as numbered ACLs. Named ACLs allow deleting specific entries by sequence number — a key advantage over numbered.',
    tags: ['acl','named-acl'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-094', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'Port security is configured on Fa0/3: maximum 2 MACs, violation mode restrict. A third device connects and sends traffic. What happens?',
    a: [
      ['a','The port shuts down (err-disabled)'],
      ['b','The port drops frames from the violating MAC and increments a violation counter, but stays up', true],
      ['c','All three devices are allowed — restrict only logs the event'],
      ['d','The first MAC is removed and the new MAC takes its place'],
    ],
    why: 'Port security violation modes: protect (drop + no log), restrict (drop + increment counter + syslog), shutdown (err-disable port). Restrict drops frames from the violating address but keeps the port operational.',
    trap: 'Three violation modes: shutdown (default, err-disables), restrict (drops + logs, port stays up), protect (drops silently, port stays up). Exam tests the differences.',
    tags: ['port-security','violation-modes'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-095', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'The AAA framework consists of three functions. Which function determines what a user is allowed to do after they have been authenticated?',
    a: [
      ['a','Authentication'],
      ['b','Authorization', true],
      ['c','Accounting'],
      ['d','Auditing'],
    ],
    why: 'Authentication = who you are. Authorization = what you can do. Accounting = what you did (logging). After login, authorization determines command or resource access rights.',
    tags: ['aaa','authorization'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccna-q-096', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A network uses RADIUS for device access authentication. A new requirement says all privileged commands on routers must be authorized per-command. Which protocol better supports per-command authorization?',
    a: [
      ['a','RADIUS — it uses UDP and is faster'],
      ['b','TACACS+ — it separates authentication, authorization, and accounting and encrypts the full packet', true],
      ['c','802.1X — it is designed for per-command authorization'],
      ['d','LDAP — it supports per-command ACLs natively'],
    ],
    why: 'TACACS+ (Cisco proprietary, TCP port 49) separates AAA functions and encrypts the entire payload — ideal for granular per-command authorization on network devices. RADIUS (UDP 1812/1813) combines authentication and authorization and encrypts only the password.',
    trap: 'RADIUS is preferred for network access (VPN, 802.1X wireless). TACACS+ is preferred for device administration (per-command authorization on routers/switches).',
    tags: ['tacacs','radius','aaa'], difficulty: 'hard', time: 75 }),

  q({ id: 'ccna-q-097', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'In an 802.1X deployment, which device acts as the authenticator — the middleman between the supplicant and the authentication server?',
    a: [
      ['a','The workstation (end user)'],
      ['b','The RADIUS server'],
      ['c','The network switch or wireless AP', true],
      ['d','The Active Directory domain controller'],
    ],
    why: '802.1X roles: Supplicant = end user device. Authenticator = network switch or AP (relays EAP between supplicant and server). Authentication Server = RADIUS server (validates credentials).',
    tags: ['802.1x','aaa','supplicant'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-098', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A wireless site survey detects an unauthorized AP advertising the same corporate SSID to lure users into connecting to it instead of the legitimate AP. What type of wireless threat is this?',
    a: [
      ['a','Deauthentication flood'],
      ['b','Rogue AP'],
      ['c','Evil twin AP', true],
      ['d','Jamming attack'],
    ],
    why: 'An evil twin AP mimics a legitimate AP (same SSID, potentially stronger signal) to intercept client traffic via a man-in-the-middle. A rogue AP is any unauthorized AP — it may not mimic the legitimate network. Deauth floods disconnect clients from real APs.',
    trap: 'Rogue AP = any unauthorized AP. Evil twin = a rogue AP specifically impersonating a legitimate network. The exam distinguishes them by intent.',
    tags: ['wireless','evil-twin','rogue-ap'], difficulty: 'medium', time: 60 }),

  q({ id: 'ccna-q-099', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'An extended ACL should deny all Telnet (TCP 23) traffic from the 10.1.1.0/24 network to any destination. Where should this ACL be placed for maximum efficiency?',
    a: [
      ['a','On the destination router, inbound'],
      ['b','On the source router, as close to 10.1.1.0/24 as possible, inbound', true],
      ['c','On every router in the path'],
      ['d','On the destination router, outbound'],
    ],
    why: 'Extended ACLs should be placed as close to the source as possible. This stops unwanted traffic at the first opportunity, conserving bandwidth across intermediate links.',
    tags: ['acl','extended-acl','placement'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccna-q-100', certId: C, examCode: E, domainId: 'ccna-security', objectiveId: 'ccna-obj-acls',
    q: 'A wireless intrusion prevention system (WIPS) detects that clients are being rapidly disconnected and reconnected. Which wireless attack does this pattern indicate?',
    a: [
      ['a','Evil twin AP'],
      ['b','Deauthentication flood (deauth attack)', true],
      ['c','ARP poisoning'],
      ['d','VLAN hopping'],
    ],
    why: 'A deauthentication flood sends spoofed 802.11 deauth frames from the AP\'s MAC to disconnect clients en masse — a denial-of-service attack. It can also be a precursor to an evil twin attack (deauth clients from real AP, reconnect them to the evil twin).',
    tags: ['wireless','deauth-flood','dos'], difficulty: 'medium', time: 60 }),
];

export const sideQuests = [{
  id: 'ccna-quest-cli', certId: CERT_ID, objectiveId: 'ccna-obj-cli',
  template: 'cable_crafter' as const,
  title: 'The Royal CLI Test',
  story: 'The Router King demands you match each command to its CLI mode.',
  payload: {
    passThreshold: 80,
    items: [
      { id: 'i1', label: 'enable', answer: 'User EXEC', distractors: ['Privileged EXEC', 'Global Config', 'Interface Config'] },
      { id: 'i2', label: 'configure terminal', answer: 'Privileged EXEC', distractors: ['User EXEC', 'Global Config', 'Interface Config'] },
      { id: 'i3', label: 'ip address 10.0.0.1 255.255.255.0', answer: 'Interface Config', distractors: ['Global Config', 'Privileged EXEC', 'User EXEC'] },
      { id: 'i4', label: 'hostname R1', answer: 'Global Config', distractors: ['Interface Config', 'Privileged EXEC', 'User EXEC'] },
      { id: 'i5', label: 'show ip interface brief', answer: 'Privileged EXEC', distractors: ['User EXEC', 'Global Config', 'Interface Config'] },
    ],
  },
}];

export const bossBattles = [{
  id: 'ccna-boss-network', certId: CERT_ID, objectiveIds: ['ccna-obj-cli','ccna-obj-vlan','ccna-obj-routing'],
  title: 'Build the Kingdom',
  storySetup: 'You are handed two switches and one router. You must configure VLAN 10 (Sales) and VLAN 20 (Engineering) so each VLAN can reach the internet through the router but cannot directly reach the other VLAN at Layer 2.',
  scenario: 'Walk through every CLI command, in order, on each device. Explain the role of access ports, trunks, the router-on-a-stick subinterfaces, and why VLANs alone do not provide inter-VLAN routing without the router.',
  constraints: ['One router, two switches', 'Two VLANs that must be isolated at Layer 2', 'Internet access required'],
  rubric: {
    passThreshold: 75,
    dimensions: [
      { key: 'cli_correctness', weight: 0.30, description: 'Are the CLI commands syntactically and logically correct?' },
      { key: 'design_understanding', weight: 0.25, description: 'Did you understand router-on-a-stick vs L3 switch?' },
      { key: 'sequence', weight: 0.20, description: 'Did you configure devices in a valid order?' },
      { key: 'verification', weight: 0.25, description: 'Did you describe how to verify each layer is working?' },
    ],
  },
  remediation: { cli_correctness: ['ccna-fc-001','ccna-fc-006'], design_understanding: ['ccna-fc-009'], sequence: [], verification: ['ccna-fc-005'] },
}];

export const practiceExams = [{
  id: 'ccna-mini-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'CCNA Mini Practice Exam', mode: 'mini' as const,
  questionCount: 10, timeLimitSeconds: 20 * 60,
  passingScaledScore: 825, scaledScoreMax: 1000, scaledScoreMin: 300,
  domainTargets: [
    { domainId: 'ccna-fund', questionCount: 2 },
    { domainId: 'ccna-access', questionCount: 2 },
    { domainId: 'ccna-ip', questionCount: 3 },
    { domainId: 'ccna-services', questionCount: 1 },
    { domainId: 'ccna-security', questionCount: 1 },
    { domainId: 'ccna-auto', questionCount: 1 },
  ],
  difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.25, exam_level: 0.05 },
  unlockRequirements: { minReadiness: 0, minDomainReadiness: 0, requiredBossBattlesPassed: [], minQuizAttempts: 0, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}, {
  id: 'ccna-full-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'CCNA Full Practice Exam', mode: 'full' as const,
  questionCount: 100, timeLimitSeconds: 120 * 60,
  passingScaledScore: 825, scaledScoreMax: 1000, scaledScoreMin: 300,
  domainTargets: [
    { domainId: 'ccna-fund', questionCount: 20 },
    { domainId: 'ccna-access', questionCount: 20 },
    { domainId: 'ccna-ip', questionCount: 25 },
    { domainId: 'ccna-services', questionCount: 10 },
    { domainId: 'ccna-security', questionCount: 15 },
    { domainId: 'ccna-auto', questionCount: 10 },
  ],
  difficultyMix: { easy: 0.10, medium: 0.45, hard: 0.35, exam_level: 0.10 },
  unlockRequirements: { minReadiness: 80, minDomainReadiness: 65, requiredBossBattlesPassed: ['ccna-boss-network'], minQuizAttempts: 5, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}];

export const glossary = [
  { term: 'OSPF', definition: 'Open Shortest Path First — link-state interior gateway routing protocol.' },
  { term: 'VLAN', definition: 'Virtual LAN — a logical Layer 2 segment.' },
  { term: 'STP', definition: 'Spanning Tree Protocol — prevents Layer 2 loops in switched networks.' },
  { term: 'NAT', definition: 'Network Address Translation — mapping IPs at a router boundary.' },
];

export const acronyms = [
  { acronym: 'AD', expansion: 'Administrative Distance', meaning: 'Trust level of a routing source. Lower wins.' },
  { acronym: 'PAT', expansion: 'Port Address Translation', meaning: 'NAT variant that maps many internal IPs to one external IP using ports.' },
  { acronym: 'VTP', expansion: 'VLAN Trunking Protocol', meaning: 'Cisco protocol for propagating VLAN config across switches.' },
];

export const examTraps = [
  { trap: 'Wildcard vs subnet mask', explanation: 'Wildcard is the inverse. /24 = 255.255.255.0 subnet but 0.0.0.255 wildcard. ACLs and OSPF use wildcards.' },
  { trap: 'Native VLAN', explanation: 'Both ends of a trunk must agree on the native VLAN. Mismatches cause CDP errors and traffic landing in the wrong VLAN.' },
  { trap: 'AD vs metric', explanation: 'AD picks the protocol, metric picks the path within a protocol. Two different concepts.' },
];
