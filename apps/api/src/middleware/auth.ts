import { MiddlewareHandler } from "hono";
import { getAdminClient } from "../lib/supabase";

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

  const supabase = getAdminClient(c.env);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return c.json({ error: "invalid_token" }, 401);
  }

  c.set("user", { id: data.user.id, email: data.user.email ?? "" });
  await next();
};
