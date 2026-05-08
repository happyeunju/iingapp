import { describe, it, expect } from "vitest";
import { sign } from "hono/jwt";
import { SELF, env } from "cloudflare:test";

const secret = "test-secret-do-not-use-in-prod";

describe("auth middleware", () => {
  it("토큰 없이 요청 → 401", async () => {
    const res = await SELF.fetch("http://localhost/me");
    expect(res.status).toBe(401);
  });

  it("유효한 토큰 → 200", async () => {
    const token = await sign(
      {
        sub: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret
    );
    const res = await SELF.fetch("http://localhost/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("test@example.com");
  });

  it("만료된 토큰 → 401", async () => {
    const token = await sign(
      {
        sub: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600,
      },
      secret
    );
    const res = await SELF.fetch("http://localhost/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });
});
