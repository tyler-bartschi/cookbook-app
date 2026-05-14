export interface ImageDao {
  /**
   * Saves the image to storage bucket
   * 
   * @param filename name of the image to upload
   * @param imageBytesAsBase64String image bytes
   * @param imageFileExtension image file extension, will be appended to the filename
   * @returns The public bucket URL of the saved image
   */
  uploadProfilePicture: (
    filename: string,
    imageBytesAsBase64String: string,
    imageFileExtension: string,
  ) => Promise<string>;
}
