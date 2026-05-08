import { describe, it, expect } from "vitest";
import { PinSchema, JwtPayloadSchema } from "../src/auth.schema";

describe("PinSchema", () => {
  it("4자리 숫자만 허용", () => {
    expect(PinSchema.safeParse("1234").success).toBe(true);
    expect(PinSchema.safeParse("12345").success).toBe(false);
    expect(PinSchema.safeParse("abcd").success).toBe(false);
    expect(PinSchema.safeParse("123").success).toBe(false);
  });
});

describe("JwtPayloadSchema", () => {
  it("필수 필드 검증", () => {
    const valid = {
      sub: "00000000-0000-0000-0000-000000000001",
      email: "user@example.com",
      iat: 1700000000,
      exp: 1700100000,
    };
    expect(JwtPayloadSchema.safeParse(valid).success).toBe(true);

    const missingExp = { ...valid, exp: undefined };
    expect(JwtPayloadSchema.safeParse(missingExp).success).toBe(false);
  });
});
