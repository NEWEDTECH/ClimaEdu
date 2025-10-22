export type ImageType = 'podcast' | 'course' | 'institution-logo' | 'trail';

export interface UploadImageInput {
  file: File;
  imageType: ImageType;
  institutionId: string;
  fileName?: string;
}
