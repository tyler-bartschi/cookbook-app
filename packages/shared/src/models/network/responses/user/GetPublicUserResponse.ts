import * as z from "zod";
import { PublicUserDtoSchema } from "../../../domain/dto/user/PublicUserDto.js";

/**
 * Endpoint: /user/{user_id}
 *
 * Returns a public user dto
 */
export const GetPublicUserResponseSchema = z.strictObject({
  user: PublicUserDtoSchema,
});

export type GetPublicUserResponse = z.infer<typeof GetPublicUserResponseSchema>;
