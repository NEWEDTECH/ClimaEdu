import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Course progress data for a single course
 */
export interface CourseProgressData {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  enrollmentId: string;
  enrolledAt: Date;
  completedAt?: Date;
  
  // Progress metrics
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  
  // Activity metrics
  lastAccessedAt?: Date;
  totalTimeSpent: number; // in minutes
  
  // Status
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  
  // Pending items
  pendingLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
  }>;
}

/**
 * Output DTO for student course progress report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateStudentCourseProgressReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Student info
  studentId: string;
  studentName: string;
  
  // Summary metrics
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  overallProgressPercentage: number;
  totalStudyTime: number; // in minutes
  
  // Detailed course data
  courses: CourseProgressData[];
  
  // Insights
  mostRecentActivity?: Date;
  averageProgressPerCourse: number;
  estimatedCompletionDays?: number;
}
