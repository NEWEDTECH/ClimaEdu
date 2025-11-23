export type ImageType = 'podcast' | 'course' | 'institution-logo' | 'institution-cover' | 'trail';

export interface UploadImageInput {
  file: File;
  imageType: ImageType;
  institutionId: string;
  fileName?: string;
}
