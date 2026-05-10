import * as z from "zod";
import { AuthDtoSchema } from "../../../domain/dto/auth/AuthDto.js";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /auth/login
 *
 * Returns the UserDto and both the long term and short term AuthDtos
 */
export const LoginResponseSchema = z.strictObject({
  user: UserDtoSchema,
  shortTermAuth: AuthDtoSchema,
  longTermAuth: AuthDtoSchema.optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
