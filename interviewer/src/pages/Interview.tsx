import { useState } from 'react';
import { useInterview } from "@/hooks/useInterview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InterviewPage() {
  const { state, actions } = useInterview();
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [answer, setAnswer] = useState("");

  const start = () => actions.start({ role, difficulty, mode });
  const submit = async () => {
    if (!answer.trim()) return;
    await actions.answer(answer.trim());
    setAnswer("");
  };
  const finish = async () => {
    const report = await actions.finish();
    if (report) {
      alert(`Score: ${report.score}\nTips: ${(report.tips || []).join(", ")}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Interview</h1>

      {!state.interviewId && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Role" />
            <Input value={difficulty} onChange={e => setDifficulty(e.target.value)} placeholder="Difficulty" />
            <Input value={mode} onChange={e => setMode(e.target.value as any)} placeholder="text|voice" />
          </div>
          <Button onClick={start} disabled={state.loading}>Start Interview</Button>
          {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
        </div>
      )}

      {state.interviewId && (
        <div className="space-y-4">
          <div className="ai-card p-4">
            <div className="font-medium">Question</div>
            <div className="mt-1">{state.question ?? "(no question)"}</div>
          </div>

          <div className="flex gap-2">
            <Input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..." />
            <Button onClick={submit} disabled={state.loading || !state.question}>Send</Button>
            <Button variant="outline" onClick={finish} disabled={state.loading}>Finish</Button>
          </div>

          <div className="space-y-2">
            <div className="font-medium">History</div>
            <ul className="list-disc pl-5">
              {state.history.map((h, i) => (
                <li key={i}>
                  <span className="text-muted-foreground">Q:</span> {h.q}{" "}
                  <span className="text-muted-foreground">A:</span> {h.a}{" "}
                  <span className="text-muted-foreground">Score:</span> {h.score}
                </li>
              ))}
            </ul>
          </div>

          {state.done && <div className="text-green-600">Interview complete. Click Finish to get report.</div>}
          {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
        </div>
      )}
    </div>
  );
}