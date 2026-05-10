import * as z from "zod";
import { AuthDtoSchema } from "../../../domain/dto/auth/AuthDto.js";

/**
 * Endpoint: /auth/change-password
 *
 * Returns the new AuthDtos for that user
 */
export const ChangePasswordResponseSchema = z.strictObject({
  shortTermAuth: AuthDtoSchema,
  longTermAuth: AuthDtoSchema.optional(),
});

export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;
