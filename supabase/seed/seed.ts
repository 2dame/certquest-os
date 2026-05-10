/**
 * Seeds Supabase from every cert pack in the unified registry.
 * Run after applying migrations 0001 and 0002.
 *
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { certPacks, certDisplayOrder } from '../../packages/content/src';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table: string, rows: any[], onConflict?: string) {
  if (!rows.length) return;
  const { error } = await sb.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
  if (error) {
    console.error(`Upsert failed for ${table}:`, error.message);
    throw error;
  }
  console.log(`  ${table}: ${rows.length} rows`);
}

async function seedCert(certId: string) {
  const pack = certPacks[certId];
  if (!pack) return;
  console.log(`\nSeeding ${certId}`);

  await upsert('certs', [{
    id: pack.meta.id, provider: pack.meta.provider,
    exam_name: pack.meta.examName, exam_code: pack.meta.examCode,
    exam_version: pack.meta.examVersion,
    official_source_url: pack.meta.officialSourceUrl,
    last_verified_date: pack.meta.lastVerifiedDate,
    theme_name: pack.meta.themeName, theme_blurb: pack.meta.themeBlurb,
    display_order: pack.meta.displayOrder,
  }]);

  await upsert('cert_exam_codes', pack.examCodes.map((e: any) => ({
    cert_id: pack.meta.id, exam_code: e.examCode, exam_name: e.examName,
    scaled_score_min: e.scaledScoreMin, scaled_score_max: e.scaledScoreMax,
    passing_scaled_score: e.passingScaledScore,
    question_count: e.questionCount, time_limit_minutes: e.timeLimitMinutes,
  })), 'cert_id,exam_code');

  await upsert('domains', pack.domains.map((d: any) => ({
    id: d.id, cert_id: d.certId, title: d.title, blurb: d.blurb,
    weight: d.weight, display_order: d.displayOrder,
  })));

  await upsert('objectives', pack.objectives.map((o: any) => ({
    id: o.id, cert_id: o.certId, domain_id: o.domainId, title: o.title,
    difficulty: o.difficulty, estimated_minutes: o.estimatedMinutes,
    prerequisites: o.prerequisites, concepts: o.concepts,
    mastery_min_quiz_score: o.masteryCriteria.minQuizScore,
    mastery_required_reviews: o.masteryCriteria.requiredReviews,
    mastery_required_boss_battles: o.masteryCriteria.requiredBossBattles,
    mastery_requires_self_explanation: o.masteryCriteria.requiresSelfExplanation,
    display_order: o.displayOrder,
  })));

  await upsert('lessons', pack.lessons.map((l: any) => ({
    id: l.id, cert_id: l.certId, objective_id: l.objectiveId,
    title: l.title, estimated_minutes: l.estimatedMinutes, display_order: 0,
  })));

  const blocks = pack.lessons.flatMap((l: any) =>
    l.blocks.map((b: any, i: number) => ({ lesson_id: l.id, kind: b.kind, body: b.body, display_order: i })));
  if (pack.lessons.length) {
    await sb.from('lesson_blocks').delete().in('lesson_id', pack.lessons.map((l: any) => l.id));
  }
  if (blocks.length) await sb.from('lesson_blocks').insert(blocks);

  await upsert('flashcards', pack.flashcards.map((f: any) => ({
    id: f.id, cert_id: f.certId, domain_id: f.domainId,
    objective_id: f.objectiveId, kind: f.kind, front: f.front, back: f.back,
    concept_tags: f.conceptTags ?? [],
  })));

  await upsert('question_bank_items', pack.questionBank.map((q: any) => ({
    id: q.id, cert_id: q.certId, exam_code: q.examCode,
    domain_id: q.domainId, objective_id: q.objectiveId,
    type: q.type, difficulty: q.difficulty,
    question_text: q.questionText, choices: q.choices,
    correct_answers: q.correctAnswers, explanation: q.explanation,
    wrong_answer_explanations: q.wrongAnswerExplanations,
    exam_trap: q.examTrap, hint: q.hint, tags: q.tags,
    time_estimate_seconds: q.timeEstimateSeconds,
    readiness_weight: q.readinessWeight,
    source_type: q.sourceType ?? 'original',
    is_practice_exam_eligible: q.isPracticeExamEligible !== false,
    is_pbq_style: q.isPbqStyle ?? false,
  })));

  await upsert('side_quests', pack.sideQuests.map((s: any) => ({
    id: s.id, cert_id: s.certId, objective_id: s.objectiveId,
    template: s.template, title: s.title, story: s.story, payload: s.payload,
  })));

  await upsert('boss_battles', pack.bossBattles.map((b: any) => ({
    id: b.id, cert_id: b.certId, objective_ids: b.objectiveIds,
    title: b.title, story_setup: b.storySetup, scenario: b.scenario,
    constraints: b.constraints, rubric: b.rubric, remediation: b.remediation,
  })));

  await upsert('practice_exam_blueprints', pack.practiceExams.map((e: any) => ({
    id: e.id, cert_id: e.certId, exam_code: e.examCode,
    title: e.title, mode: e.mode, question_count: e.questionCount,
    time_limit_seconds: e.timeLimitSeconds,
    passing_scaled_score: e.passingScaledScore,
    scaled_score_max: e.scaledScoreMax, scaled_score_min: e.scaledScoreMin,
    domain_targets: e.domainTargets, difficulty_mix: e.difficultyMix,
    unlock_requirements: e.unlockRequirements,
    allow_manual_override: e.allowManualOverride,
    display_order: 0,
  })));

  await upsert('glossary_terms',
    pack.glossary.map((g: any) => ({ cert_id: pack.meta.id, term: g.term, definition: g.definition })),
    'cert_id,term');

  await upsert('acronyms',
    pack.acronyms.map((a: any) => ({ cert_id: pack.meta.id, acronym: a.acronym, expansion: a.expansion, meaning: a.meaning })),
    'cert_id,acronym');
}

async function run() {
  console.log('CertQuest OS - seeding all cert packs');
  for (const certId of certDisplayOrder) await seedCert(certId);
  console.log('\nSeed complete.');
}

run().catch((e) => { console.error(e); process.exit(1); });
