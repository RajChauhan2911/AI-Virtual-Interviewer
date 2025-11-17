/*
  Resume Analyzer Module

  Exports:
  - parseFileToText(file: File): Promise<string>
  - analyzeResume(text: string): AnalysisResult
  - generatePDFReport(feedback: AnalysisResult, userMeta?: UserMeta): Promise<Uint8Array>
  - getAnalysisDiagnostics(): AnalyzerDiagnostics

  Stability & Resilience:
  - Extensive try/catch with tagged logs [ResumeAnalyzer][STAGE]
  - Deterministic scoring: no randomness used
  - Input normalization: whitespace, hyphens, unicode
  - Fallback parsing strategies for PDF and DOCX/TXT
  - Optional diagnostics upload behind DEV_MODE

  Failure-mode Handling Checklist (debug runbook also in README section below):
  - Identical scores: Check normalization and weights, log matchedRules
  - No PDF text: Worker config and fallback extraction using raw items
  - PDF generation fails: Fonts/Blob support; use simpler rendering
  - Firestore upload fails: Validate rules, security, and env vars
*/

// TypeScript-style JSDoc types for strong editor support
/**
 * @typedef {Object} MatchedRuleStats
 * @property {number} sectionMatched - number of keywords matched in section
 * @property {number} totalKeywords - total keywords considered
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {number} score
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {string[]} recommendations
 * @property {Record<string, { sectionMatched: number; totalKeywords: number; matchedKeywords: string[] }>} matchedRules
 */

/**
 * @typedef {Object} UserMeta
 * @property {string=} name
 * @property {string=} uid
 * @property {string=} filename
 */

/**
 * @typedef {Object} AnalyzerDiagnostics
 * @property {string} rawParsedText
 * @property {{ parseMs: number; analyzeMs: number; pdfMs?: number }} durations
 * @property {AnalysisResult['matchedRules']} matchedKeywords
 * @property {string|null} error
 * @property {{ start: number; parsedAt?: number; analyzedAt?: number; pdfAt?: number }} timestamps
 */

// External deps are expected to be installed by the host app.
// We import in a try/catch to avoid hard crashes if a consumer hasn't installed them yet.
let pdfjs: any = null;
let GlobalWorkerOptions: any = null;
let mammoth: any = null;
let jsPDF: any = null;

// Optional Firestore for diagnostics upload
let db: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('../lib/firebase');
  db = mod.db;
} catch (e) {
  /* optional */
}

// Dev mode gate for optional diagnostics upload
const DEV_MODE: boolean = (import.meta as any)?.env?.VITE_ANALYZER_DEV_MODE === 'true';

// Diagnostics state (local-first)
const diagnostics: AnalyzerDiagnostics = {
  rawParsedText: '',
  durations: { parseMs: 0, analyzeMs: 0, pdfMs: undefined },
  matchedKeywords: {},
  error: null,
  timestamps: { start: 0 },
};

// Logging helper
function log(stage: string, message: string, meta?: unknown) {
  // eslint-disable-next-line no-console
  console.log(`[ResumeAnalyzer][${stage}] ${message}`, meta ?? '');
}

// Utility: normalize text for analysis
function normalizeText(input: string): string {
  let text = input || '';
  // Normalize unicode to NFC
  try { text = text.normalize('NFC'); } catch { /* older browsers */ }
  // Replace various hyphens/dashes with simple hyphen
  text = text.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Utility: lowercase for matching, but keep original for output
function canonical(text: string): string {
  return text.toLowerCase();
}

// Utility: safe substring preview for diagnostics
function safePreview(text: string, max = 2000): string {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max) + `\n... [truncated ${text.length - max} chars]`;
}

// Heuristics and weights
const SECTION_HEADERS = [
  'experience', 'work experience', 'professional experience', 'projects', 'education', 'skills', 'summary', 'certifications', 'achievements'
];

const KEYWORDS = {
  skills: [
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
    'sql', 'nosql', 'postgres', 'mongodb', 'redis', 'graphql', 'rest', 'ci/cd', 'jest', 'cypress', 'vite'
  ],
  achievements: [
    'increased', 'reduced', 'improved', 'optimized', '%', 'growth', 'revenue', 'latency', 'throughput', 'conversion', 'retention'
  ],
  signalsNegativeGeneric: [
    'hardworking', 'dedicated', 'team player', 'fast learner'
  ],
  education: [
    'bachelor', 'master', 'bsc', 'msc', 'phd', 'computer science', 'engineering', 'cgpa', 'gpa'
  ]
} as const;

const BASE_WEIGHTS = {
  skills: 30,
  experience: 30,
  achievements: 20,
  education: 10,
  formatting: 10,
} as const;

// Analyze function with deterministic scoring
/**
 * @param {string} text
 * @returns {AnalysisResult}
 */
export function analyzeResume(text: string): AnalysisResult {
  const analyzeStart = performance.now();
  diagnostics.error = null;
  diagnostics.timestamps.analyzedAt = analyzeStart;

  const normalized = normalizeText(text);
  const lc = canonical(normalized);

  // Simple section detection by headers
  const lines = normalized.split(/\n|\r|\./).map(s => s.trim()).filter(Boolean);
  const sections: Record<string, string> = {};
  let current = 'general';
  sections[current] = '';
  for (const line of lines) {
    const lcl = line.toLowerCase();
    const header = SECTION_HEADERS.find(h => new RegExp(`(^|\b)${escapeRegExp(h)}(\b|:)$`).test(lcl));
    if (header) {
      current = header;
      if (!sections[current]) sections[current] = '';
    } else {
      sections[current] = (sections[current] || '') + ' ' + line;
    }
  }

  // Count keyword matches and frequencies per section
  const matchedRules: AnalysisResult['matchedRules'] = {};
  for (const [key, words] of Object.entries(KEYWORDS)) {
    const bucketText = canonical(sections['skills'] || '') + ' ' + canonical(sections['experience'] || '') + ' ' + canonical(sections['projects'] || '') + ' ' + lc;
    const matched: string[] = [];
    let count = 0;
    for (const w of words) {
      const occurrences = (bucketText.match(new RegExp(`\\b${escapeRegExp(w)}\\b`, 'g')) || []).length;
      if (occurrences > 0) {
        count += Math.min(occurrences, 5);
        matched.push(`${w}x${occurrences}`);
      }
    }
    matchedRules[key] = { sectionMatched: count, totalKeywords: words.length, matchedKeywords: matched };
  }

  // Proximity scoring: skills near experience
  const expText = canonical(sections['experience'] || sections['work experience'] || '');
  const skillsText = canonical(sections['skills'] || '');
  let proximityBonus = 0;
  for (const skill of KEYWORDS.skills) {
    if (skillsText.includes(skill)) {
      // bonus if also within experience
      if (expText.includes(skill)) proximityBonus += 5; // deterministic constant
    }
  }

  // Penalty for generic one-liners unless supported by achievements numbers
  let genericPenalty = 0;
  const genericSignals = KEYWORDS.signalsNegativeGeneric;
  for (const phrase of genericSignals) {
    if (lc.includes(phrase)) genericPenalty += 3;
  }
  const hasNumbers = /(\d+%|\b(increased|reduced|improved|optimized)\b)/i.test(normalized);
  if (hasNumbers) genericPenalty = Math.max(0, genericPenalty - 5);

  // Quantifiable results detection
  const quantRegexes: RegExp[] = [
    /\b(increased|reduced|improved|optimized)\b[^\n\r\.]*(by)?\s*\d+%/i,
    /\b(increased|reduced|improved|optimized)\b[^\n\r\.]*(by)?\s*\d+/i,
    /\b(\d+%|\d+\s+(users|transactions|requests|ms|s|minutes|hours))\b/i,
  ];
  let quantifiable = 0;
  for (const rg of quantRegexes) {
    quantifiable += (normalized.match(rg) || []).length;
  }

  // Formatting signals: presence of multiple recognized headers
  const foundHeaders = SECTION_HEADERS.filter(h => lc.includes(h)).length;

  // Score assembly (deterministic)
  const skillScore = Math.min(30, matchedRules.skills.sectionMatched * 2);
  const expScore = Math.min(30, Math.floor((sections['experience']?.length || 0) / 500) * 5 + proximityBonus);
  const achScore = Math.min(20, quantifiable * 4 + (matchedRules.achievements.sectionMatched > 0 ? 2 : 0));
  const eduScore = Math.min(10, matchedRules.education.sectionMatched >= 1 ? 8 : 0);
  const fmtScore = Math.min(10, Math.floor(foundHeaders / 2) * 2);
  let rawScore = skillScore + expScore + achScore + eduScore + fmtScore - genericPenalty;
  rawScore = Math.max(0, Math.min(100, rawScore));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (skillScore >= 20) strengths.push('Strong skills section with relevant technologies.');
  else recommendations.push('Expand skills section with specific technologies relevant to the role.');

  if (proximityBonus >= 10) strengths.push('Skills are substantiated within experience.');
  else recommendations.push('Include concrete examples where listed skills were applied in experience.');

  if (quantifiable >= 2) strengths.push('Quantifiable achievements present.');
  else recommendations.push('Add measurable outcomes (e.g., increased X by Y%).');

  if (foundHeaders >= 3) strengths.push('Clear structure with common section headers.');
  else weaknesses.push('Resume structure could be clearer with standard headers.');

  if (genericPenalty >= 3 && !hasNumbers) weaknesses.push('Generic claims without supporting details detected.');

  const result: AnalysisResult = {
    score: Math.round(rawScore),
    strengths,
    weaknesses,
    recommendations,
    matchedRules,
  };

  diagnostics.durations.analyzeMs = performance.now() - analyzeStart;
  diagnostics.matchedKeywords = matchedRules;
  diagnostics.timestamps.analyzedAt = performance.now();
  return result;
}

// File Parsing
/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function parseFileToText(file: File): Promise<string> {
  const start = performance.now();
  diagnostics.timestamps.start = start;
  diagnostics.error = null;
  diagnostics.rawParsedText = '';

  try {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    let text = '';
    if (ext === 'pdf') {
      text = await parsePdf(file);
    } else if (ext === 'docx') {
      text = await parseDocx(file);
    } else if (ext === 'txt') {
      text = await parseTxt(file);
    } else if (ext === 'doc') {
      // Legacy .doc - best-effort fallback to binary text
      text = await parseDocFallback(file);
    } else {
      // Attempt best-effort generic text extraction
      text = await parseGeneric(file);
    }

    text = normalizeText(text);
    diagnostics.rawParsedText = safePreview(text);
    diagnostics.durations.parseMs = performance.now() - start;
    diagnostics.timestamps.parsedAt = performance.now();
    return text;
  } catch (error: any) {
    diagnostics.error = error?.message || String(error);
    diagnostics.durations.parseMs = performance.now() - start;
    log('PARSE', 'Failed to parse file', error);
    throw error;
  }
}

async function ensurePdfJs() {
  if (pdfjs && GlobalWorkerOptions) return;
  try {
    // Try modern ESM entry (v5+)
    const mod: any = await import('pdfjs-dist');
    pdfjs = mod;
    GlobalWorkerOptions = (mod as any).GlobalWorkerOptions;
  } catch (_) {
    try {
      // Legacy fallback
      const legacy: any = await import('pdfjs-dist/legacy/build/pdf');
      pdfjs = legacy;
      GlobalWorkerOptions = (legacy as any).GlobalWorkerOptions;
    } catch (e) {
      throw new Error('pdfjs-dist not available');
    }
  }
  // Ensure workerSrc set for browser
  try {
    if (GlobalWorkerOptions && typeof window !== 'undefined') {
      if (!GlobalWorkerOptions.workerSrc) {
        GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';
      }
    }
  } catch {/* noop */}
}

async function parsePdf(file: File): Promise<string> {
  await ensurePdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const doc = await loadingTask.promise;

  const numPages = doc.numPages;
  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((it: any) => (it.str || '')).join(' ');
      if (pageText.trim().length > 0) {
        fullText += ' ' + pageText;
      } else {
        // Fallback: attempt to read raw items or use operator list
        const opList = await page.getOperatorList();
        if (opList && opList.fnArray) {
          fullText += ' ' + JSON.stringify(opList.fnArray).slice(0, 200);
        }
      }
    } catch (e) {
      log('PARSE', `PDF page ${i} extraction failed, continuing`, e);
    }
  }
  return fullText.trim();
}

async function ensureMammoth() {
  if (mammoth) return;
  try {
    // Preferred browser build
    mammoth = (await import('mammoth/mammoth.browser.js')).default || (await import('mammoth/mammoth.browser.js'));
  } catch (_) {
    try {
      mammoth = (await import('mammoth/mammoth.browser')).default || (await import('mammoth/mammoth.browser'));
    } catch (e) {
      try {
        mammoth = await import('mammoth');
      } catch (e2) {
        throw new Error('mammoth not available');
      }
    }
  }
}

async function parseDocx(file: File): Promise<string> {
  await ensureMammoth();
  const arrayBuffer = await file.arrayBuffer();
  try {
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    if (value && value.trim().length > 0) return value;
  } catch (e) {
    log('PARSE', 'mammoth extractRawText failed, fallback to generic', e);
  }
  return parseGeneric(file);
}

async function parseTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsText(file);
  });
}

async function parseDocFallback(file: File): Promise<string> {
  // Best-effort: read as binary string and strip non-text characters
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const bin = String(reader.result || '');
      const ascii = bin.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
      resolve(ascii);
    };
    reader.readAsBinaryString(file);
  });
}

async function parseGeneric(file: File): Promise<string> {
  // Attempt text, then binary-ascii fallback
  try {
    return await parseTxt(file);
  } catch {
    return parseDocFallback(file);
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// PDF Report
/**
 * @param {AnalysisResult} feedback
 * @param {UserMeta=} userMeta
 * @returns {Promise<Uint8Array>} PDF binary data (Uint8Array)
 */
export async function generatePDFReport(feedback: AnalysisResult, userMeta?: UserMeta): Promise<Uint8Array> {
  const start = performance.now();
  try {
    if (!jsPDF) {
      const mod: any = await import('jspdf');
      jsPDF = mod.jsPDF || mod.default || mod;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const name = userMeta?.name || 'Unknown';
    const titleY = 40;
    doc.setFontSize(18);
    doc.text(`Resume Analysis Report`, 40, titleY);
    doc.setFontSize(12);
    doc.text(`Candidate: ${name}`, 40, titleY + 24);

    // Score bar
    const score = Math.max(0, Math.min(100, feedback.score || 0));
    const barX = 40, barY = titleY + 50, barW = 500, barH = 16;
    const color = score >= 70 ? [46, 204, 113] : score >= 40 ? [241, 196, 15] : [231, 76, 60];
    doc.setDrawColor(200);
    doc.rect(barX, barY, barW, barH);
    doc.setFillColor(...color);
    doc.rect(barX, barY, (barW * score) / 100, barH, 'F');
    doc.text(`Score: ${score}`, barX + barW + 10, barY + barH - 2);

    let y = barY + 40;
    y = writeSection(doc, 'Strengths', feedback.strengths, y);
    y = writeSection(doc, 'Weaknesses', feedback.weaknesses, y);
    y = writeSection(doc, 'Recommendations', feedback.recommendations, y);

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Generated by AI Interviewer', 40, pageH - 30);

    const out = doc.output('arraybuffer');
    diagnostics.durations.pdfMs = performance.now() - start;
    diagnostics.timestamps.pdfAt = performance.now();
    return new Uint8Array(out);
  } catch (error: any) {
    diagnostics.error = error?.message || String(error);
    log('PDF', 'Failed to generate PDF', error);
    throw error;
  }
}

function writeSection(doc: any, title: string, items: string[], startY: number): number {
  let y = startY;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(title, 40, y);
  y += 16;
  doc.setFontSize(12);
  doc.setTextColor(20);
  if (items.length === 0) {
    doc.text('- None', 60, y);
    y += 16;
  } else {
    for (const it of items) {
      const lines = doc.splitTextToSize(`- ${it}`, 520);
      for (const line of lines) {
        doc.text(line, 60, y);
        y += 14;
      }
    }
  }
  return y + 10;
}

// Diagnostics
export function getAnalysisDiagnostics(): AnalyzerDiagnostics {
  return { ...diagnostics };
}

// Optional Firestore upload (DEV only)
/**
 * @param {{ uid?: string; filename?: string }} meta
 */
export async function uploadDiagnosticsIfDev(meta: { uid?: string; filename?: string }) {
  if (!DEV_MODE) return;
  try {
    if (!db) {
      log('DEV', 'Firestore db not available; skipping diagnostics upload');
      return;
    }
    // Lazy import firestore functions (modular v9)
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const payload = {
      uid: meta.uid || null,
      filename: meta.filename || null,
      error: diagnostics.error,
      diagnostics: {
        rawParsedText: diagnostics.rawParsedText,
        durations: diagnostics.durations,
        matchedKeywords: diagnostics.matchedKeywords,
        timestamps: diagnostics.timestamps,
      },
      createdAt: serverTimestamp(),
    } as const;
    await addDoc(collection(db, 'resumeAnalyzerDiagnostics'), payload);
    log('DEV', 'Diagnostics uploaded');
  } catch (e) {
    log('DEV', 'Diagnostics upload failed (check Firestore rules and config)', e);
  }
}

// README snippet (developer reference)
/*
Debug Runbook (short):
1) If all resumes score similarly: inspect getAnalysisDiagnostics().matchedKeywords and matched counts; ensure KEYWORDS/weights are correct.
2) PDF yields no text: verify pdfjs workerSrc; consider setting Vite alias or GlobalWorkerOptions manually; observe [PARSE] logs.
3) PDF generation errors in browser: ensure jspdf is available and not blocked by CSP; try simpler fonts.
4) Firestore upload permission denied: check Firebase config and security rules; toggle VITE_ANALYZER_DEV_MODE=true only in dev.
5) DOCX parse empty: mammoth browser build required; fallback to generic text parse should still return content.
6) Unicode or hyphen issues: normalization uses NFC and hyphen replacement; review normalizeText().
7) Inconsistent results: scoring is deterministic; verify the exact input text (whitespace collapse can change counts slightly).
8) Timeouts/large files: confirm file size; extraction loops are per-page with try/catch; use diagnostics.durations to locate slowness.
9) Proximity bonus seems off: only applied when skill appears in both skills and experience sections.
10) To capture failures, enable DEV mode and check Firestore collection resumeAnalyzerDiagnostics.
*/

export default {
  parseFileToText,
  analyzeResume,
  generatePDFReport,
  getAnalysisDiagnostics,
  uploadDiagnosticsIfDev,
};



