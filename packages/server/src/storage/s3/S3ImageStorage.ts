import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { serverConfig } from "../../config/serverConfig.js";
import { ImageStorage } from "../interfaces/ImageStorage.js";
import { ObjectUploadError } from "../../model/errors/error-code/ObjectUploadError.js";
import { ObjectDeleteError } from "../../model/errors/error-code/ObjectDeleteError.js";

export class S3ImageStorage implements ImageStorage {
  private readonly _bucketName: string = serverConfig.profilePictures.bucketName;
  private readonly _bucketRegion: string = serverConfig.profilePictures.bucketRegion;

  private readonly _client = new S3Client({ region: this._bucketRegion });

  public async uploadProfilePicture(
    filename: string,
    imageBytesAsBase64String: string,
    imageFileExtension: string,
  ): Promise<string> {
    const params = {
      Bucket: this._bucketName,
      Key: `profile-pictures/${filename}.${imageFileExtension}`,
      Body: Buffer.from(imageBytesAsBase64String, "base64"),
      ContentType: `image/${imageFileExtension}`,
    };

    try {
      await this._client.send(new PutObjectCommand(params));
      return `https://${this._bucketName}.s3.${this._bucketRegion}.amazonaws.com/profile-pictures/${filename}.${imageFileExtension}`;
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      console.error(
        "An error uploading a profile picture occured with message: " + message + " and error:",
        error,
      );
      throw new ObjectUploadError(message);
    }
  }

  public async deleteProfilePicture(filename: string): Promise<void> {
    const params = { Bucket: this._bucketName, Key: `profile-pictures/${filename}` };

    try {
      await this._client.send(new DeleteObjectCommand(params));
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      console.error(
        "An error occured deleting a profile picture with message: " + message + " and error:",
        error,
      );
      throw new ObjectDeleteError(message);
    }
  }
}
