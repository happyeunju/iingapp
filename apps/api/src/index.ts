import { Hono } from "hono";
import { healthRoute } from "./routes/health";
import { authMiddleware, AuthVars, Env } from "./middleware/auth";

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);

app.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
