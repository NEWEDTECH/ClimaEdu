import { injectable } from 'inversify';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadActivityFilesInput } from './upload-activity-files.input';
import { UploadActivityFilesOutput, UploadedFile } from './upload-activity-files.output';

@injectable()
export class UploadActivityFilesUseCase {
  private readonly allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/zip'
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxFiles = 5;

  async execute(input: UploadActivityFilesInput): Promise<UploadActivityFilesOutput> {
    const { activityId, studentId, institutionId, files } = input;

    // Validações
    this.validateInput(files);

    // Gerar path base
    const basePath = `activities/${institutionId}/${activityId}/${studentId}`;
    
    const uploadedFiles: UploadedFile[] = [];
    
    try {
      // Upload de cada arquivo
      for (const file of files) {
        const sanitizedName = this.sanitizeFileName(file.name);
        const storagePath = `${basePath}/${sanitizedName}`;
        
        const storageRef = ref(storage, storagePath);
        
        // Upload do arquivo
        await uploadBytes(storageRef, file);
        
        // Obter URL de download
        const downloadUrl = await getDownloadURL(storageRef);
        
        uploadedFiles.push({
          originalName: file.name,
          downloadUrl,
          storagePath,
          sizeBytes: file.size
        });
      }

      // Criar e salvar metadata
      const metadata = {
        uploadedAt: new Date(),
        totalFiles: files.length,
        files: uploadedFiles.map(f => ({
          originalName: f.originalName,
          storagePath: f.storagePath,
          sizeBytes: f.sizeBytes,
          uploadedAt: new Date()
        }))
      };

      await this.saveMetadata(basePath, metadata);

      return {
        uploadedFiles,
        metadata: {
          uploadedAt: metadata.uploadedAt,
          totalFiles: metadata.totalFiles
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload activity files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateInput(files: File[]): void {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > this.maxFiles) {
      throw new Error(`Maximum ${this.maxFiles} files allowed`);
    }

    for (const file of files) {
      if (!this.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > this.maxFileSize) {
        throw new Error(`File ${file.name} exceeds maximum size of ${this.maxFileSize / (1024 * 1024)}MB`);
      }
    }
  }

  private sanitizeFileName(fileName: string): string {
    // Remove caracteres especiais e espaços
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  private async saveMetadata(basePath: string, metadata: Record<string, unknown>): Promise<void> {
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const metadataRef = ref(storage, `${basePath}/metadata.json`);
    await uploadBytes(metadataRef, metadataBlob);
  }
}