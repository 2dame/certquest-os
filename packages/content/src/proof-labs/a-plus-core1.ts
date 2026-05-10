/**
 * A+ Core 1 (220-1201) proof-based labs — Help Desk Guild.
 * Two labs covering troubleshooting methodology and networking fundamentals.
 */

import { proofLab, task } from '../authoring-rich';
import type { ProofLab } from '@certquest/types';

const C = 'a-plus-core1';

export const aPlusCore1ProofLabs: ProofLab[] = [
  proofLab({
    id: 'aplus-c1-lab-001',
    certId: C,
    domainId: 'aplus-c1-troubleshoot',
    objectiveId: 'aplus-c1-obj-troubleshoot-method',
    title: 'The Boot Diagnostic Trial',
    difficulty: 'beginner',
    estimatedMinutes: 30,
    xpReward: 80,
    loreNarration:
      'Captain Byte slides a sealed dossier across the desk. "A guildmaster\'s workstation refused to boot this morning. Three rookies have already tried. Every one of them ' +
      'replaced parts before identifying the problem. You will not. Walk the methodology — six steps, in order — and document every decision before you turn a single screw. ' +
      'The Help Desk Guild remembers techs by their docs, not their fixes."',
    tools: [
      { name: 'VirtualBox', url: 'https://www.virtualbox.org/', notes: 'Free hypervisor for safely simulating boot failure scenarios.' },
      { name: 'Any text editor', notes: 'For the troubleshooting log artifact.' },
    ],
    setup:
      'Install VirtualBox if not already present. Create a new VM with Ubuntu (or any Linux ISO). Boot it once successfully — verify it works. Power off. Now in VM Settings > System > ' +
      'Boot Order, REMOVE the hard disk from the boot order, leaving only the optical drive (which has no media inserted). Start the VM. The "boot failure" is now reproducible: ' +
      'no bootable media. This is the simulated symptom you will diagnose.',
    learningObjectives: [
      'Apply CompTIA\'s six-step troubleshooting methodology in order',
      'Identify the difference between symptoms and root causes',
      'Document a troubleshooting session at a level another tech could follow',
      'Recognize that "the obvious answer" is often correct (Occam\'s razor)',
      'Verify full system functionality before closing a ticket',
    ],
    tasks: [
      task('t1',
        'Step 1 — Identify the problem. In your log, write a one-paragraph problem statement using only what the user (your VM\'s symptoms) tells you. No theories yet.',
        'free_response',
        undefined,
        'Include: what was attempted, what error appeared, when it last worked, what changed.',
        true),
      task('t2',
        'Step 2 — Establish a theory. List THREE possible causes ranked by likelihood. The exam favors the simplest explanation (Occam\'s razor).',
        'free_response',
        undefined,
        'Boot order misconfig should appear in your top 3.',
        true),
      task('t3',
        'Step 3 — Test the theory. From your top theory, what is the minimum-cost test to confirm or eliminate it? Write the exact action you will take.',
        'output_match',
        'check boot order',
        'You should reach the BIOS/UEFI or VM settings; one click confirms the theory.'),
      task('t4',
        'Step 4 — Plan and implement. Open VM Settings > System > Boot Order. Re-add the hard disk. Save. Boot. Paste a brief description of what you changed.',
        'free_response',
        undefined,
        undefined,
        true),
      task('t5',
        'Step 5 — Verify full functionality. The system boots. Now check: does it boot every time? Reboot at least twice. Does the VM reach the desktop login? Confirm both.',
        'decision',
        'verified_two_reboots',
        'Verifying twice catches intermittent issues.',
        true),
      task('t6',
        'Step 6 — Document. Submit your full log: problem statement, theories, test, fix, verification result, and one preventive recommendation (e.g., "lock UEFI settings with a password").',
        'free_response',
        undefined,
        'Other techs should be able to read your doc and reproduce your fix in 5 minutes.',
        true),
    ],
    commonMistakes: [
      'Skipping straight to "replace the hardware" before identifying the problem',
      'Writing "fixed it" without documenting what was changed',
      'Verifying once and closing the ticket — single test can hide intermittent issues',
      'Forgetting the preventive measure step (the recommendation that this won\'t happen again)',
    ],
    troubleshooting: [
      { symptom: 'VM still won\'t boot after re-adding hard disk', fix: 'Verify the disk is checked AND positioned first in boot order. Save settings before booting.' },
      { symptom: 'BIOS/UEFI options not visible', fix: 'In a real PC: hit DEL/F2/F12 at power-on. In a VirtualBox VM: settings are in the GUI, not the BIOS screen.' },
    ],
    sourceRefs: [
      'https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/',
    ],
  }),

  proofLab({
    id: 'aplus-c1-lab-002',
    certId: C,
    domainId: 'aplus-c1-network',
    objectiveId: 'aplus-c1-obj-network-protocols',
    title: 'Cable Crafting at Hephaestus\'s Anvil',
    difficulty: 'beginner',
    estimatedMinutes: 25,
    xpReward: 70,
    loreNarration:
      'The Cable Catacombs stretch below the guild hall. Captain Byte points at a coil of Cat 6a. "Three runs. Three different lengths. Three different jobs. Get the wiring standard wrong, ' +
      'and the kingdom\'s gigabit becomes 100 megabit, and nobody knows why. The Anvil tests not your hands but your knowledge of T568A versus T568B and the math of run lengths."',
    tools: [
      { name: 'Cisco Packet Tracer', url: 'https://www.netacad.com/courses/packet-tracer', notes: 'Free with Networking Academy enrollment. Used here for cabling diagrams.' },
      { name: 'Any pinout reference', notes: 'TIA/EIA-568-A and 568-B pinouts.' },
    ],
    setup:
      'Open Packet Tracer (or sketch on paper if Packet Tracer unavailable). For each task you\'ll specify a cable type, wiring standard, and connector — proving the choice matches the run length and use case.',
    learningObjectives: [
      'Identify Cat 5e, Cat 6, and Cat 6a by spec and run length',
      'Know the TIA/EIA-568-A vs 568-B color order from memory',
      'Choose between straight-through and crossover for a given device pair',
      'Recognize when fiber is required over copper',
    ],
    tasks: [
      task('t1',
        'Job 1: a 30-meter run from a switch to a workstation, requiring 1 Gbps. Specify: cable category, wiring standard on each end (568A or 568B), straight-through or crossover.',
        'output_match',
        'Cat 5e or higher; both ends T568B (or both T568A); straight-through',
        'Modern switches handle Auto-MDIX, but the exam answer is straight-through for switch-to-PC.'),
      task('t2',
        'Job 2: a 70-meter run from MDF to IDF, requiring 10 Gbps. Specify category, why this category, and standard.',
        'output_match',
        'Cat 6a (Cat 6 caps out at ~55m for 10 Gbps); both ends T568B; straight-through',
        'Cat 6 fails at this distance — it must be Cat 6a or fiber.'),
      task('t3',
        'Job 3: connect two switches in a lab cabinet (no Auto-MDIX assumed). Cable run is 2 meters. Specify standard, type.',
        'output_match',
        'Cat 5e or higher; one end 568A, other end 568B; crossover',
        'Crossover swaps pairs 1-2 and 3-6 between ends, encoded by mixing standards.'),
      task('t4',
        'Job 4: a 250-meter run between two buildings, 1 Gbps required. Specify cable type and why copper is wrong here.',
        'output_match',
        'Single-mode or multi-mode fiber; copper Ethernet is limited to 100m',
        'Copper Ethernet caps at 100 meters per standard. Anything beyond requires fiber.'),
      task('t5',
        'List the T568B pin-1 to pin-8 color order from memory (no peeking).',
        'output_match',
        'White-Orange, Orange, White-Green, Blue, White-Blue, Green, White-Brown, Brown',
        'Mnemonic: "Orange-Green-Blue-Brown" with white pairs alternating.'),
      task('t6',
        'For Job 1, take a screenshot or sketch of your Packet Tracer cabling diagram (or hand-drawn equivalent) and submit as proof.',
        'screenshot',
        undefined,
        'Annotate the cable type and standard on the diagram.',
        false),
    ],
    commonMistakes: [
      'Assuming Cat 6 can handle 10 Gbps over 100 meters — it can\'t (caps near 55m)',
      'Confusing T568A and T568B color orders — they differ on pairs 2 and 3',
      'Using a crossover where Auto-MDIX makes one unnecessary (modern equipment)',
      'Specifying copper for runs over 100 meters',
    ],
    troubleshooting: [
      { symptom: 'Cable tested but link won\'t come up', fix: 'Check both ends use the same standard; verify pins 1, 2, 3, and 6 have continuity (the data pairs).' },
      { symptom: 'Link comes up at 100 Mbps instead of 1 Gbps', fix: 'Likely a broken pair on pins 4-5 or 7-8. 100M only needs 4 wires; gigabit needs all 8.' },
    ],
    sourceRefs: [
      'https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/',
    ],
  }),
];
