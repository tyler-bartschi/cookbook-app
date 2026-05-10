import * as z from "zod";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /user/me/profile-picture
 *
 * Returns the new UserDto
 */
export const UpdateProfilePictureResponseSchema = z.strictObject({
  user: UserDtoSchema,
});

export type UpdateProfilePictureResponse = z.infer<typeof UpdateProfilePictureResponseSchema>;
