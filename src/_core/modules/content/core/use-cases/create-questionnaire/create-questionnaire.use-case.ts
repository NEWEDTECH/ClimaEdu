import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Register } from '@/_core/shared/container';
import { CreateQuestionnaireInput } from './create-questionnaire.input';
import { CreateQuestionnaireOutput } from './create-questionnaire.output';

/**
 * Use case for creating a questionnaire for a lesson
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class CreateQuestionnaireUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if lesson not found, questionnaire already exists, or validation fails
   */
  async execute(input: CreateQuestionnaireInput): Promise<CreateQuestionnaireOutput> {
    // Verify that the lesson exists
    const existingLesson = await this.lessonRepository.findById(input.lessonId);
    if (!existingLesson) {
      throw new Error(`Lesson with ID ${input.lessonId} not found`);
    }

    // Check if the lesson already has a questionnaire
    const existingQuestionnaire = await this.questionnaireRepository.findByLessonId(input.lessonId);
    if (existingQuestionnaire) {
      throw new Error(`Lesson with ID ${input.lessonId} already has a questionnaire`);
    }

    // Create questionnaire
    const createdQuestionnaire = await this.questionnaireRepository.create({
      lessonId: input.lessonId,
      title: input.title,
      maxAttempts: input.maxAttempts,
      passingScore: input.passingScore,
    });

    // Attach questionnaire to lesson
    existingLesson.attachQuestionnaire(createdQuestionnaire);

    // Save the updated lesson
    const updatedLesson = await this.lessonRepository.save(existingLesson);

    // Return both the created questionnaire and the updated lesson
    return {
      questionnaire: createdQuestionnaire,
      lesson: updatedLesson,
    };
  }
}
