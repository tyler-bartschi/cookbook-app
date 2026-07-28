import * as z from "zod";
import { UsernameSchema } from "../../UsernameSchema.js";

export const PublicUserDtoSchema = z.strictObject({
  username: UsernameSchema,
  profilePictureUrl: z.union([z.literal(""), z.url()]),
});

export type PublicUserDto = z.infer<typeof PublicUserDtoSchema>;
