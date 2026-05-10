/**
 * Network+ (N10-009) proof-based labs — Packet Seas.
 * Two labs: subnetting from requirements + Wireshark protocol analysis.
 */

import { proofLab, task } from '../authoring-rich';
import type { ProofLab } from '@certquest/types';

const C = 'network-plus';

export const networkPlusProofLabs: ProofLab[] = [
  proofLab({
    id: 'netplus-lab-001',
    certId: C,
    domainId: 'netplus-fund',
    objectiveId: 'netplus-obj-subnet',
    title: 'Charting the Subnet Archipelago',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    xpReward: 90,
    loreNarration:
      'Admiral Ping unrolls a sea chart across the table. "A coastal trading company gave us 192.168.50.0/24 for their five offices. Each office needs a separate subnet. The biggest needs 50 hosts; the smallest needs ' +
      '10. They want NO wasted addresses. Chart the subnets. Show your work. The Packet Seas remembers cartographers who calculate, not those who guess."',
    tools: [
      { name: 'Cisco Packet Tracer', url: 'https://www.netacad.com/courses/packet-tracer', notes: 'Free with Networking Academy enrollment.' },
      { name: 'Plain text editor or spreadsheet', notes: 'For the subnet table.' },
    ],
    setup:
      'No setup required beyond pen + paper / calculator / spreadsheet. Optional: Packet Tracer to verify the design by configuring router interfaces with the calculated addresses and pinging across.',
    learningObjectives: [
      'Apply Variable-Length Subnet Masking (VLSM) to a real requirement',
      'Calculate subnet boundaries, broadcast addresses, and usable host ranges by hand',
      'Order subnets by size (largest first) to avoid VLSM allocation collisions',
      'Verify subnet design by computing total used vs total available addresses',
    ],
    tasks: [
      task('t1',
        'Five offices need subnets sized 50 / 25 / 12 / 6 / 4 hosts (largest to smallest). For each, calculate the SMALLEST CIDR that fits, including network + broadcast. List the five CIDR sizes (/26, etc.).',
        'output_match',
        '/26 /27 /28 /29 /29',
        'Hosts = 2^h − 2 ≥ requirement. /26=62, /27=30, /28=14, /29=6. The 4-host subnet still needs /29 (a /30 only gives 2 hosts).'),
      task('t2',
        'Allocate from 192.168.50.0/24, largest subnet first. Write the network address of each subnet in order. (50→25→12→6→4 hosts.)',
        'output_match',
        '192.168.50.0/26, 192.168.50.64/27, 192.168.50.96/28, 192.168.50.112/29, 192.168.50.120/29',
        'Always allocate largest first. /26 occupies .0–.63; next /27 starts at .64; next /28 at .96; first /29 at .112; second /29 at .120.'),
      task('t3',
        'For the largest subnet (192.168.50.0/26), list: network address, first usable host, last usable host, broadcast address.',
        'output_match',
        '192.168.50.0, 192.168.50.1, 192.168.50.62, 192.168.50.63',
        'Network = .0; broadcast = .63 (mask /26 = 255.255.255.192).'),
      task('t4',
        'How many addresses remain UNUSED in the original /24 after allocating all five subnets? (Count, not list.)',
        'calculation',
        '128',
        'Sum of allocated: 64 + 32 + 16 + 8 + 8 = 128. Of 256 total, 128 are unused.'),
      task('t5',
        'A new sixth office needs 30 hosts. Can it fit in the unused space? If yes, give the next CIDR. If no, explain why.',
        'output_match',
        '192.168.50.128/27',
        'Yes. /27 (30 hosts) fits at .128, the next /27-aligned boundary in the unused space.'),
      task('t6',
        'In Packet Tracer (or by hand), build a topology of two routers connected via a /30 link from another subnet block, with one office subnet on each side. Take a screenshot showing successful ping across, OR submit the running-config of both routers if you used Packet Tracer.',
        'screenshot',
        undefined,
        'The /30 link uses 4 addresses, 2 usable — perfect for two router interfaces.',
        false),
    ],
    commonMistakes: [
      'Allocating smallest subnets first — fragments the address space and breaks VLSM',
      'Forgetting "minus 2" for network + broadcast when sizing',
      'Choosing /30 for a 4-host subnet (a /30 only has 2 usable, not 4)',
      'Running out of addresses by not aligning subnet starts to mask boundaries',
    ],
    troubleshooting: [
      { symptom: 'Two subnets overlap', fix: 'Misalignment. The /28 must start at a multiple of 16; /27 at a multiple of 32; /26 at a multiple of 64.' },
      { symptom: 'Ping fails between routers in Packet Tracer', fix: 'Verify the /30 mask on both interfaces (255.255.255.252) and that no shutdown is set on each.' },
    ],
    sourceRefs: [
      'https://www.comptia.org/en-us/certifications/network/',
    ],
  }),

  proofLab({
    id: 'netplus-lab-002',
    certId: C,
    domainId: 'netplus-trbl',
    objectiveId: 'netplus-obj-tools',
    title: 'The Wireshark Voyage',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    xpReward: 100,
    loreNarration:
      'Admiral Ping pulls down a glass jar — inside, a frozen capture of network traffic. "Every packet a story, every header a clue. You will learn to read packets the way a cartographer reads currents. ' +
      'Capture, filter, identify. Three protocols. Three handshakes. Find the slow handshake — the Latency Kraken always leaves a trace."',
    tools: [
      { name: 'Wireshark', url: 'https://www.wireshark.org/download.html', notes: 'Free open-source packet analyzer for Windows/macOS/Linux.' },
      { name: 'A working internet connection', notes: 'Required for the live captures.' },
    ],
    setup:
      'Install Wireshark. Verify by launching it and confirming you see your network interfaces listed. Pick the active interface (likely Wi-Fi or Ethernet) — that\'s your capture target. ' +
      'You will perform three live tasks (HTTP request, DNS lookup, TCP three-way handshake) and identify the protocol fields in each.',
    learningObjectives: [
      'Capture and filter live network traffic with Wireshark display filters',
      'Identify the TCP three-way handshake (SYN, SYN-ACK, ACK)',
      'Read DNS query and response packets',
      'Distinguish HTTP from HTTPS in capture (one is readable, one is not)',
      'Use Wireshark statistics to identify slow conversations',
    ],
    tasks: [
      task('t1',
        'Start a capture on your active interface. In a browser, navigate to http://example.com (HTTP, not HTTPS). Stop the capture. Apply display filter `http.host == "example.com"`. How many HTTP request packets did you capture? Report the number.',
        'calculation',
        '1',
        'Modern browsers may prefetch — you may see 1 or 2. The point is reading the filter result count.'),
      task('t2',
        'In the same capture, find the TCP three-way handshake to example.com. Apply filter `tcp.flags.syn == 1 and ip.dst == [example.com IP]`. Identify the three packets — SYN, SYN-ACK, ACK. Paste their relative sequence numbers (Wireshark shows these in the Info column).',
        'free_response',
        undefined,
        'Look at the Flags field. SYN alone, then SYN+ACK, then ACK alone.',
        true),
      task('t3',
        'Restart capture. Run `nslookup google.com` from a terminal. Stop the capture. Apply filter `dns`. Find both the query and response. What query type was sent (A, AAAA, both)? What was the first IP in the response?',
        'free_response',
        undefined,
        'Modern resolvers often query A and AAAA. Note both.',
        true),
      task('t4',
        'Compare HTTP vs HTTPS visibility. Restart capture. Visit https://example.com. Stop. Apply filter `tls`. Can you read the GET path or response body in clear text? Yes/no, with one-sentence reason.',
        'decision',
        'no',
        'TLS encrypts everything past the handshake. You\'ll see the SNI (server name) but not the request path or response body.',
        true),
      task('t5',
        'Open Statistics > Conversations. Find the conversation with the longest "Duration" or highest "Bytes." Submit a screenshot of the Conversations window with that row highlighted.',
        'screenshot',
        undefined,
        'Conversations view groups packets by source-destination pair, showing total bytes and duration.',
        false),
      task('t6',
        'In your own words, explain the order of operations when your browser loads a webpage: DNS, TCP handshake, TLS handshake (if HTTPS), then HTTP request. Three to five sentences.',
        'free_response',
        undefined,
        'This sequence is the foundation of layered troubleshooting. Knowing the order tells you which layer to inspect first.',
        true),
    ],
    commonMistakes: [
      'Forgetting to stop the capture before filtering — the live count keeps changing',
      'Filtering with `http` then expecting to see HTTPS traffic (use `tls` or `tcp.port == 443`)',
      'Confusing SNI in TLS handshake with full URL visibility — SNI is the hostname only',
      'Not running tcpdump/Wireshark with appropriate privileges (some OSes require admin)',
    ],
    troubleshooting: [
      { symptom: 'No packets captured', fix: 'Wrong interface selected. On Windows, often the Wi-Fi NIC. On macOS, en0. Restart Wireshark with admin/root privileges if needed.' },
      { symptom: 'Filter shows nothing', fix: 'Display filter syntax is case-sensitive. `http` (lowercase) works; `HTTP` does not. Verify the protocol actually appeared in your capture.' },
    ],
    sourceRefs: [
      'https://www.wireshark.org/docs/wsug_html/',
      'https://www.comptia.org/en-us/certifications/network/',
    ],
  }),
];
