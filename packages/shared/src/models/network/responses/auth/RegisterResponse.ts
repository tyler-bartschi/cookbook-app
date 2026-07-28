import * as z from "zod";
import { AuthDtoSchema } from "../../../domain/dto/auth/AuthDto.js";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /auth/register
 *
 * Returns the UserDto, and both short term and long term AuthDtos
 */
export const RegisterResponseSchema = z.strictObject({
  user: UserDtoSchema,
  shortTermAuth: AuthDtoSchema,
  longTermAuth: AuthDtoSchema.optional(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
