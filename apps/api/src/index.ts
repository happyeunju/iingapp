import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./routes/health";
import { pinRoute } from "./routes/pin";
import { authMiddleware, AuthVars, Env } from "./middleware/auth";

const ALLOWED_ORIGINS = [
  "https://iingapp.happyeunju.workers.dev",
  "http://localhost:5173",
];

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use(
  "*",
  cors({
    origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : null),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 600,
  }),
);

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);
app.route("/", pinRoute);

app.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
