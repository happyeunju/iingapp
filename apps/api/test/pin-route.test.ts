import { describe, it, expect, vi } from "vitest";
import { sign } from "hono/jwt";
import { SELF } from "cloudflare:test";

const secret = "test-secret-do-not-use-in-prod";

vi.mock("../src/lib/supabase", () => {
  const data: Record<string, any> = {};
  return {
    getAdminClient: () => ({
      from: (table: string) => ({
        update: (patch: any) => ({
          eq: async (col: string, val: string) => {
            data[`${table}:${col}:${val}`] = {
              ...(data[`${table}:${col}:${val}`] ?? {}),
              ...patch,
            };
            return { error: null };
          },
        }),
        select: (_cols: string) => ({
          eq: (col: string, val: string) => ({
            single: async () => ({
              data: data[`${table}:${col}:${val}`] ?? null,
              error: null,
            }),
          }),
        }),
      }),
    }),
  };
});

async function makeToken() {
  return sign(
    {
      sub: "11111111-1111-1111-1111-111111111111",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    secret
  );
}

describe("pin routes", () => {
  it("POST /me/pin (PIN 등록) 성공", async () => {
    const token = await makeToken();
    const res = await SELF.fetch("http://localhost/me/pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "1234" }),
    });
    expect(res.status).toBe(204);
  });

  it("POST /me/pin 잘못된 형식 → 400", async () => {
    const token = await makeToken();
    const res = await SELF.fetch("http://localhost/me/pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "abcd" }),
    });
    expect(res.status).toBe(400);
  });
});
