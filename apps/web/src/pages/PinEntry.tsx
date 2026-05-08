import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export function PinEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await apiFetch("/auth/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setSubmitting(false);
    if (res.ok) {
      navigate("/", { replace: true });
      return;
    }
    if (res.status === 423) setError("잠시 잠겼어요. 1분 뒤에 다시 시도해주세요.");
    else setError("PIN이 일치하지 않습니다.");
  }

  return (
    <div data-testid="page-pin-entry" className="max-w-sm mx-auto py-12">
      <h1 className="text-xl font-bold mb-6">PIN 입력</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">PIN</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full mt-1 border rounded px-3 py-2 bg-white dark:bg-slate-800 tracking-[0.5em] text-center text-2xl"
          />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
        >
          {submitting ? "확인 중…" : "확인"}
        </button>
      </form>
    </div>
  );
}
