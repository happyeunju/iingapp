import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "../src/lib/pin";

describe("pin hashing", () => {
  it("같은 PIN은 verify=true", async () => {
    const hash = await hashPin("1234");
    expect(await verifyPin("1234", hash)).toBe(true);
  });
  it("다른 PIN은 verify=false", async () => {
    const hash = await hashPin("1234");
    expect(await verifyPin("9999", hash)).toBe(false);
  });
  it("같은 PIN도 매번 다른 해시 (salt)", async () => {
    const a = await hashPin("1234");
    const b = await hashPin("1234");
    expect(a).not.toBe(b);
  });
});
