import * as z from "zod";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /user/me
 * Returns signed-in user's dto
 *
 */
export const GetUserResponseSchema = z.strictObject({
  user: UserDtoSchema,
});

export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
