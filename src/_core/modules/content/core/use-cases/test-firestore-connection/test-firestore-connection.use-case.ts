import { inject, injectable } from 'inversify';
import type { IScormContentRepository } from '../../../infrastructure/repositories/ScormContentRepository';

interface TestFirestoreConnectionOutput {
  success: boolean;
  message: string;
  details?: {
    documentsFound?: number;
    collectionAccess?: boolean;
    error?: unknown;
  };
}

@injectable()
export class TestFirestoreConnectionUseCase {
  constructor(
    @inject('IScormContentRepository')
    private scormContentRepository: IScormContentRepository
  ) {}

  async execute(institutionId: string = 'test-institution'): Promise<TestFirestoreConnectionOutput> {
    try {
      console.log('🧪 Testing Firestore connection...');
      console.log(`🧪 Attempting to query scorm_content for institution: ${institutionId}`);

      // Use findByInstitutionId - this is the exact method that fails in production
      // This makes a Firestore query with .where() clause, same as the failing route
      const contents = await this.scormContentRepository.findByInstitutionId(institutionId);

      console.log(`✅ Firestore query successful! Found ${contents.length} documents`);

      return {
        success: true,
        message: 'Firestore connection successful',
        details: {
          documentsFound: contents.length,
          collectionAccess: true,
        },
      };
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          } : error,
        },
      };
    }
  }
}
