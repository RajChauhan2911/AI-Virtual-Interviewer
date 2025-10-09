import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/lib/firebase";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      if (!auth || typeof auth.onAuthStateChanged !== "function") {
        setIsAuthed(false);
        setLoading(false);
        return;
      }
      const unsub = auth.onAuthStateChanged((u) => {
        setIsAuthed(!!u);
        setLoading(false);
      });
      return () => unsub();
    } catch {
      setIsAuthed(false);
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      if (!auth || typeof auth.onAuthStateChanged !== "function") {
        setIsAuthed(false);
        setLoading(false);
        return;
      }
      const unsub = auth.onAuthStateChanged((u) => {
        setIsAuthed(!!u);
        setLoading(false);
      });
      return () => unsub();
    } catch {
      setIsAuthed(false);
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (isAuthed) return <Navigate to="/" replace />;
  return <>{children}</>;
}


