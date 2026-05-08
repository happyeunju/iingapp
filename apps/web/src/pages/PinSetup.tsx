import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export function PinSetup() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setError("4자리 숫자를 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await apiFetch("/me/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("저장 실패");
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div data-testid="page-pin-setup" className="max-w-sm mx-auto py-12">
      <h1 className="text-xl font-bold mb-4">PIN 설정</h1>
      <p className="text-sm text-slate-500 mb-6">
        앱을 빠르게 다시 열 때 입력합니다.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">PIN (4자리)</span>
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
          disabled={saving}
          className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </form>
    </div>
  );
}
