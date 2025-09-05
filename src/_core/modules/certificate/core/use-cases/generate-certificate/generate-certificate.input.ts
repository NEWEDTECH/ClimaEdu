/**
 * Input for generating a certificate
 */
export interface GenerateCertificateInput {
  userId: string;
  courseId: string;
  institutionId: string;
  courseName: string;
  studentName?: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
  completionDate?: Date;
}