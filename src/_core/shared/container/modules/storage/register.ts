import { Container } from 'inversify';
import { services, useCases } from './symbols';

// Import implementations
import type { StorageService } from '@/_core/modules/storage/infrastructure/services/StorageService';
import { FirebaseStorageService } from '@/_core/modules/storage/infrastructure/implementations/FirebaseStorageService';
import { UploadImageUseCase } from '@/_core/modules/storage/core/use-cases/upload-image/upload-image.use-case';

/**
 * Register Storage module dependencies
 * @param container The DI container
 */
export function registerStorageModule(container: Container): void {
  // Register services
  container.bind<StorageService>(services.StorageService).to(FirebaseStorageService);
  
  // Register use cases
  container.bind(useCases.UploadImageUseCase).to(UploadImageUseCase);
}
