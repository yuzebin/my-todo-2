import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export type ActionState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;
