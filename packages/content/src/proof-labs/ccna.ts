/**
 * Cisco CCNA (200-301 v1.1) proof-based labs — Router Kingdom.
 * Two labs: VLAN trunking with native VLAN mismatch + ACL placement scenario.
 */

import { proofLab, task } from '../authoring-rich';
import type { ProofLab } from '@certquest/types';

const C = 'ccna';

export const ccnaProofLabs: ProofLab[] = [
  proofLab({
    id: 'ccna-lab-001',
    certId: C,
    domainId: 'ccna-access',
    objectiveId: 'ccna-obj-vlan',
    title: 'Native VLAN Mismatch Hunt',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    xpReward: 100,
    loreNarration:
      'Sensei Route holds out two switches in opposite hands. "Two switches. One trunk between them. The native VLAN does not match. Frames are quietly leaking between VLANs nobody intended to merge — a security ' +
      'breach without alarm. Your task: build the topology, REPRODUCE the misconfiguration, then DETECT it using only show commands. Then fix it. The Dojo bows to those who can find what is hidden by silence."',
    tools: [
      { name: 'Cisco Packet Tracer', url: 'https://www.netacad.com/courses/packet-tracer', notes: 'Free with Networking Academy enrollment. Required for this lab.' },
      { name: 'Optionally GNS3', url: 'https://www.gns3.com/', notes: 'Free, runs real Cisco IOS images if you supply them.' },
    ],
    setup:
      'Open Packet Tracer. Drag two 2960 switches into the workspace. Connect Gi0/1 on each via straight-through cable (or copper crossover). Add one PC to each switch on different access ports. The lab walks you ' +
      'through configuring VLANs, intentionally misconfiguring the native VLAN, detecting the issue, and fixing it.',
    learningObjectives: [
      'Configure VLANs and 802.1Q trunks on Cisco IOS',
      'Reproduce a native VLAN mismatch and observe its symptoms',
      'Use `show interfaces trunk` and CDP/LLDP output to detect mismatch',
      'Apply security best practices: dedicated native VLAN, prune unused VLANs',
      'Document the fix as a config change with rollback',
    ],
    tasks: [
      task('t1',
        'On both switches, create VLANs 10 (Sales) and 20 (Engineering). Verify with `show vlan brief`. Paste the output from one switch.',
        'output_match',
        'VLAN 10 Sales active, VLAN 20 Engineering active',
        'Global config: `vlan 10` / `name Sales` / `vlan 20` / `name Engineering`.',
        false),
      task('t2',
        'On Switch1: configure Gi0/1 as a trunk with native VLAN 99, allowed VLANs 10, 20, 99. Commands: `interface Gi0/1` / `switchport mode trunk` / `switchport trunk native vlan 99` / `switchport trunk allowed vlan 10,20,99`. On Switch2: same trunk config BUT native VLAN 1 (the default — leave native unset). This is the intentional misconfiguration.',
        'output_match',
        'Trunk configured on both, native VLAN differs',
        'Run `show interfaces gi0/1 trunk` on each to verify the configured native VLAN.',
        false),
      task('t3',
        'On Switch1, run `show interfaces gi0/1 trunk`. Note the "Native VLAN" line. Then run `show cdp neighbors detail`. CDP should log the native VLAN mismatch as a syslog message. Paste the syslog or CDP-related output.',
        'output_match',
        'native VLAN mismatch OR Native VLAN: 99 (other side: 1)',
        'Cisco logs: `%CDP-4-NATIVE_VLAN_MISMATCH`. If you don\'t see it, increase logging level: `logging buffered 7`.',
        false),
      task('t4',
        'Place PC1 on a port assigned to VLAN 99 on Switch1, and PC2 on a port assigned to VLAN 1 (default) on Switch2. Assign PC1 IP 99.1.1.1/24, PC2 IP 99.1.1.2/24. Try to ping. Document whether it works and explain why.',
        'free_response',
        undefined,
        'Because of the mismatch, frames in VLAN 99 on S1 arrive untagged on S2 and land in VLAN 1. PCs in different VLANs technically reach each other — that\'s the silent breach.',
        true),
      task('t5',
        'Fix Switch2: set native VLAN to 99. Re-run `show interfaces gi0/1 trunk` on both. The mismatch warnings should clear within ~60 seconds (CDP holdtime).',
        'output_match',
        'Native VLAN: 99 on both sides; no more mismatch syslog',
        'After the fix, the syslog warning stops. CDP holdtime causes a brief delay before the OK state.',
        false),
      task('t6',
        'Apply best practice. Prune VLAN 1 from the trunk: `switchport trunk allowed vlan 10,20,99` (remove default 1). On both switches. Verify `show interfaces trunk` shows VLAN 1 not in allowed list.',
        'output_match',
        'Allowed vlans on trunk: 10,20,99',
        'Pruning unused VLANs from trunks limits VLAN-hopping attack surface.',
        false),
      task('t7',
        'Save and document. Run `copy run start` on both switches. Write a 3-sentence change-management entry: what was wrong, what you changed, how to roll back if needed.',
        'free_response',
        undefined,
        'The Dojo expects every change documented. Rollback to default = `no switchport trunk native vlan 99` returns to native VLAN 1.',
        true),
    ],
    commonMistakes: [
      'Forgetting to specify allowed VLANs — by default trunks pass all VLANs (information leak)',
      'Treating native VLAN = 1 as acceptable (it\'s the default but VLAN-hopping risk)',
      'Not running CDP/LLDP and missing the automatic mismatch detection',
      'Skipping `copy run start` — the config disappears on switch reboot',
    ],
    troubleshooting: [
      { symptom: 'Trunk won\'t form', fix: '`switchport mode trunk` on both ends. If DTP is disabled, you must set both sides to trunk explicitly. Check `show interfaces trunk` for "trunking" mode.' },
      { symptom: 'No CDP mismatch warning appears', fix: 'CDP must be enabled (`cdp run` global, `cdp enable` interface). Some platforms require LLDP instead.' },
    ],
    sourceRefs: [
      'https://learningnetwork.cisco.com/s/ccna',
      'https://www.cisco.com/c/en/us/support/docs/lan-switching/8021q/17056-741-4.html',
    ],
  }),

  proofLab({
    id: 'ccna-lab-002',
    certId: C,
    domainId: 'ccna-security',
    objectiveId: 'ccna-obj-acls',
    title: 'The ACL Placement Decision',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    xpReward: 95,
    loreNarration:
      'Sensei Route draws three routers and a server farm on the whiteboard. "Standard ACLs go close to the destination. Extended ACLs go close to the source. Memorize this and you will pass the exam — but to defend the kingdom ' +
      'you must know WHY. Today: build the topology, write two ACLs (one of each kind), place them at correct and incorrect points, observe the consequences."',
    tools: [
      { name: 'Cisco Packet Tracer', url: 'https://www.netacad.com/courses/packet-tracer' },
    ],
    setup:
      'Build this topology in Packet Tracer:\n' +
      '  PC-A (10.1.1.10) ── R1 ── R2 ── R3 ── Server-Farm (10.3.3.0/24)\n' +
      '  PC-B (10.1.2.10) ── R1\n' +
      'R1 LAN-1: 10.1.1.0/24 (PC-A). R1 LAN-2: 10.1.2.0/24 (PC-B). R1↔R2 link: 10.10.10.0/30. R2↔R3 link: 10.20.20.0/30. R3 LAN: 10.3.3.0/24 (Server-Farm).\n' +
      'Configure OSPF area 0 across R1, R2, R3 so the topology has full reachability. Verify ping from PC-A → Server before applying ACLs.',
    learningObjectives: [
      'Author standard and extended ACLs from a security requirement',
      'Apply the ACL placement rule (standard near destination, extended near source) and understand why',
      'Use `show access-lists` and `show ip interface` to verify ACL application',
      'Predict ACL impact: which traffic is dropped, which is allowed, which is "implicit deny"',
      'Recognize that an ACL with all-deny effect is rarely the intent',
    ],
    tasks: [
      task('t1',
        'Verify pre-ACL connectivity. From PC-A, ping a Server-Farm host (10.3.3.10). From PC-B, ping the same. Both should succeed. Paste both ping results.',
        'output_match',
        'both pings succeed (5/5 or 100%)',
        'OSPF must be converged. Check `show ip route ospf` on R1, R2, R3.',
        false),
      task('t2',
        'REQUIREMENT 1: PC-B (10.1.2.10) must NOT reach Server-Farm. PC-A may. Write a STANDARD ACL with two ACEs: deny host 10.1.2.10, permit any. List the two `access-list` commands.',
        'output_match',
        'access-list 1 deny 10.1.2.10 0.0.0.0 / access-list 1 permit any',
        'Standard ACL = 1–99. Wildcard 0.0.0.0 means exact host match.'),
      task('t3',
        'Apply the standard ACL CLOSE TO THE DESTINATION (R3, the router serving the Server-Farm). On R3, on the LAN interface, apply outbound: `interface Gi0/0` / `ip access-group 1 out`. Test: PC-B ping Server fails; PC-A ping Server succeeds. Paste both ping results.',
        'output_match',
        'PC-B ping fails, PC-A ping succeeds',
        'Why R3 LAN out? Standard ACLs only filter source IP. Placed at the destination, they have the full picture of what to permit/deny without losing other traffic mid-transit.',
        true),
      task('t4',
        'COUNTER-EXAMPLE. Move the same ACL to R1\'s LAN-2 interface (PC-B\'s subnet) inbound. What\'s the consequence? Test PC-B pinging ANY destination (not just Server-Farm). Document.',
        'free_response',
        undefined,
        'Because standard ACLs don\'t see destination IP, applying close to source for "block PC-B from Server-Farm" actually blocks PC-B from EVERYTHING. That\'s why standard goes near destination.',
        true),
      task('t5',
        'Remove the standard ACL. Now REQUIREMENT 2: PC-A may reach Server-Farm only via HTTPS (port 443); all other traffic from PC-A to Server-Farm must be denied. Other PCs unaffected. Write an EXTENDED ACL.',
        'output_match',
        'access-list 110 permit tcp host 10.1.1.10 10.3.3.0 0.0.0.255 eq 443 / access-list 110 deny ip host 10.1.1.10 10.3.3.0 0.0.0.255 / access-list 110 permit ip any any',
        'Extended ACL = 100–199. Three ACEs: permit specific HTTPS, deny rest from PC-A, permit everything else.',
        false),
      task('t6',
        'Apply the extended ACL CLOSE TO THE SOURCE — on R1, inbound on the PC-A LAN interface. Verify: from PC-A, browse https://10.3.3.10 (or any TCP/443 test) — should succeed. From PC-A, ping 10.3.3.10 — should fail. PC-B ping Server — succeeds. Paste at least two of these results.',
        'output_match',
        'HTTPS succeeds, ICMP from PC-A fails, PC-B unaffected',
        'Extended ACLs go near source so they drop unwanted traffic before it consumes WAN bandwidth.',
        true),
      task('t7',
        'Save and document. `copy run start` on R1 and R3. Write a brief impact analysis: which user-visible behavior changed, what the rollback command is.',
        'free_response',
        undefined,
        'Rollback for extended: `interface Gi0/0` / `no ip access-group 110 in`. Then `no access-list 110` to remove definition.',
        true),
    ],
    commonMistakes: [
      'Forgetting the implicit `deny ip any any` at the end — only your explicit permits and denies matter, but anything not matched is denied',
      'Placing standard ACL at the source — drops traffic to destinations that should be allowed',
      'Forgetting to apply the ACL to an interface — defining one without `ip access-group` does nothing',
      'Using inbound vs outbound ambiguously — they refer to the router interface\'s perspective, not the user\'s',
    ],
    troubleshooting: [
      { symptom: 'Ping still works after applying deny ACL', fix: 'Check direction (`in` vs `out`) — the ACL must filter the direction the traffic is moving across that interface. Also verify ACL is actually applied: `show ip interface gi0/0`.' },
      { symptom: 'All traffic dropped after applying ACL', fix: 'You forgot the `permit any` (or `permit ip any any` for extended) at the end. Implicit deny catches everything else.' },
    ],
    sourceRefs: [
      'https://learningnetwork.cisco.com/s/ccna',
      'https://www.cisco.com/c/en/us/support/docs/security/ios-firewall/23602-confaccesslists.html',
    ],
  }),
];
