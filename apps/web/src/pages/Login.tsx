import { useState } from "react";
import { getSupabase } from "../lib/supabase";

type Status = "idle" | "sending" | "sent" | "error";

export function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div data-testid="page-login" className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">iingApp 로그인</h1>
      {status === "sent" ? (
        <p className="text-green-600">
          이메일을 보냈어요. 메일에서 링크를 눌러 진입하세요.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
          >
            {status === "sending" ? "보내는 중…" : "매직링크로 로그인"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
