/**
 * Input data for creating a lesson
 */
export interface CreateLessonInput {
  moduleId: string;
  title: string;
  order?: number; // Optional: if not provided, lesson will be added at the end
}
