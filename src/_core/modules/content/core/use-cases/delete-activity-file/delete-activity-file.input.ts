export interface DeleteActivityFileInput {
  filePath: string;
  studentId: string; // para validação de permissão
  institutionId: string;
  activityId: string;
}