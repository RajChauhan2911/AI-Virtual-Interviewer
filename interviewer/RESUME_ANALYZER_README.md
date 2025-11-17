## Resume Analyzer Module

Exports from `src/lib/resumeAnalyzer.ts`:
- `parseFileToText(file)`
- `analyzeResume(text)`
- `generatePDFReport(feedback, userMeta)`
- `getAnalysisDiagnostics()`
- `uploadDiagnosticsIfDev(meta)` (DEV only)

Usage (React example):

```tsx
import ResumeAnalyzerExample from './components/ResumeAnalyzerExample';
```

Install required deps (snippets):

```json
{
  "dependencies": {
    "pdfjs-dist": "^4.6.82",
    "mammoth": "^1.6.0",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.12",
    "identity-obj-proxy": "^3.0.0"
  }
}
```

Enable DEV diagnostics (optional):

```bash
# .env
VITE_ANALYZER_DEV_MODE=true
```

Debug runbook (quick):
1. Analyzer returns identical scores: inspect `getAnalysisDiagnostics().matchedKeywords`; adjust KEYWORDS/weights.
2. No text from PDFs: ensure `pdfjs-dist` worker is available; set `GlobalWorkerOptions.workerSrc` if needed.
3. PDF generation fails: verify `jspdf` availability; try simpler fonts; check CSP.
4. Firestore upload fails: check `VITE_*` Firebase env and rules; keep DEV mode off in prod.
5. Mammoth fails on DOCX: fallback to generic text parsing works; verify browser build import.


