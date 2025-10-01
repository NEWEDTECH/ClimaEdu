export interface UploadPdfToLessonInput {
  lessonId: string;
  courseId: string;
  moduleId: string;
  institutionId: string;
  file: File;
  title: string;
}