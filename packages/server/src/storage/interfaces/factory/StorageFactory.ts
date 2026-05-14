import { ImageStorage } from "../ImageStorage.js";

export interface StorageFactory {
  /**
   * 
   * @returns the initialized ImageStorage
   */
  getImageStorage: () => ImageStorage;
}