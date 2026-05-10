/** Pure helpers for exam date countdown + intensity recommendation. */
export interface ExamCountdown {
  certId: string;
  examDate: string; // YYYY-MM-DD
  daysUntil: number;
  isPast: boolean;
  /** Recommended intensity given days remaining. */
  recommendedIntensity: 'chill' | 'normal' | 'aggressive';
  /** Brief urgency tag for UI labels. */
  urgency: 'distant' | 'approaching' | 'imminent' | 'past';
}

export function getExamCountdown(certId: string, examDate: string | undefined, today: Date = new Date()): ExamCountdown | null {
  if (!examDate) return null;
  const target = new Date(examDate + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = target.getTime() - todayMid.getTime();
  const daysUntil = Math.round(diffMs / 86400000);
  const isPast = daysUntil < 0;

  let recommendedIntensity: ExamCountdown['recommendedIntensity'];
  let urgency: ExamCountdown['urgency'];
  if (isPast) { recommendedIntensity = 'normal'; urgency = 'past'; }
  else if (daysUntil <= 14) { recommendedIntensity = 'aggressive'; urgency = 'imminent'; }
  else if (daysUntil <= 30) { recommendedIntensity = 'aggressive'; urgency = 'approaching'; }
  else { recommendedIntensity = 'normal'; urgency = 'distant'; }

  return { certId, examDate, daysUntil, isPast, recommendedIntensity, urgency };
}

export function formatCountdown(c: ExamCountdown): string {
  if (c.isPast) return `Exam date passed ${Math.abs(c.daysUntil)}d ago`;
  if (c.daysUntil === 0) return 'Exam is today';
  if (c.daysUntil === 1) return '1 day until your exam';
  return `${c.daysUntil} days until your exam`;
}
