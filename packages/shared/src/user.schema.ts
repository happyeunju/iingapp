import { z } from "zod";

export const CefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

export const ProficiencyTestSchema = z.enum([
  "opic",
  "toeic_sp",
  "toefl_ibt",
  "ielts",
  "self",
  "none",
]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  timezone: z.string().default("Asia/Seoul"),
  proficiency_test: ProficiencyTestSchema.nullable(),
  proficiency_score: z.string().nullable(),
  cefr_level: CefrLevelSchema.nullable(),
  has_pin: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
export type CefrLevel = z.infer<typeof CefrLevelSchema>;
export type ProficiencyTest = z.infer<typeof ProficiencyTestSchema>;
