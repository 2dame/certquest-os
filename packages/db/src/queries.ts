import type { SupabaseClient } from '@supabase/supabase-js';
import type { CertId, ReviewRating, SrsState } from '@certquest/types';

export const queries = {
  // ---------- profile ----------
  async getMyProfile(sb: SupabaseClient) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await sb.from('profiles').select('*').eq('id', u.user.id).single();
    if (error) throw error;
    return data;
  },

  async getMySettings(sb: SupabaseClient) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await sb.from('user_settings').select('*').eq('user_id', u.user.id).single();
    if (error) throw error;
    return data;
  },

  async setActiveCert(sb: SupabaseClient, certId: CertId) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    return sb.from('user_settings').update({ active_cert_id: certId }).eq('user_id', u.user.id);
  },

  // ---------- enrollments ----------
  async listEnrollments(sb: SupabaseClient) {
    return sb.from('user_cert_enrollments').select('*, cert:certs(*)').eq('is_active', true);
  },

  async enroll(sb: SupabaseClient, certId: CertId) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    return sb
      .from('user_cert_enrollments')
      .upsert({ user_id: u.user.id, cert_id: certId, is_active: true })
      .select()
      .single();
  },

  // ---------- certs / domains / objectives ----------
  async listCerts(sb: SupabaseClient) {
    return sb.from('certs').select('*').order('display_order');
  },

  async getCertWorld(sb: SupabaseClient, certId: CertId) {
    const [cert, domains, objectives] = await Promise.all([
      sb.from('certs').select('*').eq('id', certId).single(),
      sb.from('domains').select('*').eq('cert_id', certId).order('display_order'),
      sb.from('objectives').select('*').eq('cert_id', certId).order('display_order'),
    ]);
    return { cert: cert.data, domains: domains.data ?? [], objectives: objectives.data ?? [] };
  },

  // ---------- lessons ----------
  async getLesson(sb: SupabaseClient, lessonId: string) {
    const [lesson, blocks] = await Promise.all([
      sb.from('lessons').select('*').eq('id', lessonId).single(),
      sb.from('lesson_blocks').select('*').eq('lesson_id', lessonId).order('display_order'),
    ]);
    return { lesson: lesson.data, blocks: blocks.data ?? [] };
  },

  async markLessonComplete(sb: SupabaseClient, lessonId: string, quickCheckPassed: boolean) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    return sb.from('user_lesson_progress').upsert({
      user_id: u.user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      quick_check_passed: quickCheckPassed,
    });
  },

  // ---------- flashcards / SRS ----------
  async getDueFlashcards(sb: SupabaseClient, certId: CertId, limit = 40) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    // Two-step: get due IDs, then fetch the cards. Keeps the query simple.
    const { data: states, error } = await sb
      .from('flashcard_srs_state')
      .select('flashcard_id, due_at')
      .eq('user_id', u.user.id)
      .lte('due_at', new Date().toISOString())
      .order('due_at')
      .limit(limit);
    if (error) throw error;
    const ids = (states ?? []).map((s) => s.flashcard_id);
    if (!ids.length) {
      // First pass: pull cards with no SRS state yet for this cert.
      const { data: cards } = await sb
        .from('flashcards')
        .select('*')
        .eq('cert_id', certId)
        .limit(limit);
      return cards ?? [];
    }
    const { data: cards } = await sb.from('flashcards').select('*').in('id', ids);
    return cards ?? [];
  },

  async submitFlashcardReview(
    sb: SupabaseClient,
    flashcardId: string,
    rating: ReviewRating,
    next: SrsState,
  ) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    await sb.from('flashcard_reviews').insert({
      user_id: u.user.id,
      flashcard_id: flashcardId,
      rating,
      ease_factor: next.easeFactor,
      interval_days: next.intervalDays,
      due_at: next.dueAt,
    });
    return sb.from('flashcard_srs_state').upsert({
      user_id: u.user.id,
      flashcard_id: flashcardId,
      ease_factor: next.easeFactor,
      interval_days: next.intervalDays,
      due_at: next.dueAt,
      review_count: next.reviewCount,
      last_reviewed_at: next.lastReviewedAt,
    });
  },

  // ---------- quiz ----------
  async getQuiz(sb: SupabaseClient, quizId: string) {
    const [quiz, questions] = await Promise.all([
      sb.from('quizzes').select('*').eq('id', quizId).single(),
      sb.from('quiz_questions').select('*').eq('quiz_id', quizId),
    ]);
    return { quiz: quiz.data, questions: questions.data ?? [] };
  },

  // ---------- progress ----------
  async getObjectiveProgress(sb: SupabaseClient, certId: CertId) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    return sb
      .from('user_objective_progress')
      .select('*')
      .eq('user_id', u.user.id)
      .eq('cert_id', certId);
  },

  // ---------- xp ----------
  async addXpEvent(sb: SupabaseClient, kind: string, amount: number, certId?: CertId, sourceId?: string) {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) throw new Error('not authenticated');
    return sb.from('xp_events').insert({
      user_id: u.user.id,
      kind,
      amount,
      cert_id: certId,
      source_id: sourceId,
    });
  },
};
