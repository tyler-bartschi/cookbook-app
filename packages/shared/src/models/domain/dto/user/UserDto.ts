import * as z from "zod";
import { UsernameSchema } from "../../UsernameSchema.js";
import { EmailSchema } from "../../EmailSchema.js";

export const UserDtoSchema = z.strictObject({
  userId: z.string().min(1),
  username: UsernameSchema,
  email: EmailSchema,
  profilePictureUrl: z.union([z.literal(""), z.url()]),
  createdAt: z.string(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;
