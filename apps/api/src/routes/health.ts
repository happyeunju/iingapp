import { Hono } from "hono";

export const healthRoute = new Hono();

healthRoute.get("/health", (c) =>
  c.json({
    status: "ok",
    version: "0.1.0",
    time: new Date().toISOString(),
  })
);
