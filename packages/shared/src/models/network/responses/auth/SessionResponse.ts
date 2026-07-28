import * as z from "zod";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";
import { AuthDtoSchema } from "../../../domain/dto/auth/AuthDto.js";

/**
 * Endpoint: /auth/session
 *
 * Returns the UserDto and the new short term AuthDto
 */

export const SessionResponseSchema = z.strictObject({
  user: UserDtoSchema,
  shortTermAuth: AuthDtoSchema,
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;
