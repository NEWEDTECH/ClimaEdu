export interface UploadMp3ToLessonInput {
  lessonId: string;
  courseId: string;
  moduleId: string;
  institutionId: string;
  file: File;
  title: string;
}