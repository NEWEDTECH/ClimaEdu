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
    console.log('[GetCourseProgressUseCase] Starting execution with input:', input);

    // Validate input
    this.validateInput(input);

    // Find the course
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      console.error('[GetCourseProgressUseCase] Course not found:', input.courseId);
      throw new Error(`Course with ID ${input.courseId} not found`);
    }

    console.log('[GetCourseProgressUseCase] Course found:', {
      courseId: course.id,
      title: course.title,
      modulesCount: course.modules.length
    });

    // Get all lesson IDs from all modules in the course
    const allLessonIds: string[] = [];
    let totalLessonsInCourse = 0;
    
    for (const courseModule of course.modules) {
      console.log('[GetCourseProgressUseCase] Processing module:', {
        moduleId: courseModule.id,
        title: courseModule.title,
        lessonsCount: courseModule.lessons.length
      });
      for (const lesson of courseModule.lessons) {
        allLessonIds.push(lesson.id);
        totalLessonsInCourse++;
      }
    }

    console.log('[GetCourseProgressUseCase] Total lessons in course:', totalLessonsInCourse);
    console.log('[GetCourseProgressUseCase] Lesson IDs:', allLessonIds);

    // If no lessons found in course structure
    if (allLessonIds.length === 0) {
      console.warn('[GetCourseProgressUseCase] No lessons found in course');
      return {
        progressPercentage: 0,
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        notStartedLessons: 0
      };
    }

    // Fetch all lesson progresses for the user and institution at once
    // This is more efficient than querying each lesson individually
    const allUserProgressInInstitution = await this.lessonProgressRepository.findByUserAndInstitution(
      input.userId,
      input.institutionId
    );

    console.log('[GetCourseProgressUseCase] User progress records found:', allUserProgressInInstitution.length);
    console.log('[GetCourseProgressUseCase] Progress details:', allUserProgressInInstitution.map(p => ({
      lessonId: p.lessonId,
      status: p.status,
      contentProgresses: p.contentProgresses.length
    })));

    // Create a map for quick lookup of lesson progress by lessonId
    const progressMap = new Map<string, typeof allUserProgressInInstitution[0]>();
    allUserProgressInInstitution.forEach(progress => {
      progressMap.set(progress.lessonId, progress);
    });

    // Calculate statistics
    let completedLessons = 0;
    let inProgressLessons = 0;
    let notStartedLessons = 0;
    let totalProgress = 0;

    // Iterate through all lessons in the course and check their progress
    allLessonIds.forEach(lessonId => {
      const progress = progressMap.get(lessonId);

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

    const result = {
      progressPercentage,
      totalLessons: totalLessonsInCourse,
      completedLessons,
      inProgressLessons,
      notStartedLessons
    };

    console.log('[GetCourseProgressUseCase] Final result:', result);
    console.log('[GetCourseProgressUseCase] Total progress accumulated:', totalProgress);

    return result;
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
