import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { analyzeResume, parseFileToText, generatePDFReport, getAnalysisDiagnostics, uploadDiagnosticsIfDev } from '../lib/resumeAnalyzer';

export default function ResumeAnalyzerExample() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeResume> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setText('');
    setError(null);
  }, []);

  const onAnalyze = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseFileToText(file);
      setText(parsed);
      const res = analyzeResume(parsed);
      setResult(res);
      await uploadDiagnosticsIfDev({ filename: file.name });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [file]);

  const onDownloadPdf = useCallback(async () => {
    if (!result) return;
    const pdf = await generatePDFReport(result, { name: 'Unknown', filename: file?.name });
    const ab = (pdf.buffer as ArrayBuffer).slice(0);
    const blob = new Blob([ab], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [result, file]);

  const diag = useMemo(() => getAnalysisDiagnostics(), [result, error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Analyzer (Example)</CardTitle>
      </CardHeader>
      <CardContent>
        <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={onFile} />
        <div className="mt-2 flex gap-2">
          <Button disabled={!file || busy} onClick={onAnalyze}>Analyze</Button>
          <Button variant="secondary" disabled={!result} onClick={onDownloadPdf}>Download PDF</Button>
        </div>
        {busy && <p className="mt-2">Processing...</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}
        {result && (
          <div className="mt-4 space-y-2">
            <p><strong>Score:</strong> {result.score}</p>
            <div>
              <strong>Strengths</strong>
              <ul className="list-disc ml-6">
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong>Weaknesses</strong>
              <ul className="list-disc ml-6">
                {result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong>Recommendations</strong>
              <ul className="list-disc ml-6">
                {result.recommendations.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Diagnostics (safe preview) */}
        {(result || error) && (
          <div className="mt-6">
            <details>
              <summary className="cursor-pointer">Diagnostics</summary>
              <pre className="whitespace-pre-wrap text-xs mt-2">{JSON.stringify({
                durations: diag.durations,
                timestamps: diag.timestamps,
                matchedKeywords: diag.matchedKeywords,
                error: diag.error,
                rawParsedText: diag.rawParsedText,
              }, null, 2)}</pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


