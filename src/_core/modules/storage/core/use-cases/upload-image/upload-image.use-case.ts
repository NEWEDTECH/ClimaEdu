import { injectable, inject } from 'inversify';
import type { StorageService } from '../../../infrastructure/services/StorageService';
import { UploadImageInput } from './upload-image.input';
import { UploadImageOutput } from './upload-image.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for uploading images to storage
 * Following Clean Architecture principles, this use case depends only on the service interface
 */
@injectable()
export class UploadImageUseCase {
  constructor(
    @inject(Register.storage.service.StorageService)
    private storageService: StorageService
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UploadImageInput): Promise<UploadImageOutput> {
    try {
      // Validate file
      if (!input.file) {
        return {
          success: false,
          message: 'Nenhum arquivo fornecido',
        };
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(input.file.type)) {
        return {
          success: false,
          message: 'Tipo de arquivo inválido. Use JPEG, PNG, WEBP ou GIF',
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (input.file.size > maxSize) {
        return {
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 5MB',
        };
      }

      // Generate file name if not provided
      const timestamp = Date.now();
      const fileExtension = input.file.name.split('.').pop() || 'jpg';
      const fileName = input.fileName || `${timestamp}.${fileExtension}`;

      // Build storage path: institutions/{institutionId}/{imageType}/{fileName}
      const filePath = `institutions/${input.institutionId}/${input.imageType}/${fileName}`;

      // Upload the file
      const downloadUrl = await this.storageService.uploadImage(input.file, filePath);

      return {
        success: true,
        downloadUrl,
        filePath,
        message: 'Imagem enviada com sucesso',
      };
    } catch (error) {
      console.error('Error in UploadImageUseCase:', error);
      return {
        success: false,
        message: 'Erro ao fazer upload da imagem',
      };
    }
  }
}
