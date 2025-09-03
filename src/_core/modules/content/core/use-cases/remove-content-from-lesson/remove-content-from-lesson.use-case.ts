import { inject, injectable } from 'inversify';
import { storage } from '@/_core/shared/firebase/firebase-client';
import { ref, deleteObject } from 'firebase/storage';
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

    // Delete file from Firebase Storage if it's a PDF or MP3
    if (contentToRemove.type === ContentType.PDF || contentToRemove.type === ContentType.PODCAST) {
      try {
        await this.deleteFileFromStorage(contentToRemove.url);
      } catch (error) {
        console.warn('Error deleting file from storage:', error);
        // Continue with deletion even if storage deletion fails
      }
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

  private async deleteFileFromStorage(url: string): Promise<void> {
    let storagePath: string;
    
    if (url.includes('#storagePath=')) {
      // Novo formato: URL#storagePath=encodedPath
      const hashPart = url.split('#storagePath=')[1];
      storagePath = decodeURIComponent(hashPart);
    } else {
      // Formato antigo: tentar extrair da URL do Firebase Storage
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/) || urlObj.pathname.match(/\/o\/(.+)$/);
      if (pathMatch) {
        storagePath = decodeURIComponent(pathMatch[1]);
      } else {
        // Fallback: tentar extrair do pathname
        const fullPath = urlObj.pathname.replace('/v0/b/', '').replace('/o/', '');
        if (fullPath) {
          storagePath = decodeURIComponent(fullPath.split('?')[0]);
        } else {
          throw new Error('Unable to extract storage path from URL');
        }
      }
    }

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  }
}
