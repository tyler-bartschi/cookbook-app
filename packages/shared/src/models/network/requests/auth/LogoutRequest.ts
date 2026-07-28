import * as z from "zod";

/**
 * Endpoint: /auth/logout
 *
 * May provide an optional field, invalidateLongTermAuth, to invalidate the user's long term auth token if exists
 */
export const LogoutRequestSchema = z.strictObject({
  invalidateLongTermAuth: z.boolean().optional(),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
