import * as z from "zod";

const BaseLoginRequestSchema = {
  password: z.string().min(8).max(32),
  rememberMe: z.boolean(),
};

const LoginWithEmailSchema = z.strictObject({
  ...BaseLoginRequestSchema,
  email: z.email(),
});

const LoginWithUsernameSchema = z.strictObject({
  ...BaseLoginRequestSchema,
  username: z.string().min(3).max(32),
});

export const LoginRequestSchema = z.union([LoginWithEmailSchema, LoginWithUsernameSchema]);

/**
 * Endpoint: /auth/login
 *
 * Username OR email must be provided, but not both
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
