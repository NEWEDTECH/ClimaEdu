import { injectable, inject } from 'inversify';
import type { ActivityRepository } from '../../../infrastructure/repositories/ActivityRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Register } from '@/_core/shared/container';
import { CreateActivityInput } from './create-activity.input';
import { CreateActivityOutput } from './create-activity.output';
import { Activity } from '../../entities/Activity';

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

    // Generate ID and create activity entity
    const id = await this.activityRepository.generateId();
    const activity = Activity.create({
      id,
      lessonId: input.lessonId,
      description: input.description,
      instructions: input.instructions,
      resourceUrl: input.resourceUrl,
    });

    // Save the activity
    const savedActivity = await this.activityRepository.save(activity);

    // Attach activity to lesson in memory
    existingLesson.attachActivity(savedActivity);

    // Persist the updated lesson with the activity
    const updatedLesson = await this.lessonRepository.save(existingLesson);

    // Return both the created activity and the updated lesson
    return {
      activity: savedActivity,
      lesson: updatedLesson,
    };
  }
}
