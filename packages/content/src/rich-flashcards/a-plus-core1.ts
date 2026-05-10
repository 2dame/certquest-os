/**
 * A+ Core 1 (220-1201) — Help Desk Guild rich flashcards.
 * Lore: rookie hardware recruit, mentored by Captain Byte.
 * 9-field cognitive layout: term/definition/whyItMatters/memoryHook/
 * commonTrap/example/examAngle/notebookLmReadyText/audioBriefText.
 *
 * Sources cross-checked: CompTIA A+ 220-1201 V15 official objectives
 * document v4.0 (Nov 2024 publication).
 */

import { rfc } from '../authoring-rich';
import type { RichFlashcard } from '@certquest/types';

const C = 'a-plus-core1';

export const aPlusCore1RichFlashcards: RichFlashcard[] = [
  rfc({
    id: 'aplus-c1-rfc-001',
    certId: C,
    domainId: 'aplus-c1-network',
    objectiveId: 'aplus-c1-obj-network-protocols',
    term: 'APIPA (Automatic Private IP Addressing)',
    definition: 'A Windows fallback that auto-assigns an IP from 169.254.0.0/16 when no DHCP server responds. The host gets an address but cannot reach anything beyond the local link.',
    whyItMatters: 'Seeing a 169.254.x.x address is the single fastest signal that DHCP is broken — saving you from chasing routing or firewall ghosts. Every help desk shift will involve at least one APIPA call.',
    memoryHook: 'Captain Byte calls APIPA "the cursed sigil" — when you see 169.254 written on a workstation, the DHCP server has gone silent. The two-five-four range is the guild\'s distress flare.',
    commonTrap: 'Mistaking APIPA for a misconfiguration on the workstation. The workstation is fine — its DHCP request just got no answer. Replace the cable or check the DHCP scope, not the NIC.',
    example: 'A user reports no internet. ipconfig shows 169.254.10.42 with subnet 255.255.0.0 and no default gateway. Action: confirm the cable, then check the DHCP server / VLAN — not the workstation.',
    examAngle: 'When a question gives you a 169.254 address, the answer is always "DHCP unavailable" or "check the DHCP server." Never "static misconfig."',
    tags: ['ip', 'dhcp', 'troubleshooting'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-002',
    certId: C,
    domainId: 'aplus-c1-network',
    objectiveId: 'aplus-c1-obj-network-protocols',
    term: 'Common TCP/UDP Port Set',
    definition: 'The exam-priority ports: FTP 20/21, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67/68, HTTP 80, POP3 110, IMAP 143, HTTPS 443, SMB 445, RDP 3389. Mostly TCP; DNS and DHCP use UDP.',
    whyItMatters: 'Port questions are the cheapest points on the exam — pure recall, no scenarios. Miss them and you bleed score in domain 2.',
    memoryHook: 'Pair them in narrative twos: SSH 22 is "two locks" (encrypted), Telnet 23 is its insecure twin one floor up. HTTP 80 is "the open gate," HTTPS 443 is "the gate with three guards." RDP 3389 — "three guards, three keys, eight rooms, nine layers."',
    commonTrap: 'Confusing DHCP server (UDP 67) with DHCP client (UDP 68). Server listens on 67; client sends from 68. The exam will swap them.',
    example: 'A firewall blocks "remote desktop sessions to a Windows server." Open TCP 3389. If the server is also exposed for SSH admin, also TCP 22.',
    examAngle: 'Memorize the ports in pairs (SSH/Telnet, POP3/IMAP, HTTP/HTTPS) and remember which side of each pair is encrypted. Encrypted side wins on the modern exam.',
    tags: ['ports', 'protocols'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-003',
    certId: C,
    domainId: 'aplus-c1-hardware',
    objectiveId: 'aplus-c1-obj-hardware-internal',
    term: 'DDR4 vs DDR5 RAM',
    definition: 'Both use 288-pin DIMMs but are physically incompatible — the keying notch is in different positions. DDR5 doubles base bandwidth, integrates voltage regulation onto the module, and adds on-die ECC.',
    whyItMatters: 'Mixing them physically damages slots and is a top-three help desk reinstall mistake. Knowing keying prevents real-world destruction.',
    memoryHook: 'Captain Byte: "Same pin count, different keys — like two identical doors with different locks." Don\'t force the door.',
    commonTrap: 'Believing pin count alone determines compatibility. It doesn\'t. Keying position decides.',
    example: 'A motherboard has DDR5 slots. The user brought DDR4 modules they "had lying around." They will not fit. Order DDR5 modules matching the board\'s supported speeds.',
    examAngle: 'When a question lists matching pin counts but a "won\'t fit" symptom, the answer is keying. When a question says ECC, DDR5 has on-die ECC by default; server boards may also use traditional ECC modules.',
    tags: ['ram', 'memory', 'compatibility'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'aplus-c1-rfc-004',
    certId: C,
    domainId: 'aplus-c1-hardware',
    objectiveId: 'aplus-c1-obj-hardware-storage',
    term: 'NVMe vs SATA SSD',
    definition: 'NVMe SSDs ride the PCIe bus directly (typically PCIe 3.0 x4 or 4.0 x4), reaching 3,000–7,000 MB/s. SATA SSDs use the older SATA III interface, capped near 550 MB/s.',
    whyItMatters: 'On a real workstation upgrade, NVMe is the single biggest perceived performance jump a user will experience. It also reshapes troubleshooting — bottlenecks shift from disk to RAM/CPU.',
    memoryHook: 'NVMe = "Nearly Velocity of Memory" (it\'s on the PCIe bus, like RAM\'s neighbor). SATA = "Slower Always Than Anything" newer.',
    commonTrap: 'Assuming any M.2 slot is NVMe. M.2 is just a form factor — some M.2 slots are SATA-only. Check the keying (B-key, M-key, B+M).',
    example: 'A laptop boots in 30 seconds with a SATA SSD. After cloning to an NVMe drive in the same M.2 slot (M-key, PCIe), boot drops to 8 seconds.',
    examAngle: 'If the question mentions "fastest" or "PCIe lanes," the answer is NVMe. If it mentions "M.2 form factor" without "PCIe," it could be either — read the keying.',
    tags: ['storage', 'ssd', 'nvme'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'aplus-c1-rfc-005',
    certId: C,
    domainId: 'aplus-c1-hardware',
    objectiveId: 'aplus-c1-obj-hardware-storage',
    term: 'RAID Levels 0, 1, 5, 10',
    definition: 'RAID 0 stripes for speed, no redundancy (lose any disk, lose all). RAID 1 mirrors for redundancy, no speed gain. RAID 5 stripes with one parity disk, needs ≥3 disks, survives one failure. RAID 10 mirrors then stripes (or stripes then mirrors), needs ≥4 disks, survives one disk per mirror.',
    whyItMatters: 'RAID is the difference between "we lost a drive" and "we lost the company." Picking wrong on a server build can be unrecoverable.',
    memoryHook: 'Zero is "Zero protection." One is "One copy mirrored." Five is "Five letters in PARITY." Ten is "ten = 1 + 0 layered."',
    commonTrap: 'Calling RAID a backup. RAID is uptime, not backup. A `rm -rf` propagates instantly across all disks.',
    example: 'A small file server needs both speed and redundancy on a budget. With four 2 TB drives, RAID 10 gives 4 TB usable, full redundancy on each pair, and the highest throughput of any redundant level.',
    examAngle: 'When the question lists a minimum disk count, count: RAID 0 = 2, RAID 1 = 2, RAID 5 = 3, RAID 6 = 4, RAID 10 = 4. The minimum count alone often eliminates two answers.',
    tags: ['raid', 'storage', 'redundancy'],
    difficulty: 'intermediate',
  }),

  rfc({
    id: 'aplus-c1-rfc-006',
    certId: C,
    domainId: 'aplus-c1-network',
    objectiveId: 'aplus-c1-obj-network-cables',
    term: 'Cat 5e / Cat 6 / Cat 6a Cabling',
    definition: 'Cat 5e supports 1 Gbps to 100 m. Cat 6 supports 10 Gbps but only to ~55 m (1 Gbps to 100 m). Cat 6a supports 10 Gbps for the full 100 m and adds shielding against alien crosstalk.',
    whyItMatters: 'Picking Cat 6 for a long 10 GbE run is a real-world wiring failure that won\'t show up until users report intermittent slowdowns months later.',
    memoryHook: 'Five-e = "Enough for gigabit." Six = "Six gets ten gigs but stops short" (55 m). Six-a = "a for All-the-way" (100 m at 10 G).',
    commonTrap: 'Trusting Cat 6 will deliver 10 Gbps over 100 m. It won\'t — past ~55 m it falls back to 1 Gbps. The exam loves to set runs at 60–80 m to make Cat 6 wrong.',
    example: 'New office build: 80-meter runs from MDF to each desk for a 10 GbE upgrade plan. Specify Cat 6a, not Cat 6 — even though Cat 6 is cheaper, it can\'t deliver at that distance.',
    examAngle: 'When the question gives a specific run length and 10 Gbps requirement, do the math: any run > 55 m demands Cat 6a (or fiber). Length is the discriminator.',
    tags: ['cabling', 'ethernet'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-007',
    certId: C,
    domainId: 'aplus-c1-cloud',
    objectiveId: 'aplus-c1-obj-cloud-models',
    term: 'IaaS / PaaS / SaaS Service Models',
    definition: 'IaaS: provider gives raw compute/storage/network; you manage OS and up (e.g., EC2, Azure VMs). PaaS: provider gives a runtime/platform; you manage code and data (e.g., App Service, App Engine). SaaS: provider gives a finished application; you manage data and users (e.g., Microsoft 365, Salesforce).',
    whyItMatters: 'Service-model questions appear on every A+ Core 1 exam and frame every later cloud cert. Picking the wrong model in real life means you over- or under-pay by an order of magnitude.',
    memoryHook: 'Stack analogy: bottom is bare metal. IaaS hands you the lower floor. PaaS hands you a furnished apartment. SaaS hands you a hotel room — you only bring a toothbrush.',
    commonTrap: 'Calling Office 365 "PaaS." It\'s SaaS — you don\'t deploy code, you just use the apps.',
    example: 'A startup wants email, docs, and chat without IT staff. SaaS (Microsoft 365 / Google Workspace) fits. They want to deploy a custom Python web app without managing servers — PaaS. They want full control of the OS for compliance reasons — IaaS.',
    examAngle: 'Look for the verbs the customer does: "manage OS" → IaaS; "deploy code" → PaaS; "use the app" → SaaS. The verb tells you the model.',
    tags: ['cloud', 'service-models'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-008',
    certId: C,
    domainId: 'aplus-c1-mobile',
    objectiveId: 'aplus-c1-obj-mobile-display',
    term: 'OLED vs LCD Displays',
    definition: 'OLED pixels emit their own light, so off pixels are fully black, contrast is effectively infinite, and panels can be thinner and flexible. LCD relies on a backlight bleeding through liquid-crystal shutters; blacks are gray and contrast is bounded.',
    whyItMatters: 'OLED is now standard on flagship phones and many laptops. Diagnosing a "screen looks washed out at night" or "burn-in" complaint requires knowing which technology you\'re looking at.',
    memoryHook: 'OLED = "Off means Off" (each pixel is its own lamp). LCD = "Light Comes Daylight-style" (one big backlight always on).',
    commonTrap: 'Recommending OLED for static-content workstations (POS terminals, dashboards). OLED can suffer permanent burn-in from displaying the same image for hours daily; LCD does not.',
    example: 'A user reports "ghost image of the start menu" on their always-on conference-room display. The display is OLED — the start menu burned in. Replacement display should be LCD for a static-image use case.',
    examAngle: 'When the question mentions "burn-in," the answer is OLED. When it mentions "true blacks" or "infinite contrast," again OLED. When it mentions "backlight bleed" or "IPS," LCD.',
    tags: ['display', 'mobile', 'oled', 'lcd'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-009',
    certId: C,
    domainId: 'aplus-c1-troubleshoot',
    objectiveId: 'aplus-c1-obj-troubleshoot-method',
    term: 'CompTIA Troubleshooting Methodology (Six Steps)',
    definition: 'Identify the problem; establish a theory of probable cause (question the obvious); test the theory; establish a plan of action and implement it; verify full system functionality and apply preventive measures; document findings, actions, and outcomes.',
    whyItMatters: 'V15 removed this from formal exam objectives but still expects you to follow it implicitly in scenarios. More importantly: it\'s the one process that separates a tech who fixes things from one who just guesses.',
    memoryHook: '"I.T. Pros Plan, Verify, Document" — Identify, Theorize, Test, Plan, Verify, Document. Six steps, six words, in order.',
    commonTrap: 'Skipping "verify full functionality" — closing the ticket the moment the immediate symptom is gone. The exam will set up scenarios where the user reports two issues; only fixing one means failure on this objective.',
    example: 'A user can\'t print. Identify: which printer, which doc, when did it last work. Theory: spooler service stuck. Test: restart Print Spooler. Plan: restart, then test print. Verify: print succeeds AND user can print to all their normal printers. Document: ticket notes the cause and fix.',
    examAngle: 'In any scenario question, the FIRST step is always "identify the problem" / "ask the user what changed." Last step is always "document." If those aren\'t in the answer choices, the question is testing a middle step — read carefully.',
    tags: ['troubleshooting', 'methodology'],
    difficulty: 'beginner',
  }),

  // --- Mobile Devices domain additions (aplus-c1-mobile) ---

  rfc({
    id: 'aplus-c1-rfc-011',
    certId: C,
    domainId: 'aplus-c1-mobile',
    objectiveId: 'aplus-c1-obj-mobile-display',
    term: 'Mobile Device Synchronization Methods',
    definition: 'Mobile devices sync via USB (wired, fastest, requires cable), Bluetooth (wireless PAN, ~10 m, used for audio and file transfer), Wi-Fi (wireless LAN sync via shared AP), and cloud sync (iCloud, Google Drive — no physical connection, syncs across devices automatically). MDM platforms may enforce or restrict these methods.',
    whyItMatters: 'A+ Core 1 scenario questions frequently describe a user who cannot sync their phone or who needs data transferred between devices. Matching the symptom to the correct method eliminates wrong answers quickly.',
    memoryHook: 'Captain Byte\'s hierarchy: "USB is the cable hand-shake. Bluetooth is the whisper. Wi-Fi is the room shout. Cloud is the magic that works while you sleep."',
    commonTrap: 'Treating Bluetooth as suitable for large file transfers between a phone and a laptop. Bluetooth is slow (3 Mbps for classic, ~24 Mbps for BT 3.0+HS) and best for audio. USB or Wi-Fi Direct is correct for large files.',
    example: 'A photographer needs to transfer 20 GB of RAW photos from their iPhone to a MacBook quickly. Wi-Fi sync is too slow for 20 GB; cloud takes hours. Connect with a USB-C cable and use Finder/iTunes — fastest path.',
    examAngle: 'When the question asks "fastest wired sync" → USB. "Wireless sync without an AP" → Bluetooth or Wi-Fi Direct. "Sync across multiple devices automatically without cables" → cloud sync.',
    tags: ['mobile', 'sync', 'bluetooth', 'usb'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-012',
    certId: C,
    domainId: 'aplus-c1-mobile',
    objectiveId: 'aplus-c1-obj-mobile-display',
    term: 'Mobile Device Management (MDM) and Remote Wipe',
    definition: 'MDM solutions (Intune, Jamf, MobileIron) enroll devices and centrally enforce: screen lock policies, encryption requirements, app allowlists/blocklists, certificate deployment, and remote wipe. Remote wipe factory-resets the device when it is reported lost or stolen — data is unrecoverable without a backup.',
    whyItMatters: 'A+ Core 1 V15 explicitly tests MDM concepts and remote wipe as corporate mobile security controls. Real-world: every enterprise mobile policy requires MDM enrollment before allowing email access.',
    memoryHook: 'Captain Byte: "MDM is the remote control for every phone in the fleet. Remote wipe is the self-destruct button." Enroll first; wipe only if lost.',
    commonTrap: 'Confusing remote wipe with remote lock. Remote lock prevents access but preserves data — the device can be unlocked and recovered. Remote wipe destroys data and cannot be undone. The exam sets up scenarios where only one is appropriate.',
    example: 'A sales rep reports their company iPhone stolen at an airport. IT confirms no biometric lock was set and sensitive CRM data is accessible. Action: remote wipe via MDM to factory-reset the device — data lost but protected from the thief.',
    examAngle: 'Scenario says "lost device with sensitive data, cannot recover device" → remote wipe. "Lock device temporarily while investigating" → remote lock. "Enforce encryption on all company phones" → MDM policy.',
    tags: ['mdm', 'mobile', 'security', 'remote-wipe'],
    difficulty: 'beginner',
  }),

  rfc({
    id: 'aplus-c1-rfc-010',
    certId: C,
    domainId: 'aplus-c1-network',
    objectiveId: 'aplus-c1-obj-network-protocols',
    term: 'Wi-Fi Standards 802.11ax (Wi-Fi 6/6E) and 802.11be (Wi-Fi 7)',
    definition: 'Wi-Fi 6 (ax) operates on 2.4/5 GHz with OFDMA, MU-MIMO, and ~9.6 Gbps theoretical max. Wi-Fi 6E adds the 6 GHz band. Wi-Fi 7 (be) adds 320 MHz channels, 4096-QAM, and Multi-Link Operation, theoretical ~46 Gbps.',
    whyItMatters: 'V15 explicitly added Wi-Fi 6E and Wi-Fi 7 awareness. Real deployments now require knowing which client devices and APs support which band, especially the new 6 GHz channels.',
    memoryHook: 'Letters get later in the alphabet as standards get faster: a/b/g/n/ac/ax/be — "All Bands Going Newer All Crazy Awesome Be-Best."',
    commonTrap: 'Assuming "Wi-Fi 6" automatically means 6 GHz. It doesn\'t — only Wi-Fi 6E adds the 6 GHz band. Wi-Fi 6 (no E) is still 2.4/5 GHz only.',
    example: 'Office wants a "Wi-Fi 6" upgrade. To get 6 GHz benefits (less interference, more channels), specify Wi-Fi 6E or Wi-Fi 7 access points AND clients capable of 6 GHz. Older clients won\'t see the new band.',
    examAngle: 'If the question mentions 6 GHz channels, the answer is Wi-Fi 6E or Wi-Fi 7 — never plain Wi-Fi 6. If it mentions "320 MHz channels" or "MLO," that\'s Wi-Fi 7 specifically.',
    tags: ['wifi', 'wireless', 'wifi6', 'wifi7'],
    difficulty: 'intermediate',
  }),
];
