import { inject, injectable } from 'inversify';
import { RemoveContentFromLessonInput } from './remove-content-from-lesson.input';
import { RemoveContentFromLessonOutput } from './remove-content-from-lesson.output';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository';
import { ContentType } from '../../entities';
import { Register } from '@/_core/shared/container';

@injectable()
export class RemoveContentFromLessonUseCase {
  constructor(
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    @inject(Register.content.repository.ContentRepository)
    private readonly contentRepository: ContentRepository
  ) {}

  async execute(
    input: RemoveContentFromLessonInput
  ): Promise<RemoveContentFromLessonOutput> {
    const { lessonId, contentId } = input;

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found.');
    }

    const contentToRemove = lesson.contents.find(c => c.id === contentId);
    if (!contentToRemove) {
      throw new Error('Content not found in this lesson.');
    }

    // Only delete the content entry if it's not a reusable type like SCORM
    if (contentToRemove.type !== ContentType.SCORM) {
      await this.contentRepository.delete(contentId);
    }

    // Always remove the association from the lesson
    lesson.contents = lesson.contents.filter(c => c.id !== contentId);
    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
