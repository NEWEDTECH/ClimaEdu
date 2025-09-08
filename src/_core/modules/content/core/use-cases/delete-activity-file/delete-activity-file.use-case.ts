import { injectable } from 'inversify';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, deleteObject, getDownloadURL, uploadBytes } from 'firebase/storage';
import { DeleteActivityFileInput } from './delete-activity-file.input';
import { DeleteActivityFileOutput } from './delete-activity-file.output';

@injectable()
export class DeleteActivityFileUseCase {
  async execute(input: DeleteActivityFileInput): Promise<DeleteActivityFileOutput> {
    const { filePath, studentId, institutionId, activityId } = input;

    try {
      // Validar se o arquivo pertence ao student correto
      const expectedBasePath = `activities/${institutionId}/${activityId}/${studentId}`;
      if (!filePath.startsWith(expectedBasePath)) {
        throw new Error('Unauthorized: File does not belong to this student');
      }

      // Validar se não é o metadata.json (não pode ser deletado diretamente)
      if (filePath.endsWith('metadata.json')) {
        throw new Error('Cannot delete metadata file directly');
      }

      // Deletar o arquivo
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);

      // Atualizar metadata removendo a referência do arquivo deletado
      await this.updateMetadataAfterDeletion(expectedBasePath, filePath);

      // Contar arquivos restantes
      const remainingFiles = await this.countRemainingFiles(expectedBasePath);

      return {
        success: true,
        message: 'File deleted successfully',
        remainingFiles
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw error;
      }
      
      return {
        success: false,
        message: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        remainingFiles: 0
      };
    }
  }

  private async updateMetadataAfterDeletion(basePath: string, deletedFilePath: string): Promise<void> {
    try {
      // Carregar metadata atual
      const metadata = await this.loadMetadata(basePath);
      
      if (metadata && metadata.files) {
        // Filtrar o arquivo deletado
        const files = metadata.files as Array<{ storagePath: string; originalName: string; uploadedAt: string; sizeBytes: number }>;
        const updatedFiles = files.filter(
          (file: { storagePath: string }) => file.storagePath !== deletedFilePath
        );

        // Atualizar metadata
        const updatedMetadata = {
          ...metadata,
          files: updatedFiles,
          totalFiles: updatedFiles.length,
          lastUpdated: new Date().toISOString()
        };

        // Salvar metadata atualizado
        const metadataBlob = new Blob([JSON.stringify(updatedMetadata, null, 2)], {
          type: 'application/json'
        });
        
        const metadataRef = ref(storage, `${basePath}/metadata.json`);
        await uploadBytes(metadataRef, metadataBlob);
      }
    } catch (error) {
      // Se não conseguir atualizar metadata, não é um erro crítico
      console.warn('Failed to update metadata after file deletion:', error);
    }
  }

  private async loadMetadata(basePath: string): Promise<Record<string, unknown> | null> {
    try {
      const metadataRef = ref(storage, `${basePath}/metadata.json`);
      const metadataUrl = await getDownloadURL(metadataRef);
      
      const response = await fetch(metadataUrl);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  private async countRemainingFiles(basePath: string): Promise<number> {
    try {
      const metadata = await this.loadMetadata(basePath);
      if (metadata && metadata.files) {
        const files = metadata.files as Array<unknown>;
        return files.length;
      }
      return 0;
    } catch {
      return 0;
    }
  }
}