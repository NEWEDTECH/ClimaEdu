export interface UploadedFile {
  originalName: string;
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
}

export interface UploadActivityFilesOutput {
  uploadedFiles: UploadedFile[];
  metadata: {
    uploadedAt: Date;
    totalFiles: number;
  };
}