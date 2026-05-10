import * as z from "zod";

export const AuthDtoSchema = z.strictObject({
  authToken: z.string().min(1),
  userId: z.string().min(1),
});

export type AuthDto = z.infer<typeof AuthDtoSchema>;
