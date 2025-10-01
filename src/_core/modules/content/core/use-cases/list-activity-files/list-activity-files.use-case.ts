import { injectable } from 'inversify';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { ListActivityFilesInput } from './list-activity-files.input';
import { ListActivityFilesOutput, ActivityFile } from './list-activity-files.output';

@injectable()
export class ListActivityFilesUseCase {
  async execute(input: ListActivityFilesInput): Promise<ListActivityFilesOutput> {
    const { activityId, studentId, institutionId } = input;

    // Gerar path base
    const basePath = `activities/${institutionId}/${activityId}/${studentId}`;
    
    try {
      // Primeiro, tentar carregar metadata.json se existir
      const metadata = await this.loadMetadata(basePath);
      
      if (metadata) {
        // Se temos metadata, usar essas informações para listar os arquivos
        return await this.listFilesFromMetadata(basePath, metadata);
      } else {
        // Caso contrário, listar arquivos diretamente do storage
        return await this.listFilesDirectly(basePath);
      }
    } catch (error) {
      // Se o diretório não existir, retornar lista vazia
      if (error instanceof Error && error.message.includes('does not exist')) {
        return {
          files: [],
          totalFiles: 0
        };
      }
      
      throw new Error(`Failed to list activity files: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      // Metadata não existe, tudo bem
      return null;
    }
  }

  private async listFilesFromMetadata(basePath: string, metadata: Record<string, unknown>): Promise<ListActivityFilesOutput> {
    const files: ActivityFile[] = [];

    const metadataFiles = metadata.files as Array<{
      storagePath: string;
      originalName: string;
      uploadedAt: string;
      sizeBytes: number;
    }> || [];

    for (const fileInfo of metadataFiles) {
      try {
        const fileRef = ref(storage, fileInfo.storagePath);
        const downloadUrl = await getDownloadURL(fileRef);
        
        files.push({
          name: fileInfo.originalName,
          downloadUrl,
          uploadedAt: new Date(fileInfo.uploadedAt),
          sizeBytes: fileInfo.sizeBytes,
          storagePath: fileInfo.storagePath
        });
      } catch {
        // Arquivo pode ter sido deletado, continuar com os outros
        console.warn(`File ${fileInfo.originalName} not found in storage`);
      }
    }

    return {
      files,
      totalFiles: files.length
    };
  }

  private async listFilesDirectly(basePath: string): Promise<ListActivityFilesOutput> {
    const storageRef = ref(storage, basePath);
    const result = await listAll(storageRef);
    
    const files: ActivityFile[] = [];

    for (const itemRef of result.items) {
      // Pular metadata.json
      if (itemRef.name === 'metadata.json') {
        continue;
      }

      try {
        const [downloadUrl, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef)
        ]);

        files.push({
          name: itemRef.name,
          downloadUrl,
          uploadedAt: new Date(metadata.timeCreated),
          sizeBytes: metadata.size,
          storagePath: itemRef.fullPath
        });
      } catch {
        console.warn(`Failed to get info for file ${itemRef.name}`);
      }
    }

    // Ordenar por data de upload (mais recente primeiro)
    files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    return {
      files,
      totalFiles: files.length
    };
  }
}