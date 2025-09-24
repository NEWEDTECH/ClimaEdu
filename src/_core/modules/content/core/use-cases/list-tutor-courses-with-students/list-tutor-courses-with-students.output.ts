import type { Course } from '../../entities/Course';
import type { User } from '../../../../user/core/entities/User';

/**
 * Course with its enrolled students
 */
export interface CourseWithStudents {
  /**
   * The course information
   */
  course: Course;

  /**
   * List of students enrolled in this course
   */
  students: User[];

  /**
   * Total number of students enrolled
   */
  totalStudents: number;
}

/**
 * Output data for listing tutor courses with their students
 */
export interface ListTutorCoursesWithStudentsOutput {
  /**
   * List of courses with their students
   */
  coursesWithStudents: CourseWithStudents[];

  /**
   * Total number of courses
   */
  totalCourses: number;

  /**
   * Total number of students across all courses
   */
  totalStudents: number;
}
