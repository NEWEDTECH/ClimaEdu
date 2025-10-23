/**
 * Interface for storage service
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface StorageService {
  /**
   * Upload an image file to storage
   * @param file File to upload
   * @param path Path where the file will be stored
   * @returns Promise with the download URL
   */
  uploadImage(file: File, path: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param path Path of the file to delete
   * @returns Promise<void>
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Get download URL for a file
   * @param path Path of the file
   * @returns Promise with the download URL
   */
  getDownloadUrl(path: string): Promise<string>;
}
