import { injectable, inject } from 'inversify';
import { LessonProgress } from '../../entities/LessonProgress';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { StartLessonProgressInput } from './start-lesson-progress.input';
import type { StartLessonProgressOutput } from './start-lesson-progress.output';

/**
 * Use case for starting lesson progress
 * Creates a new lesson progress if it doesn't exist, or returns the existing one
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class StartLessonProgressUseCase {
  constructor(
    @inject('LessonProgressRepository')
    private lessonProgressRepository: LessonProgressRepository,
    @inject('LessonRepository')
    private lessonRepository: LessonRepository
  ) {}

  /**
   * Executes the start lesson progress use case
   * @param input StartLessonProgressInput
   * @returns StartLessonProgressOutput
   * @throws Error if validation fails or lesson is not found
   */
  async execute(input: StartLessonProgressInput): Promise<StartLessonProgressOutput> {
    // Validate input
    this.validateInput(input);

    // Check if lesson progress already exists
    const existingProgress = await this.lessonProgressRepository.findByUserAndLesson(
      input.userId,
      input.lessonId
    );

    if (existingProgress) {
      // Update last accessed timestamp and return existing progress
      existingProgress.touch();
      const updatedProgress = await this.lessonProgressRepository.save(existingProgress);
      
      return {
        lessonProgress: updatedProgress,
        isNew: false
      };
    }

    // Get lesson to extract content IDs
    const lesson = await this.lessonRepository.findById(input.lessonId);
    if (!lesson) {
      throw new Error(`Lesson with ID ${input.lessonId} not found`);
    }

    // Extract content IDs from the lesson
    const contentIds = lesson.contents.map(content => content.id);

    if (contentIds.length === 0) {
      throw new Error(`Lesson ${input.lessonId} has no contents to track progress for`);
    }

    // Generate new ID for lesson progress
    const progressId = await this.lessonProgressRepository.generateId();

    // Create new lesson progress
    const newLessonProgress = LessonProgress.create({
      id: progressId,
      userId: input.userId,
      lessonId: input.lessonId,
      institutionId: input.institutionId,
      contentIds
    });

    // Save the new lesson progress
    const savedProgress = await this.lessonProgressRepository.save(newLessonProgress);

    return {
      lessonProgress: savedProgress,
      isNew: true
    };
  }

  /**
   * Validates the input parameters
   * @param input StartLessonProgressInput
   * @throws Error if validation fails
   */
  private validateInput(input: StartLessonProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }
  }
}
