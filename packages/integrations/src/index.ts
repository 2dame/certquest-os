/**
 * Integrations layer. Safe stubs for NotebookLM, Anki, Google Drive, Notion,
 * AI tutor handoff. None require API keys. All return Markdown or
 * "not implemented yet" cleanly so they never break runtime.
 */

export type ExportFormat = 'markdown' | 'json' | 'apkg' | 'plaintext';

export type ExportTarget =
  | 'notebooklm'
  | 'anki'
  | 'google-drive'
  | 'notion'
  | 'claude'
  | 'chatgpt'
  | 'perplexity'
  | 'clipboard'
  | 'file';

export interface StudyArtifact {
  kind: 'weak-area-report' | 'practice-exam-report' | 'lesson-pack' | 'flashcard-deck' | 'objective-summary';
  title: string;
  certId: string;
  generatedAt: string;
  content: string; // markdown by default
  metadata?: Record<string, unknown>;
}

export interface IntegrationAdapter {
  target: ExportTarget;
  name: string;
  isAvailable: boolean;
  supportedFormats: ExportFormat[];
  export: (artifact: StudyArtifact) => Promise<IntegrationResult>;
}

export interface IntegrationResult {
  ok: boolean;
  message: string;
  url?: string;
  payload?: string;
}

// ---------------------------------------------------------------------------
// Artifact builders — turn structured app data into shareable Markdown
// ---------------------------------------------------------------------------

export interface WeakAreaReport {
  certId: string;
  certName: string;
  overallReadiness: number;
  weakDomains: Array<{ name: string; score: number; missedConcepts: string[] }>;
  remediationActions: string[];
}

export function exportWeakAreaReport(r: WeakAreaReport): StudyArtifact {
  const lines: string[] = [];
  lines.push(`# Weak Area Report — ${r.certName}`);
  lines.push('');
  lines.push(`**Overall Readiness:** ${r.overallReadiness}%`);
  lines.push('');
  lines.push('## Weak Domains');
  lines.push('');
  for (const d of r.weakDomains) {
    lines.push(`### ${d.name} (${d.score}%)`);
    if (d.missedConcepts.length) {
      lines.push('Missed concepts:');
      for (const c of d.missedConcepts) lines.push(`- ${c}`);
    }
    lines.push('');
  }
  if (r.remediationActions.length) {
    lines.push('## Recommended Actions');
    lines.push('');
    for (const a of r.remediationActions) lines.push(`- ${a}`);
  }
  return {
    kind: 'weak-area-report',
    title: `Weak Area Report — ${r.certName}`,
    certId: r.certId,
    generatedAt: new Date().toISOString(),
    content: lines.join('\n'),
  };
}

export interface PracticeExamReportInput {
  certId: string;
  certName: string;
  blueprintTitle: string;
  scaledScore: number;
  scaledMax: number;
  passingScore: number;
  rawCorrect: number;
  rawTotal: number;
  passEstimate: boolean;
  domainBreakdown: Array<{ name: string; correct: number; total: number; percent: number }>;
  missedQuestions: Array<{ question: string; explanation: string }>;
}

export function exportPracticeExamReport(r: PracticeExamReportInput): StudyArtifact {
  const lines: string[] = [];
  lines.push(`# Practice Exam Report — ${r.blueprintTitle}`);
  lines.push('');
  lines.push(`**Score:** ${r.scaledScore} / ${r.scaledMax} (pass ${r.passingScore})`);
  lines.push(`**Result:** ${r.passEstimate ? 'PASS ESTIMATE' : 'NOT YET'}`);
  lines.push(`**Raw:** ${r.rawCorrect} / ${r.rawTotal}`);
  lines.push('');
  lines.push('## Domain Breakdown');
  lines.push('');
  for (const d of r.domainBreakdown) {
    lines.push(`- **${d.name}**: ${d.correct}/${d.total} (${d.percent}%)`);
  }
  lines.push('');
  if (r.missedQuestions.length) {
    lines.push('## Missed Questions');
    lines.push('');
    for (const q of r.missedQuestions) {
      lines.push(`### ${q.question}`);
      lines.push('');
      lines.push(q.explanation);
      lines.push('');
    }
  }
  return {
    kind: 'practice-exam-report',
    title: `Practice Exam Report — ${r.blueprintTitle}`,
    certId: r.certId,
    generatedAt: new Date().toISOString(),
    content: lines.join('\n'),
  };
}

export interface LessonPackInput {
  certId: string;
  certName: string;
  lessons: Array<{ title: string; objective: string; body: string }>;
}

export function exportLessonPack(r: LessonPackInput): StudyArtifact {
  const lines: string[] = [];
  lines.push(`# Lesson Pack — ${r.certName}`);
  lines.push('');
  for (const l of r.lessons) {
    lines.push(`## ${l.title}`);
    lines.push('');
    lines.push(`**Objective:** ${l.objective}`);
    lines.push('');
    lines.push(l.body);
    lines.push('');
  }
  return {
    kind: 'lesson-pack',
    title: `Lesson Pack — ${r.certName}`,
    certId: r.certId,
    generatedAt: new Date().toISOString(),
    content: lines.join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Adapters — safe stubs that never throw at runtime
// ---------------------------------------------------------------------------

export const notebooklmAdapter: IntegrationAdapter = {
  target: 'notebooklm',
  name: 'NotebookLM',
  isAvailable: true, // works via Drive handoff today
  supportedFormats: ['markdown'],
  async export(artifact) {
    // The current path: write Markdown to Drive, then user opens NotebookLM
    // and adds the file as a source. Full automation pending public API.
    return {
      ok: true,
      message: 'NotebookLM does not have a public API yet. Save this Markdown to Google Drive, then add it as a source in NotebookLM.',
      payload: artifact.content,
    };
  },
};

export const ankiAdapter: IntegrationAdapter = {
  target: 'anki',
  name: 'Anki',
  isAvailable: false, // .apkg writer not built yet
  supportedFormats: ['apkg', 'plaintext'],
  async export(artifact) {
    return {
      ok: false,
      message: 'Anki .apkg export not implemented yet. Plaintext fallback available.',
      payload: artifact.content,
    };
  },
};

export const googleDriveAdapter: IntegrationAdapter = {
  target: 'google-drive',
  name: 'Google Drive',
  isAvailable: false, // requires OAuth flow not yet wired
  supportedFormats: ['markdown'],
  async export(artifact) {
    return {
      ok: false,
      message: 'Google Drive export requires OAuth setup. Copy the Markdown manually for now.',
      payload: artifact.content,
    };
  },
};

export const notionAdapter: IntegrationAdapter = {
  target: 'notion',
  name: 'Notion',
  isAvailable: false,
  supportedFormats: ['markdown'],
  async export(artifact) {
    return {
      ok: false,
      message: 'Notion export requires integration token. Copy the Markdown manually for now.',
      payload: artifact.content,
    };
  },
};

export const claudeTutorAdapter: IntegrationAdapter = {
  target: 'claude',
  name: 'Claude Tutor',
  isAvailable: true,
  supportedFormats: ['markdown', 'plaintext'],
  async export(artifact) {
    return {
      ok: true,
      message: 'Open Claude.ai with this context preloaded.',
      url: 'https://claude.ai/new',
      payload: buildTutorPrompt(artifact),
    };
  },
};

export const chatgptTutorAdapter: IntegrationAdapter = {
  target: 'chatgpt',
  name: 'ChatGPT Tutor',
  isAvailable: true,
  supportedFormats: ['markdown', 'plaintext'],
  async export(artifact) {
    return {
      ok: true,
      message: 'Open ChatGPT with this context preloaded.',
      url: 'https://chat.openai.com',
      payload: buildTutorPrompt(artifact),
    };
  },
};

function buildTutorPrompt(artifact: StudyArtifact): string {
  return [
    `I'm studying for a certification and need help with the following.`,
    ``,
    `Cert: ${artifact.certId}`,
    `Topic: ${artifact.title}`,
    ``,
    `---`,
    artifact.content,
    `---`,
    ``,
    `Please help me understand the concepts I'm weak on. Ask me questions to check my understanding.`,
  ].join('\n');
}

export const adapters: Record<ExportTarget, IntegrationAdapter> = {
  notebooklm: notebooklmAdapter,
  anki: ankiAdapter,
  'google-drive': googleDriveAdapter,
  notion: notionAdapter,
  claude: claudeTutorAdapter,
  chatgpt: chatgptTutorAdapter,
  perplexity: { target: 'perplexity', name: 'Perplexity', isAvailable: false, supportedFormats: ['plaintext'], async export() { return { ok: false, message: 'Perplexity handoff not yet implemented.' }; } },
  clipboard: { target: 'clipboard', name: 'Clipboard', isAvailable: true, supportedFormats: ['markdown', 'plaintext'], async export(a) { return { ok: true, message: 'Ready to copy.', payload: a.content }; } },
  file: { target: 'file', name: 'Save File', isAvailable: true, supportedFormats: ['markdown', 'json'], async export(a) { return { ok: true, message: 'Markdown ready to save.', payload: a.content }; } },
};

export function getAdapter(target: ExportTarget): IntegrationAdapter {
  return adapters[target];
}

export function listAvailableAdapters(): IntegrationAdapter[] {
  return Object.values(adapters).filter((a) => a.isAvailable);
}
