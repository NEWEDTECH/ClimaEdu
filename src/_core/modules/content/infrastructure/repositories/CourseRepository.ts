import { Course } from '../../core/entities/Course';

/**
 * Data transfer object for creating a course
 */
export interface CreateCourseDTO {
  institutionId: string;
  title: string;
  description: string;
}

/**
 * Interface for the Course repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface CourseRepository {
  /**
   * Create a new course
   * @param courseData Course data for creation
   * @returns Created course with id
   */
  create(courseData: CreateCourseDTO): Promise<Course>;

  /**
   * Find a course by id
   * @param id Course id
   * @returns Course or null if not found
   */
  findById(id: string): Promise<Course | null>;

  /**
   * Update a course
   * @param id Course id
   * @param course Course data to update
   * @returns Updated course
   */
  update(id: string, course: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Course>;

  /**
   * Delete a course
   * @param id Course id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List courses by institution
   * @param institutionId Institution id
   * @returns List of courses
   */
  listByInstitution(institutionId: string): Promise<Course[]>;
}
