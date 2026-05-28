import { injectable, inject } from 'inversify';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ActivitySubmissionRepository } from '../../../infrastructure/repositories/ActivitySubmissionRepository';
import type { QuestionnaireSubmissionRepository } from '../../../infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { CompleteLessonProgressInput } from './complete-lesson-progress.input';
import type { CompleteLessonProgressOutput } from './complete-lesson-progress.output';
import { Register } from '@/_core/shared/container';
import type { EventBus } from '@/_core/shared/events/interfaces/EventBus';
import { LessonCompletedEvent } from '@/_core/modules/achievement/core/events/LessonCompletedEvent';
import { StudySessionEvent } from '@/_core/modules/achievement/core/events/StudySessionEvent';

@injectable()
export class CompleteLessonProgressUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private lessonProgressRepository: LessonProgressRepository,

    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository,

    @inject(Register.content.repository.ActivitySubmissionRepository)
    private activitySubmissionRepository: ActivitySubmissionRepository,

    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,

    @inject(Register.shared.service.EventBus)
    private eventBus: EventBus
  ) {}

  async execute(input: CompleteLessonProgressInput): Promise<CompleteLessonProgressOutput> {
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

    const wasAlreadyCompleted = lessonProgress.isCompleted();

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

    if (activityRequired && !activitySubmitted) {
      throw new Error('Você precisa submeter a atividade antes de concluir esta unidade.');
    }

    if (questionnaireRequired && !questionnaireApproved) {
      throw new Error('Você precisa ser aprovado no questionário antes de concluir esta unidade.');
    }

    if (input.contentTypesMap) {
      lessonProgress.completeWithContentTypeLogic(input.contentTypesMap);
    } else {
      lessonProgress.forceComplete();
    }

    console.log('🔎 Saving completed lesson progress:', lessonProgress);
    const savedProgress = await this.lessonProgressRepository.save(lessonProgress);

    if (savedProgress.isCompleted() && !wasAlreadyCompleted) {
      try {
        const lessonCompletedEvent = LessonCompletedEvent.create({
          userId: savedProgress.userId,
          institutionId: savedProgress.institutionId,
          lessonId: savedProgress.lessonId,
          moduleId: input.moduleId || lesson?.moduleId || '',
          courseId: input.courseId || '',
          completionTime: savedProgress.getTotalTimeSpent(),
          score: savedProgress.calculateOverallProgress()
        });

        await this.eventBus.publish(lessonCompletedEvent);
        console.log('🎯 LessonCompletedEvent published for lesson:', savedProgress.lessonId);

        if (lesson) {
          const studySessionEvent = StudySessionEvent.create({
            userId: savedProgress.userId,
            institutionId: savedProgress.institutionId,
            sessionId: savedProgress.id,
            courseId: input.courseId || '',
            moduleId: lesson.moduleId,
            lessonId: savedProgress.lessonId,
            startTime: savedProgress.startedAt,
            endTime: savedProgress.completedAt || new Date(),
            duration: savedProgress.getTotalTimeSpent(),
            sessionType: 'LESSON',
            isCompleted: true
          });

          await this.eventBus.publish(studySessionEvent);
          console.log('📚 StudySessionEvent published for lesson:', savedProgress.lessonId);
        }
      } catch (error) {
        console.error('Failed to publish events:', error);
      }
    }

    return {
      lessonProgress: savedProgress,
      wasAlreadyCompleted
    };
  }

  private validateInput(input: CompleteLessonProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }
  }
}
