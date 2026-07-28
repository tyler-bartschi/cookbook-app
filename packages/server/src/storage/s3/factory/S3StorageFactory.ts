import { StorageFactory } from "../../interfaces/factory/StorageFactory.js";
import { ImageStorage } from "../../interfaces/ImageStorage.js";
import { S3ImageStorage } from "../S3ImageStorage.js";

export class S3StorageFactory implements StorageFactory {
  private _imageStorage: ImageStorage;

  public constructor() {
    this._imageStorage = new S3ImageStorage();
  }

  public getImageStorage(): ImageStorage {
    return this._imageStorage;
  }
}
