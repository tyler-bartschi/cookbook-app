import * as z from "zod";

/**
 * Endpoint: /user/me/username
 *
 * Updates the user's username, requires password verification
 */
export const UpdateUsernameRequestSchema = z.strictObject({
  newUsername: z.string().min(3).max(32),
  password: z.string().min(8).max(32),
});

export type UpdateUsernameRequest = z.infer<typeof UpdateUsernameRequestSchema>;
