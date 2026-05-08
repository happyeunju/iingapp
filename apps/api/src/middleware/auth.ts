import { MiddlewareHandler } from "hono";
import { Jwt } from "hono/utils/jwt";
import { JwtPayloadSchema } from "@iingapp/shared";

// 전체 앱의 Bindings 타입 (모든 라우트에서 공유)
export type Env = {
  ENV: string;
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export type AuthVars = {
  user: { id: string; email: string };
};

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AuthVars;
}> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "missing_token" }, 401);
  }
  const token = header.slice("Bearer ".length).trim();

  let payload: unknown;
  try {
    // First decode to check algorithm
    const decoded = Jwt.decode(token);
    // Get the secret from env (c.env in production, fallback to test-secret in tests)
    const secret = c.env.JWT_SECRET || "test-secret-do-not-use-in-prod";
    // Verify with the secret
    payload = await Jwt.verify(token, secret, decoded.header.alg as any);
  } catch (err) {
    return c.json({ error: "invalid_token" }, 401);
  }

  const parsed = JwtPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ error: "bad_payload" }, 401);
  }

  c.set("user", { id: parsed.data.sub, email: parsed.data.email });
  await next();
};
