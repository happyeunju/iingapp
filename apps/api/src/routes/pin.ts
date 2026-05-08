import { Hono } from "hono";
import { PinSchema } from "@iingapp/shared";
import { authMiddleware, AuthVars, Env } from "../middleware/auth";
import { hashPin, verifyPin } from "../lib/pin";
import { getAdminClient } from "../lib/supabase";

export const pinRoute = new Hono<{ Bindings: Env; Variables: AuthVars }>();

pinRoute.use("/me/pin", authMiddleware);
pinRoute.use("/auth/pin", authMiddleware);

// PIN 등록/변경
pinRoute.post("/me/pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = PinSchema.safeParse(body?.pin);
  if (!parsed.success) {
    return c.json({ error: "invalid_pin_format" }, 400);
  }
  const user = c.get("user");
  const supabase = getAdminClient(c.env);
  const hash = await hashPin(parsed.data);
  const { error } = await supabase
    .from("users")
    .update({ pin_hash: hash, pin_attempts: 0, pin_locked_until: null })
    .eq("id", user.id);
  if (error) return c.json({ error: "db_error", detail: error.message }, 500);
  return c.body(null, 204);
});

// PIN 검증
pinRoute.post("/auth/pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = PinSchema.safeParse(body?.pin);
  if (!parsed.success) return c.json({ error: "invalid_pin_format" }, 400);

  const user = c.get("user");
  const supabase = getAdminClient(c.env);

  const { data, error } = await supabase
    .from("users")
    .select("pin_hash, pin_attempts, pin_locked_until")
    .eq("id", user.id)
    .single();
  if (error || !data) return c.json({ error: "user_not_found" }, 404);

  const now = Date.now();
  if (data.pin_locked_until && new Date(data.pin_locked_until).getTime() > now) {
    return c.json({ error: "locked", until: data.pin_locked_until }, 423);
  }
  if (!data.pin_hash) return c.json({ error: "no_pin_set" }, 409);

  const ok = await verifyPin(parsed.data, data.pin_hash);
  if (!ok) {
    const attempts = (data.pin_attempts ?? 0) + 1;
    const patch: any = { pin_attempts: attempts };
    if (attempts >= 5) {
      patch.pin_locked_until = new Date(now + 60_000).toISOString();
      patch.pin_attempts = 0;
    }
    await supabase.from("users").update(patch).eq("id", user.id);
    return c.json({ error: "wrong_pin", attempts }, 401);
  }

  // 성공 시 카운터 초기화
  await supabase
    .from("users")
    .update({ pin_attempts: 0, pin_locked_until: null })
    .eq("id", user.id);
  return c.json({ ok: true });
});
