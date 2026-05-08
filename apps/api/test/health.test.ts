import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("GET /health", () => {
  it("200 with status JSON", async () => {
    const res = await SELF.fetch("http://localhost/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      status: "ok",
      version: expect.any(String),
    });
  });
});
