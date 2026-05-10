import * as z from "zod";

/**
 * Endpoint: /auth/change-password
 *
 * Sends the password and the new password to update
 */
export const UpdatePasswordRequestSchema = z.strictObject({
  password: z.string().min(8).max(32),
  newPassword: z.string().min(8).max(32),
});

export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;
