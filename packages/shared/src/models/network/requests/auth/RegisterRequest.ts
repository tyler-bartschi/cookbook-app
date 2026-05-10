import * as z from "zod";

/**
 * Endpoint: /auth/register
 *
 * Profile image may be provided upon register, but is not required
 */
const BaseRegisterRequestShape = {
  username: z.string().min(3).max(32),
  email: z.email(),
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
