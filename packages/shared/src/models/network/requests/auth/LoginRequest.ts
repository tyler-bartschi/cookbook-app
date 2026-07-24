import * as z from "zod";
import { EmailSchema } from "../../../domain/EmailSchema.js";
import { UsernameSchema } from "../../../domain/UsernameSchema.js";

const BaseLoginRequestSchema = {
  password: z.string().min(8).max(32),
  rememberMe: z.boolean(),
};

const LoginWithEmailSchema = z.strictObject({
  ...BaseLoginRequestSchema,
  email: EmailSchema,
});

const LoginWithUsernameSchema = z.strictObject({
  ...BaseLoginRequestSchema,
  username: UsernameSchema,
});

export const LoginRequestSchema = z.union([LoginWithEmailSchema, LoginWithUsernameSchema]);

/**
 * Endpoint: /auth/login
 *
 * Username OR email must be provided, but not both
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UsernameLoginRequest = z.infer<typeof LoginWithUsernameSchema>;
export type EmailLoginRequest = z.infer<typeof LoginWithEmailSchema>;
