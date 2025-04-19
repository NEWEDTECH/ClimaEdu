import { injectable, inject } from 'inversify';
import type { ActivityRepository } from '../../../infrastructure/repositories/ActivityRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Register } from '@/_core/shared/container';
import { CreateActivityInput } from './create-activity.input';
import { CreateActivityOutput } from './create-activity.output';

/**
 * Use case for creating an activity for a lesson
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class CreateActivityUseCase {
  constructor(
    @inject(Register.content.repository.ActivityRepository)
    private activityRepository: ActivityRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if lesson not found, activity already exists, or validation fails
   */
  async execute(input: CreateActivityInput): Promise<CreateActivityOutput> {
    // Verify that the lesson exists
    const existingLesson = await this.lessonRepository.findById(input.lessonId);
    if (!existingLesson) {
      throw new Error(`Lesson with ID ${input.lessonId} not found`);
    }

    // Check if the lesson already has an activity
    const existingActivity = await this.activityRepository.findByLessonId(input.lessonId);
    if (existingActivity) {
      throw new Error(`Lesson with ID ${input.lessonId} already has an activity`);
    }

    // Persist the activity
    const createdActivity = await this.activityRepository.create({
      lessonId: input.lessonId,
      description: input.description,
      instructions: input.instructions,
      resourceUrl: input.resourceUrl,
    });

    // Attach activity to lesson in memory
    existingLesson.attachActivity(createdActivity);

    // Persist the updated lesson with the activity
    const updatedLesson = await this.lessonRepository.save(existingLesson);

    // Return both the created activity and the updated lesson
    return {
      activity: createdActivity,
      lesson: updatedLesson,
    };
  }
}
