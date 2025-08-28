export interface UploadActivityFilesInput {
  activityId: string;
  studentId: string;
  institutionId: string;
  files: File[];
}