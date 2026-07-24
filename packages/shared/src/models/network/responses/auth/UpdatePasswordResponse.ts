import * as z from "zod";
import { AuthDtoSchema } from "../../../domain/dto/auth/AuthDto.js";

/**
 * Endpoint: /auth/update-password
 *
 * Returns the new AuthDtos for that user
 */
export const UpdatePasswordResponseSchema = z.strictObject({
  shortTermAuth: AuthDtoSchema,
  longTermAuth: AuthDtoSchema.optional(),
});

export type UpdatePasswordResponse = z.infer<typeof UpdatePasswordResponseSchema>;
