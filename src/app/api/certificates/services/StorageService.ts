import { inject, injectable } from 'inversify';
import { Bucket } from '@google-cloud/storage';

export interface UploadCertificateInput {
  pdfBuffer: Buffer;
  userId: string;
  courseId: string;
  institutionId: string;
}

export interface UploadCertificateOutput {
  certificateUrl: string;
  storagePath: string;
}

@injectable()
export class StorageService {
  constructor(
    @inject('Storage') private storage: Bucket
  ) {}

  async uploadCertificate(input: UploadCertificateInput): Promise<UploadCertificateOutput> {
    const { pdfBuffer, userId, courseId, institutionId } = input;
    
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${userId}_${courseId}_${timestamp}.pdf`;
    const storagePath = `certificates/${institutionId}/${fileName}`;
    
    // Create file reference
    const file = this.storage.file(storagePath);
    
    // Upload the PDF buffer
    await new Promise<void>((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            userId,
            courseId,
            institutionId,
            generatedAt: new Date().toISOString(),
          }
        },
      });
      
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(pdfBuffer);
    });
    
    // Make file publicly readable
    await file.makePublic();
    
    // Generate public URL
    const certificateUrl = `https://storage.googleapis.com/${this.storage.name}/${storagePath}`;
    
    return {
      certificateUrl,
      storagePath,
    };
  }
}