import * as z from "zod";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /user/me/username
 *
 * Returns the new UserDto
 */
export const UpdateUsernameResponseSchema = z.strictObject({
  user: UserDtoSchema,
});

export type UpdateUsernameResponse = z.infer<typeof UpdateUsernameResponseSchema>;
