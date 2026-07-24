import * as z from "zod";
import { EmailSchema } from "../../../domain/EmailSchema.js";
import { UsernameSchema } from "../../../domain/UsernameSchema.js";

/**
 * Endpoint: /auth/register
 *
 * Profile image may be provided upon register, but is not required
 */
const BaseRegisterRequestShape = {
  username: UsernameSchema,
  email: EmailSchema,
  password: z.string().min(8).max(32),
  rememberMe: z.boolean(),
};

const RegisterRequestWithoutImageSchema = z.strictObject({
  ...BaseRegisterRequestShape,
});

const RegisterRequestWithImageSchema = z.strictObject({
  ...BaseRegisterRequestShape,
  imageBytesAsBase64String: z.string().min(1),
  imageFileExtension: z.string().min(1),
});

export const RegisterRequestSchema = z.union([
  RegisterRequestWithoutImageSchema,
  RegisterRequestWithImageSchema,
]);

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterRequestWithImage = z.infer<typeof RegisterRequestWithImageSchema>;
export type RegisterRequestWithoutImage = z.infer<typeof RegisterRequestWithoutImageSchema>;
