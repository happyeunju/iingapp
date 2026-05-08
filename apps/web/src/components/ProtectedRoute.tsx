import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSupabase } from "../lib/supabase";

type State = "loading" | "authed" | "anonymous";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "authed" : "anonymous");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session ? "authed" : "anonymous");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading") return <div className="p-6">로딩…</div>;
  if (state === "anonymous") return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}
