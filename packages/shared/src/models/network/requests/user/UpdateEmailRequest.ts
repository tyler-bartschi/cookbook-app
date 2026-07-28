import * as z from "zod";
import { EmailSchema } from "../../../domain/EmailSchema.js";

/**
 * Endpoint: /user/me/email
 *
 * Updates the user's email, requires password verification
 */
export const UpdateEmailRequestSchema = z.strictObject({
  newEmail: EmailSchema,
  password: z.string().min(8).max(32),
});

export type UpdateEmailRequest = z.infer<typeof UpdateEmailRequestSchema>;
