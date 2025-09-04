import { Certificate } from '@/_core/modules/certificate';

/**
 * Extended certificate interface with course and institution details
 * Used in the UI to display additional information not stored in the Certificate entity
 */
export interface CertificateWithDetails extends Certificate {
  courseTitle?: string;
  institutionName?: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
  completionDate?: Date;
}