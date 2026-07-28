import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { serverConfig } from "../../config/serverConfig.js";
import { ImageStorage } from "../interfaces/ImageStorage.js";
import { ObjectUploadError } from "../../model/errors/error-code/ObjectUploadError.js";
import { ObjectDeleteError } from "../../model/errors/error-code/ObjectDeleteError.js";

export class S3ImageStorage implements ImageStorage {
  private readonly _bucketName: string = serverConfig.profilePictures.bucketName;
  private readonly _bucketRegion: string = serverConfig.profilePictures.bucketRegion;
  private readonly _cloudfrontUrl: string = serverConfig.profilePictures.cloudfrontUrl.replace(/\/+$/, "");

  private readonly _client = new S3Client({ region: this._bucketRegion });

  public async uploadProfilePicture(
    userId: string,
    filename: string,
    imageBytesAsBase64String: string,
    imageFileExtension: string,
  ): Promise<string> {
    const key: string = `profile-pictures/${userId}/${filename}.${imageFileExtension}`;
    const params = {
      Bucket: this._bucketName,
      Key: key,
      Body: Buffer.from(imageBytesAsBase64String, "base64"),
      ContentType: `image/${imageFileExtension}`,
    };

    try {
      await this._client.send(new PutObjectCommand(params));
      return `${this._cloudfrontUrl}/${key}`;
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      console.error(
        "An error uploading a profile picture occured with message: " + message + " and error:",
        error,
      );
      throw new ObjectUploadError(message);
    }
  }

  public async deleteProfilePicture(path: string, userId?: string): Promise<void> {
    try {
      const key: string = new URL(path).pathname.replace(/^\/+/, "");

      if (!key || !key.startsWith("profile-pictures/")) {
        throw new ObjectDeleteError("Invalid profile picture key");
      }

      if (userId && !key.startsWith(`profile-pictures/${userId}/`)) {
        throw new ObjectDeleteError("Profile picture does not belong to this user");
      }

      const params = { Bucket: this._bucketName, Key: key };

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
