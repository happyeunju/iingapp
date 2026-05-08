import { Hono } from "hono";
import { healthRoute } from "./routes/health";

type Env = {
  ENV: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);

export default app;
