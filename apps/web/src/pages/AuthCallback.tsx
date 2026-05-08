import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/auth/pin/setup", { replace: true });
      } else {
        navigate("/auth/login", { replace: true });
      }
    });
  }, [navigate]);

  return <div data-testid="page-auth-callback">로그인 처리 중…</div>;
}
