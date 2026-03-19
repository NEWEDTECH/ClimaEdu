export type ImageType = 'podcast' | 'course' | 'institution-logo' | 'institution-cover' | 'trail' | 'avatar';

export interface UploadImageInput {
  file: File;
  imageType: ImageType;
  institutionId?: string;
  userId?: string;
  fileName?: string;
}
