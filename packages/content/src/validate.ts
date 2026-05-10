/**
 * Content validator. Errors block the build; warnings flag content gaps.
 *
 * Run with: pnpm validate
 */

import { certPacks, certDisplayOrder, getCertLore } from './index';
import { getRichFlashcardsForCert } from './rich-flashcards';
import { getProofLabsForCert } from './proof-labs';
import { BADGES } from '@certquest/gamification';

interface Issue {
  certId: string;
  severity: 'error' | 'warning';
  message: string;
}

const VALID_CERT_IDS = new Set([
  'a-plus-core1', 'a-plus-core2', 'network-plus', 'aws-ccp', 'aws-saa', 'ccna',
]);

const STALE_CERT_IDS = new Set(['a-plus', 'aws-cloud-practitioner', 'aws-solutions-architect']);

const VALID_MINIGAME_TEMPLATES = new Set([
  'cable_crafter', 'port_lockpick', 'osi_tower', 'subnet_sprint',
  'packet_detective', 'cloud_architect', 'cli_dojo', 'service_sorter',
  'troubleshooting_sequence', 'acronym_blitz',
]);

// QA statuses agents may set. 'human_reviewed' and 'self_verified' are
// human-only and should never appear from agent-authored content unless
// a human has reviewed it. The validator flags anything above
// 'multi_ai_checked' as a warning so reviewers can confirm.
const AGENT_ALLOWED_QA = new Set([
  'unreviewed', 'structural_pass', 'ai_reviewed', 'source_checked',
  'multi_ai_checked', 'needs_fix',
]);
const HUMAN_ONLY_QA = new Set(['human_reviewed', 'self_verified']);

export function validateAllContent(): { errors: Issue[]; warnings: Issue[] } {
  const issues: Issue[] = [];

  for (const certId of certDisplayOrder) {
    const pack = certPacks[certId];
    if (!pack) {
      issues.push({ certId, severity: 'error', message: 'Cert ID in display order but not in registry.' });
      continue;
    }

    if (STALE_CERT_IDS.has(certId)) {
      issues.push({ certId, severity: 'error', message: `Stale cert ID "${certId}" — must use new naming.` });
    }
    if (!VALID_CERT_IDS.has(certId)) {
      issues.push({ certId, severity: 'error', message: `Cert ID "${certId}" is not in the canonical list.` });
    }

    // Required sections
    const required = ['meta', 'domains', 'objectives', 'lessons', 'flashcards', 'questionBank', 'sideQuests', 'bossBattles', 'practiceExams'] as const;
    for (const key of required) {
      if (!(key in pack) || (pack as any)[key] === undefined) {
        issues.push({ certId, severity: 'error', message: `Missing required section: ${key}` });
      }
    }
    if (!pack.meta) continue;

    // Meta
    if (pack.meta.id !== certId) issues.push({ certId, severity: 'error', message: `meta.id (${pack.meta.id}) does not match registry key.` });
    if (pack.meta.examVersion === 'verify-before-publish') {
      issues.push({ certId, severity: 'warning', message: 'examVersion is placeholder. Verify against official objectives before publish.' });
    }

    // Lore
    const lore = getCertLore(certId);
    if (!lore) {
      issues.push({ certId, severity: 'error', message: 'Missing lore pack.' });
    } else {
      const domainIds = new Set(pack.domains.map((d: any) => d.id));
      for (const region of lore.regions) {
        if (!domainIds.has(region.domainId)) {
          issues.push({ certId, severity: 'error', message: `Lore region "${region.regionName}" maps to unknown domain "${region.domainId}".` });
        }
      }
      // Warn if any domain has no region (lore coverage)
      const regionDomains = new Set(lore.regions.map((r) => r.domainId));
      for (const d of pack.domains) {
        if (!regionDomains.has((d as any).id)) {
          issues.push({ certId, severity: 'warning', message: `Domain "${(d as any).id}" has no lore region.` });
        }
      }
    }

    // Domain weights
    const weightSum = pack.domains.reduce((s: number, d: any) => s + d.weight, 0);
    if (Math.abs(weightSum - 1.0) > 0.05) {
      issues.push({ certId, severity: 'warning', message: `Domain weights sum to ${weightSum.toFixed(2)} (expected ~1.0).` });
    }

    // Cross-references
    const domainIds = new Set(pack.domains.map((d: any) => d.id));
    const objectiveIds = new Set(pack.objectives.map((o: any) => o.id));

    for (const o of pack.objectives) {
      if (!domainIds.has((o as any).domainId)) issues.push({ certId, severity: 'error', message: `Objective ${(o as any).id} references unknown domain.` });
    }
    for (const l of pack.lessons) {
      if (!objectiveIds.has((l as any).objectiveId)) issues.push({ certId, severity: 'error', message: `Lesson ${(l as any).id} references unknown objective.` });
    }
    for (const f of pack.flashcards) {
      if (!objectiveIds.has((f as any).objectiveId)) issues.push({ certId, severity: 'error', message: `Flashcard ${(f as any).id} references unknown objective.` });
      if (!domainIds.has((f as any).domainId)) issues.push({ certId, severity: 'error', message: `Flashcard ${(f as any).id} references unknown domain.` });
    }

    const qIds = new Set<string>();
    for (const q of pack.questionBank) {
      const qq = q as any;
      if (qIds.has(qq.id)) issues.push({ certId, severity: 'error', message: `Duplicate question ID: ${qq.id}` });
      qIds.add(qq.id);
      if (!objectiveIds.has(qq.objectiveId)) issues.push({ certId, severity: 'error', message: `Question ${qq.id} references unknown objective.` });
      if (!domainIds.has(qq.domainId)) issues.push({ certId, severity: 'error', message: `Question ${qq.id} references unknown domain.` });
      if (!qq.correctAnswers || qq.correctAnswers.length === 0) issues.push({ certId, severity: 'error', message: `Question ${qq.id} has no correct answers.` });
    }

    // Side quests — validate mini-game template + payload shape
    for (const s of pack.sideQuests) {
      const sq = s as any;
      if (!VALID_MINIGAME_TEMPLATES.has(sq.template)) {
        issues.push({ certId, severity: 'error', message: `Side quest ${sq.id} uses invalid mini-game template "${sq.template}".` });
      }
      if (!sq.payload?.items || sq.payload.items.length === 0) {
        issues.push({ certId, severity: 'error', message: `Side quest ${sq.id} has no payload items.` });
      }
      if (sq.objectiveId && !objectiveIds.has(sq.objectiveId)) {
        issues.push({ certId, severity: 'error', message: `Side quest ${sq.id} references unknown objective.` });
      }
    }

    // Boss battles
    for (const b of pack.bossBattles) {
      const bb = b as any;
      for (const oid of bb.objectiveIds || []) {
        if (!objectiveIds.has(oid)) issues.push({ certId, severity: 'error', message: `Boss battle ${bb.id} references unknown objective ${oid}.` });
      }
    }

    // Practice exam blueprints
    for (const e of pack.practiceExams) {
      const ee = e as any;
      const totalDomainQ = ee.domainTargets.reduce((s: number, t: any) => s + t.questionCount, 0);
      if (totalDomainQ > ee.questionCount) {
        issues.push({ certId, severity: 'error', message: `Exam ${ee.id}: domain targets sum ${totalDomainQ} but questionCount is ${ee.questionCount}.` });
      }
      for (const t of ee.domainTargets) {
        if (!domainIds.has(t.domainId)) issues.push({ certId, severity: 'error', message: `Exam ${ee.id} targets unknown domain ${t.domainId}.` });
      }
      for (const t of ee.domainTargets) {
        const available = pack.questionBank.filter((q: any) => q.domainId === t.domainId && q.isPracticeExamEligible !== false).length;
        if (available < t.questionCount) {
          issues.push({ certId, severity: 'warning', message: `Exam ${ee.id} wants ${t.questionCount} questions from domain ${t.domainId} but only ${available} available. Authoring gap.` });
        }
      }
    }

    // Spec minimums (warnings)
    if (pack.lessons.length < 3) issues.push({ certId, severity: 'warning', message: `Has ${pack.lessons.length} lessons (minimum 3).` });
    if (pack.flashcards.length < 20) issues.push({ certId, severity: 'warning', message: `Has ${pack.flashcards.length} flashcards (minimum 20).` });
    if (pack.questionBank.length < 15) issues.push({ certId, severity: 'warning', message: `Has ${pack.questionBank.length} questions (minimum 15).` });
    if (pack.sideQuests.length < 1) issues.push({ certId, severity: 'error', message: 'Needs at least 1 side quest.' });
    if (pack.bossBattles.length < 1) issues.push({ certId, severity: 'error', message: 'Needs at least 1 boss battle.' });
    if (pack.practiceExams.length < 1) issues.push({ certId, severity: 'error', message: 'Needs at least 1 practice exam blueprint.' });

    // ===== Rich flashcards (9-field) =====
    const richCards = getRichFlashcardsForCert(certId);
    if (richCards.length < 10) {
      issues.push({ certId, severity: 'warning', message: `Has ${richCards.length} rich flashcards (target 10).` });
    }
    const richIds = new Set<string>();
    for (const rc of richCards) {
      if (richIds.has(rc.id)) issues.push({ certId, severity: 'error', message: `Duplicate rich-flashcard ID: ${rc.id}` });
      richIds.add(rc.id);
      if (!objectiveIds.has(rc.objectiveId)) issues.push({ certId, severity: 'error', message: `Rich flashcard ${rc.id} references unknown objective ${rc.objectiveId}.` });
      if (!domainIds.has(rc.domainId)) issues.push({ certId, severity: 'error', message: `Rich flashcard ${rc.id} references unknown domain ${rc.domainId}.` });
      if (HUMAN_ONLY_QA.has(rc.qaStatus)) issues.push({ certId, severity: 'warning', message: `Rich flashcard ${rc.id} has human-only qaStatus '${rc.qaStatus}' — confirm a human reviewed it.` });
      if (!AGENT_ALLOWED_QA.has(rc.qaStatus) && !HUMAN_ONLY_QA.has(rc.qaStatus)) {
        issues.push({ certId, severity: 'error', message: `Rich flashcard ${rc.id} has invalid qaStatus '${rc.qaStatus}'.` });
      }
      // 9-field minimum-length sanity (catches scaffolds that slipped through)
      if (rc.whyItMatters.length < 30) issues.push({ certId, severity: 'warning', message: `Rich flashcard ${rc.id}: whyItMatters too short.` });
      if (rc.memoryHook.length < 30) issues.push({ certId, severity: 'warning', message: `Rich flashcard ${rc.id}: memoryHook too short.` });
      if (rc.examAngle.length < 30) issues.push({ certId, severity: 'warning', message: `Rich flashcard ${rc.id}: examAngle too short.` });
    }

    // ===== Proof-based labs =====
    const labs = getProofLabsForCert(certId);
    if (labs.length < 2) {
      issues.push({ certId, severity: 'warning', message: `Has ${labs.length} proof labs (target 2).` });
    }
    const labIds = new Set<string>();
    for (const lab of labs) {
      if (labIds.has(lab.id)) issues.push({ certId, severity: 'error', message: `Duplicate proof-lab ID: ${lab.id}` });
      labIds.add(lab.id);
      if (!objectiveIds.has(lab.objectiveId)) issues.push({ certId, severity: 'error', message: `Proof lab ${lab.id} references unknown objective ${lab.objectiveId}.` });
      if (!domainIds.has(lab.domainId)) issues.push({ certId, severity: 'error', message: `Proof lab ${lab.id} references unknown domain ${lab.domainId}.` });
      if (lab.tasks.length < 3) issues.push({ certId, severity: 'error', message: `Proof lab ${lab.id} has fewer than 3 tasks.` });
      if (lab.learningObjectives.length < 3) issues.push({ certId, severity: 'warning', message: `Proof lab ${lab.id} has fewer than 3 learning objectives.` });
      if (HUMAN_ONLY_QA.has(lab.qaStatus)) issues.push({ certId, severity: 'warning', message: `Proof lab ${lab.id} has human-only qaStatus '${lab.qaStatus}' — confirm a human reviewed it.` });
    }
  }

  // ===== Badge certId cross-check =====
  for (const badge of BADGES) {
    if (badge.criteria.kind === 'cert_completed' || badge.criteria.kind === 'objective_mastered') {
      const certId = badge.criteria.certId;
      if (certId && !VALID_CERT_IDS.has(certId)) {
        issues.push({
          certId: certId,
          severity: 'error',
          message: `Badge "${badge.id}" references certId "${certId}" which is not in the canonical cert ID list.`,
        });
      }
    }
  }

  return {
    errors: issues.filter((i) => i.severity === 'error'),
    warnings: issues.filter((i) => i.severity === 'warning'),
  };
}

// Run when invoked directly
if (require.main === module) {
  const { errors, warnings } = validateAllContent();
  console.log('\n=== CertQuest OS — Content Validation ===\n');
  for (const e of [...errors, ...warnings]) {
    const tag = e.severity === 'error' ? '✗ ERROR' : '⚠ WARN ';
    console.log(`${tag} [${e.certId}] ${e.message}`);
  }

  // Rich-content audit summary
  let totalRich = 0, totalRichScaffold = 0, totalLabs = 0, totalLabsScaffold = 0;
  for (const certId of certDisplayOrder) {
    const rc = getRichFlashcardsForCert(certId);
    const lb = getProofLabsForCert(certId);
    totalRich += rc.length;
    totalRichScaffold += rc.filter((c) => c.isScaffold).length;
    totalLabs += lb.length;
    totalLabsScaffold += lb.filter((l) => l.isScaffold).length;
  }
  console.log(`\nRich content summary:`);
  console.log(`  Rich flashcards authored: ${totalRich - totalRichScaffold}, scaffold: ${totalRichScaffold}`);
  console.log(`  Proof labs authored: ${totalLabs - totalLabsScaffold}, scaffold: ${totalLabsScaffold}`);

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${certDisplayOrder.length} cert(s).\n`);
  if (errors.length > 0) process.exit(1);
}
