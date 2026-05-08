import { z } from "zod";

export const PinSchema = z.string().regex(/^\d{4}$/, "PIN은 4자리 숫자");

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type PinValue = z.infer<typeof PinSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
