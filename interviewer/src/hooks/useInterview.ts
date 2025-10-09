import { useCallback, useState } from "react";
import { apiPost } from "@/lib/api";

type StartPayload = { role: string; difficulty: string; mode: "text" | "voice" };
type StartResp = { interview_id: string; first_question: string };
type AnswerResp = {
  score: number;
  components: Record<string, number>;
  feedback: string;
  next_question: string | null;
  done: boolean;
};

export function useInterview() {
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string; score: number }>>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (payload: StartPayload) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<StartResp>("/api/interview/start", payload);
      setInterviewId(res.interview_id);
      setQuestion(res.first_question);
      setHistory([]);
      setDone(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(
    async (userAnswer: string) => {
      if (!interviewId || !question) return;
      setError(null);
      setLoading(true);
      try {
        const res = await apiPost<AnswerResp>("/api/interview/answer", {
          interview_id: interviewId,
          question,
          answer: userAnswer,
        });
        setHistory((h) => [...h, { q: question, a: userAnswer, score: res.score }]);
        setQuestion(res.next_question);
        setDone(res.done);
      } catch (e: any) {
        setError(e?.message ?? "Failed to submit answer");
      } finally {
        setLoading(false);
      }
    },
    [interviewId, question]
  );

  const finish = useCallback(async () => {
    if (!interviewId) return null;
    setError(null);
    setLoading(true);
    try {
      const report = await apiPost("/api/interview/finish", { interview_id: interviewId });
      return report as any;
    } catch (e: any) {
      setError(e?.message ?? "Failed to finish interview");
      return null;
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  return {
    state: { interviewId, question, history, done, loading, error },
    actions: { start, answer, finish },
  };
}


