export interface UploadPdfToLessonOutput {
  success: boolean;
  contentId?: string;
  downloadUrl?: string;
  storagePath?: string;
  message?: string;
}