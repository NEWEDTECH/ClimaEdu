import { injectable, inject } from 'inversify';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ActivitySubmissionRepository } from '../../../infrastructure/repositories/ActivitySubmissionRepository';
import type { QuestionnaireSubmissionRepository } from '../../../infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { UpdateContentProgressInput } from './update-content-progress.input';
import type { UpdateContentProgressOutput } from './update-content-progress.output';
import { Register } from '@/_core/shared/container';

@injectable()
export class UpdateContentProgressUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private lessonProgressRepository: LessonProgressRepository,

    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository,

    @inject(Register.content.repository.ActivitySubmissionRepository)
    private activitySubmissionRepository: ActivitySubmissionRepository,

    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,
  ) {}

  async execute(input: UpdateContentProgressInput): Promise<UpdateContentProgressOutput> {
    this.validateInput(input);

    const lessonProgress = await this.lessonProgressRepository.findByUserAndLesson(
      input.userId,
      input.lessonId
    );

    if (!lessonProgress) {
      throw new Error(
        `Lesson progress not found for user ${input.userId} and lesson ${input.lessonId}. ` +
        'Please start the lesson first.'
      );
    }

    const contentProgress = lessonProgress.getContentProgress(input.contentId);
    if (!contentProgress) {
      throw new Error(
        `Content ${input.contentId} not found in lesson progress ${lessonProgress.id}`
      );
    }

    const wasContentCompleted = contentProgress.isCompleted();
    const wasLessonCompleted = lessonProgress.isCompleted();

    lessonProgress.updateContentProgress(
      input.contentId,
      input.progressPercentage,
      input.timeSpent,
      input.lastPosition
    );

    // If the entity auto-completed the lesson based on content only, verify prerequisites
    // and revert if they are not yet satisfied.
    if (lessonProgress.isCompleted() && !wasLessonCompleted) {
      const lesson = await this.lessonRepository.findById(input.lessonId);

      const activityRequired = !!lesson?.activity;
      const questionnaireRequired = !!lesson?.questionnaire;

      let activitySubmitted = false;
      let questionnaireApproved = false;

      if (activityRequired && lesson?.activity) {
        const submissions = await this.activitySubmissionRepository.findByActivityAndStudent(
          lesson.activity.id,
          input.userId
        );
        activitySubmitted = submissions.length > 0;
      }

      if (questionnaireRequired && lesson?.questionnaire) {
        const submissions = await this.questionnaireSubmissionRepository.findByQuestionnaireAndUser(
          lesson.questionnaire.id,
          input.userId
        );
        questionnaireApproved = submissions.some(s => s.passed);
      }

      lessonProgress.checkAndUpdateLessonCompletion({
        activityRequired,
        activitySubmitted,
        questionnaireRequired,
        questionnaireApproved,
      });
    }

    const savedProgress = await this.lessonProgressRepository.save(lessonProgress);

    const isContentCompleted = contentProgress.isCompleted();
    const isLessonCompleted = savedProgress.isCompleted();

    const contentCompleted = !wasContentCompleted && isContentCompleted;
    const lessonCompleted = !wasLessonCompleted && isLessonCompleted;

    return {
      lessonProgress: savedProgress,
      lessonCompleted,
      contentCompleted
    };
  }

  private validateInput(input: UpdateContentProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }

    if (!input.contentId || input.contentId.trim() === '') {
      throw new Error('Content ID is required');
    }

    if (input.progressPercentage < 0 || input.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    if (input.timeSpent !== undefined && input.timeSpent < 0) {
      throw new Error('Time spent cannot be negative');
    }

    if (input.lastPosition !== undefined && input.lastPosition < 0) {
      throw new Error('Last position cannot be negative');
    }
  }
}
