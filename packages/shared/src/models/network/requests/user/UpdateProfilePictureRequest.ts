import { BaseRequest } from "../BaseRequest.js";

/**
 * Endpoint: /user/me/profile-picture
 * 
 * Updates the user's profile picture, does not require password verification
 */
export interface UpdateProfilePictureRequest extends BaseRequest {
  readonly imageBytesAsBase64String: string;
  readonly imageFileExtension: string;
}