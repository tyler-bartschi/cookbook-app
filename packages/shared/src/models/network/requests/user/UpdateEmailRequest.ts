import * as z from "zod";

/**
 * Endpoint: /user/me/email
 *
 * Updates the user's email, requires password verification
 */
export const UpdateEmailRequestSchema = z.strictObject({
  newEmail: z.email(),
  password: z.string().min(8).max(32),
});

export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>;
