import * as z from "zod";
import { UserDtoSchema } from "../../../domain/dto/user/UserDto.js";

/**
 * Endpoint: /user/me/email
 *
 * Returns the user with the updated Email
 */
export const UpdateEmailResponseSchema = z.strictObject({
  user: UserDtoSchema,
});

export type UpdateEmailResponse = z.infer<typeof UpdateEmailResponseSchema>;
