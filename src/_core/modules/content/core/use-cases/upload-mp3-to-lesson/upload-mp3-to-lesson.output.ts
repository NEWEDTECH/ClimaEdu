export interface UploadMp3ToLessonOutput {
  success: boolean;
  contentId?: string;
  downloadUrl?: string;
  storagePath?: string;
  message?: string;
}