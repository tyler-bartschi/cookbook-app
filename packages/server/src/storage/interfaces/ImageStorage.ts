export interface ImageStorage {
  /**
   * Saves the image to storage bucket
   *
   * @param userId the userId of the user uploading
   * @param filename name of the image to upload
   * @param imageBytesAsBase64String image bytes
   * @param imageFileExtension image file extension, will be appended to the filename
   * @returns The public bucketURL of the saved image
   */
  uploadProfilePicture: (
    userId: string,
    filename: string,
    imageBytesAsBase64String: string,
    imageFileExtension: string,
  ) => Promise<string>;

  /**
   * Deletes the image at the stored location
   *
   * @param filename name of the image to delete
   * @param userId optional userId, will throw if filename does not include the userId
   * @returns void
   */
  deleteProfilePicture: (filename: string, userId?: string) => Promise<void>;
}
