import * as z from "zod";

export const UserDtoSchema = z.strictObject({
  userId: z.string().min(1),
  username: z.string().min(3).max(32),
  email: z.email(),
  profilePictureUrl: z.url(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;
