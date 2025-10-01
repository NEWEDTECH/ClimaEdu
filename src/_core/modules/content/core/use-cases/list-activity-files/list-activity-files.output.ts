export interface ActivityFile {
  name: string;
  downloadUrl: string;
  uploadedAt: Date;
  sizeBytes: number;
  storagePath: string;
}

export interface ListActivityFilesOutput {
  files: ActivityFile[];
  totalFiles: number;
}