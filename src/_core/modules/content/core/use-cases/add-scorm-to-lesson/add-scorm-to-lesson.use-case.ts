import { inject, injectable } from 'inversify';
import { AddScormToLessonInput } from './add-scorm-to-lesson.input';
import { AddScormToLessonOutput } from './add-scorm-to-lesson.output';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { IScormContentRepository } from '../../../infrastructure/repositories/ScormContentRepository';
import { Content, ContentType } from '../../entities';
import { randomUUID } from 'crypto';

@injectable()
export class AddScormToLessonUseCase {
  constructor(
    @inject('LessonRepository')
    private readonly lessonRepository: LessonRepository,
    @inject('IScormContentRepository')
    private readonly scormContentRepository: IScormContentRepository
  ) {}

  async execute(
    input: AddScormToLessonInput
  ): Promise<AddScormToLessonOutput> {
    const { lessonId, scormContentId, name } = input;

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found.');
    }

    const scormContent = await this.scormContentRepository.findById(
      scormContentId
    );
    if (!scormContent) {
      throw new Error('SCORM content not found.');
    }

    const newContent = Content.create({
      id: randomUUID(),
      lessonId: lesson.id,
      title: name,
      type: ContentType.SCORM,
      url: scormContentId,
    });

    lesson.contents.push(newContent);

    await this.lessonRepository.save(lesson);

    return { success: true };
  }
}
