/**
 * Input for completing a course
 */
export interface CompleteCourseInput {
  userId: string;
  courseId: string;
  institutionId: string;
  courseName?: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
}