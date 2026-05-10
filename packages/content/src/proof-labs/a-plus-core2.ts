/**
 * A+ Core 2 (220-1202) proof-based labs — Field Support Order.
 * Two labs: malware response + Windows local policy.
 */

import { proofLab, task } from '../authoring-rich';
import type { ProofLab } from '@certquest/types';

const C = 'a-plus-core2';

export const aPlusCore2ProofLabs: ProofLab[] = [
  proofLab({
    id: 'aplus-c2-lab-001',
    certId: C,
    domainId: 'aplus-c2-security',
    objectiveId: 'aplus-c2-obj-malware',
    title: 'Defense Against the Dark Software',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    xpReward: 100,
    loreNarration:
      'Agent Patch hands you a sealed Faraday bag. "A field op laptop came back from a conference covered in indicators. Pop-ups, unknown processes, browser hijack. The op already plugged it into the ' +
      'network for fifteen minutes before realizing. Walk the seven steps — in order — and prove the cleanup. We close this ticket the way the Order trains: by procedure, never by improvisation."',
    tools: [
      { name: 'VirtualBox', url: 'https://www.virtualbox.org/', notes: 'Required — never run malware response training on your real machine.' },
      { name: 'Windows 10/11 evaluation ISO', url: 'https://www.microsoft.com/en-us/evalcenter/', notes: '90-day eval — sufficient for the lab.' },
      { name: 'EICAR test string', url: 'https://www.eicar.org/download-anti-malware-testfile/', notes: 'Standard non-malicious test file that AV products treat as malware. Safe.' },
      { name: 'Malwarebytes Free', url: 'https://www.malwarebytes.com/', notes: 'Second-opinion scanner.' },
    ],
    setup:
      'In VirtualBox, install Windows 10/11 Eval. Take a snapshot ("clean baseline"). On the VM, download the EICAR test string into Documents. Defender will quarantine it; that\'s expected and is the ' +
      '"infection" you\'ll respond to. The lab proves your procedure works against a known-positive trigger without using real malware.',
    learningObjectives: [
      'Execute the CompTIA seven-step malware removal procedure in correct order',
      'Demonstrate why System Restore must be disabled BEFORE remediation',
      'Use safe-mode and second-opinion scanning to verify cleanup',
      'Document the entire response as a runbook another tech could follow',
      'Educate the end-user (the final, frequently-skipped step)',
    ],
    tasks: [
      task('t1',
        'Step 1 — Investigate and verify symptoms. Document: what indicator triggered, where it was found (Defender quarantine log), what file/process. Paste the relevant Defender event ID and timestamp.',
        'free_response',
        undefined,
        'Open Windows Security > Protection history. Each entry has a timestamp and severity.',
        true),
      task('t2',
        'Step 2 — Quarantine. In a real incident, you\'d isolate the host from the network. Simulate by disabling the VM\'s network adapter. Confirm by running `ipconfig` and showing no default gateway.',
        'output_match',
        'Media disconnected',
        'Settings > Network > VirtualBox interface > Disable. Verify with ipconfig.',
        false),
      task('t3',
        'Step 3 — Disable System Restore. Open System Properties > System Protection > select C: > Configure > Disable. Document why this step comes BEFORE remediation, in your own words.',
        'free_response',
        undefined,
        'If restore points exist with the malware in them, cleaned files can be re-infected on rollback.',
        true),
      task('t4',
        'Step 4 — Remediate. Run a full Defender scan AND a Malwarebytes second-opinion scan in safe mode. Paste the result summary from both.',
        'free_response',
        undefined,
        'Boot to Safe Mode with Networking via msconfig or Shift+Restart > Troubleshoot.',
        false),
      task('t5',
        'Step 5 — Schedule scans and updates. Open Task Scheduler. Create a weekly Defender quick-scan task. Paste the task name and trigger.',
        'output_match',
        'Weekly trigger configured',
        'Task Scheduler > Create Basic Task > Weekly trigger > Start `MpCmdRun.exe` with quick-scan args.',
        false),
      task('t6',
        'Step 6 — Re-enable System Restore and create a fresh restore point. Confirm by running `Get-ComputerRestorePoint` in PowerShell.',
        'output_match',
        'Description, RestorePointType, and CreationTime listed for new point',
        'PowerShell as admin: `Get-ComputerRestorePoint`.',
        false),
      task('t7',
        'Step 7 — Educate the end user. Write a 3–5 sentence message to the affected field op explaining what happened, what you did, and what to do differently next time. (No tech jargon dump — keep it human.)',
        'free_response',
        undefined,
        'The user should walk away with one specific behavior change, not a list of grievances.',
        true),
    ],
    commonMistakes: [
      'Running scans BEFORE disabling System Restore',
      'Skipping the second-opinion scanner — Defender alone misses some PUPs',
      'Closing the ticket without educating the user (the most-skipped step)',
      'Re-attaching the host to the network before verifying clean state',
    ],
    troubleshooting: [
      { symptom: 'Defender keeps re-quarantining the same file', fix: 'Likely a real persistence mechanism (scheduled task, registry run key). In safe mode, check Autoruns from Sysinternals.' },
      { symptom: 'Cannot disable System Restore — option grayed out', fix: 'Check Group Policy or domain join status; in a domain environment a GPO may force System Protection on.' },
    ],
    sourceRefs: [
      'https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/',
    ],
  }),

  proofLab({
    id: 'aplus-c2-lab-002',
    certId: C,
    domainId: 'aplus-c2-os',
    objectiveId: 'aplus-c2-obj-windows-tools',
    title: 'Local Group Policy Sandbox',
    difficulty: 'intermediate',
    estimatedMinutes: 35,
    xpReward: 90,
    loreNarration:
      'Agent Patch sets a clean Win 11 Pro ISO on the table. "A field op needs a hardened workstation: locked screensaver, blocked USB removable storage, mandatory password complexity. ' +
      'You will use the Local Group Policy Editor (gpedit.msc), not domain GPOs — most help-desk fixes happen on standalone machines. Apply, verify with gpresult, and document. The Order audits every config."',
    tools: [
      { name: 'VirtualBox', url: 'https://www.virtualbox.org/' },
      { name: 'Windows 11 Pro evaluation', url: 'https://www.microsoft.com/en-us/evalcenter/', notes: 'Pro or Enterprise — Home edition does not include gpedit.msc.' },
    ],
    setup:
      'In VirtualBox install Windows 11 Pro Eval. Sign in with a local account (no Microsoft account required for the lab). Take a snapshot before changes — you can revert and try again.',
    learningObjectives: [
      'Use Local Group Policy Editor to apply security policies',
      'Differentiate between Computer and User configuration scopes',
      'Verify policy application with gpresult /r and gpresult /h',
      'Understand which settings require sign-out / restart to take effect',
      'Document a policy change with rollback steps',
    ],
    tasks: [
      task('t1',
        'Open gpedit.msc. Navigate to Computer Configuration > Windows Settings > Security Settings > Account Policies > Password Policy. Set: Minimum password length = 12. Password must meet complexity requirements = Enabled. Run gpupdate /force. Paste the gpupdate confirmation output.',
        'output_match',
        'Computer Policy update has completed successfully',
        'Run from elevated cmd or PowerShell.'),
      task('t2',
        'Verify the password policy applied. Open elevated cmd, run: `net accounts`. Paste the output showing minimum password length is now 12.',
        'output_match',
        'Minimum password length: 12',
        '`net accounts` is the fastest verification.'),
      task('t3',
        'Lock the screensaver. Navigate to User Configuration > Administrative Templates > Control Panel > Personalization. Enable: "Password protect the screen saver." Set "Screen saver timeout" to 600 seconds. gpupdate /force.',
        'output_match',
        'User Policy update has completed successfully',
        'Sign out and back in to apply user-side policy.'),
      task('t4',
        'Block USB removable storage. Navigate to Computer Configuration > Administrative Templates > System > Removable Storage Access. Enable: "All Removable Storage classes: Deny all access." gpupdate /force, then plug in a USB stick (real or virtual). Confirm Windows blocks access.',
        'screenshot',
        undefined,
        'Take a screenshot of the "Access denied" message when opening the USB drive.',
        false),
      task('t5',
        'Generate a Resultant Set of Policy report. Run: `gpresult /h gpresult.html` from PowerShell. Open the HTML report. Paste the section showing all three policies you applied (password complexity, screensaver, USB block).',
        'free_response',
        undefined,
        'gpresult /h produces a readable HTML report of all applied policies.',
        false),
      task('t6',
        'Document the rollback. Write the exact gpedit.msc paths and "set to Not Configured" steps to undo all three policies. (Rollback plan is mandatory in real change management.)',
        'free_response',
        undefined,
        'Each policy returns to default by setting it to "Not Configured" then gpupdate /force.',
        true),
    ],
    commonMistakes: [
      'Confusing Computer vs User configuration nodes — they apply to different scopes',
      'Forgetting that user-scope policies need sign-out / sign-in to apply',
      'Editing the registry instead of using gpedit, then losing the change on reboot',
      'Not documenting a rollback — every change in production must have one',
    ],
    troubleshooting: [
      { symptom: 'gpedit.msc not found', fix: 'You\'re on Windows Home — gpedit isn\'t included. Use the Eval Pro ISO for this lab.' },
      { symptom: 'Policies don\'t apply after gpupdate', fix: 'User-scope policies need sign-out. Computer-scope sometimes need restart. Re-run gpresult /r to confirm.' },
    ],
    sourceRefs: [
      'https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/',
    ],
  }),
];
