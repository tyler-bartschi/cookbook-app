import * as z from "zod";

export const PublicUserDtoSchema = z.strictObject({
  username: z.string().min(3).max(32),
  profilePictureUrl: z.url(),
});

export type PublicUserDto = z.infer<typeof PublicUserDtoSchema>;
