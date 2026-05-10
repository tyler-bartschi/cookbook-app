import * as z from "zod";

/**
 * Endpoint: /user/me/profile-picture
 *
 * Updates the user's profile picture, does not require password verification
 */
export const UpdateProfilePictureRequestSchema = z.strictObject({
  imageBytesAsBase64String: z.string().min(1),
  imageFileExtension: z.string().min(1),
});

export type UpdateProfilePictureRequest = z.infer<typeof UpdateProfilePictureRequestSchema>;
