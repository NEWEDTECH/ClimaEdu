import { injectable } from 'inversify';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { StorageService } from '../services/StorageService';

/**
 * Firebase implementation of the StorageService
 */
@injectable()
export class FirebaseStorageService implements StorageService {
  /**
   * Upload an image file to Firebase Storage
   * @param file File to upload
   * @param path Path where the file will be stored
   * @returns Promise with the download URL
   */
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      console.log(`📤 Uploading image to: ${path}`);
      
      // Create a storage reference
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      
      console.log(`✅ Image uploaded successfully`);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      console.log(`🔗 Download URL: ${downloadUrl}`);
      
      return downloadUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param path Path of the file to delete
   * @returns Promise<void>
   */
  async deleteFile(path: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting file: ${path}`);
      
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      console.log(`✅ File deleted successfully`);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a file
   * @param path Path of the file
   * @returns Promise with the download URL
   */
  async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (error) {
      console.error('❌ Error getting download URL:', error);
      throw error;
    }
  }
}
