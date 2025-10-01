import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { GetCourseProgressInput } from './get-course-progress.input';
import type { GetCourseProgressOutput } from './get-course-progress.output';
import { LessonProgressStatus } from '../../entities/ProgressStatus';

/**
 * Use case for getting course progress
 * Calculates the average progress across all lessons in a course
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class GetCourseProgressUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository
  ) {}

  /**
   * Executes the get course progress use case
   * @param input GetCourseProgressInput
   * @returns GetCourseProgressOutput
   * @throws Error if validation fails or course is not found
   */
  async execute(input: GetCourseProgressInput): Promise<GetCourseProgressOutput> {
    // Validate input
    this.validateInput(input);

    // Find the course
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      throw new Error(`Course with ID ${input.courseId} not found`);
    }

    // Get all lesson IDs from all modules in the course
    const allLessonIds: string[] = [];
    let totalLessonsInCourse = 0;
    
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        allLessonIds.push(lesson.id);
        totalLessonsInCourse++;
      }
    }

    // If no lessons found in course structure
    if (allLessonIds.length === 0) {
      return {
        progressPercentage: 0,
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        notStartedLessons: 0
      };
    }

    // Get progress for all lessons
    const lessonProgressList = await Promise.all(
      allLessonIds.map(lessonId =>
        this.lessonProgressRepository.findByUserAndLesson(input.userId, lessonId)
      )
    );

    // Calculate statistics
    let completedLessons = 0;
    let inProgressLessons = 0;
    let notStartedLessons = 0;
    let totalProgress = 0;

    lessonProgressList.forEach(progress => {
      if (!progress) {
        notStartedLessons++;
        return;
      }

      if (progress.status === LessonProgressStatus.COMPLETED) {
        completedLessons++;
        totalProgress += 100;
      } else if (progress.status === LessonProgressStatus.IN_PROGRESS) {
        inProgressLessons++;
        // Calculate average progress of content progresses
        const contentProgresses = progress.contentProgresses;
        if (contentProgresses && contentProgresses.length > 0) {
          const lessonProgress = contentProgresses.reduce(
            (sum: number, cp) => sum + cp.progressPercentage,
            0
          ) / contentProgresses.length;
          totalProgress += lessonProgress;
        }
      } else {
        notStartedLessons++;
      }
    });

    // Calculate average progress percentage
    const progressPercentage = totalLessonsInCourse > 0 
      ? Math.round(totalProgress / totalLessonsInCourse) 
      : 0;

    return {
      progressPercentage,
      totalLessons: totalLessonsInCourse,
      completedLessons,
      inProgressLessons,
      notStartedLessons
    };
  }

  /**
   * Validates the input parameters
   * @param input GetCourseProgressInput
   * @throws Error if validation fails
   */
  private validateInput(input: GetCourseProgressInput): void {
    if (!input.courseId || input.courseId.trim() === '') {
      throw new Error('Course ID is required');
    }

    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }
  }
}
