import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { InstitutionRepository } from '../../../../institution/infrastructure/repositories/InstitutionRepository';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import type { CanAccessLessonInput } from './can-access-lesson.input';
import type { CanAccessLessonOutput } from './can-access-lesson.output';

/**
 * Use case for checking if a user can access a specific lesson
 * Validates based on institution's navigation settings and lesson prerequisites
 */
@injectable()
export class CanAccessLessonUseCase {
  constructor(
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository,
    @inject(Register.content.repository.LessonProgressRepository)
    private lessonProgressRepository: LessonProgressRepository,
    @inject(Register.content.repository.ModuleRepository)
    private moduleRepository: ModuleRepository,
    @inject(Register.institution.repository.InstitutionRepository)
    private institutionRepository: InstitutionRepository
  ) {}

  async execute(input: CanAccessLessonInput): Promise<CanAccessLessonOutput> {
    this.validateInput(input);

    // Get institution settings
    const institution = await this.institutionRepository.findById(input.institutionId);
    if (!institution) {
      throw new Error(`Institution with ID ${input.institutionId} not found`);
    }

    // Check institution navigation settings
    const requireSequential = institution.settings.requireSequentialProgress;
    const allowSkip = institution.settings.allowSkipLesson;
    
    // Get current lesson progress
    const currentLessonProgress = await this.lessonProgressRepository.findByUserAndLesson(
      input.userId,
      input.lessonId
    );

    const hasStarted = !!currentLessonProgress;
    const isCompleted = currentLessonProgress?.isCompleted() || false;

    // If lesson is already started or completed, allow access
    if (hasStarted) {
      return {
        canAccess: true,
        hasStarted: true,
        isCompleted: isCompleted
      };
    }

    // If sequential navigation is not required, allow access to any lesson
    if (!requireSequential) {
      return {
        canAccess: true,
        hasStarted: false,
        isCompleted: false
      };
    }

    // For sequential navigation, check if all previous lessons are completed
    const canAccessSequentially = await this.checkSequentialAccess(
      input.userId,
      input.lessonId,
      input.courseId,
      allowSkip
    );

    return {
      canAccess: canAccessSequentially.canAccess,
      reason: canAccessSequentially.reason,
      hasStarted: false,
      isCompleted: false,
      isSkippable: canAccessSequentially.isSkippable
    };
  }

  private async checkSequentialAccess(
    userId: string,
    lessonId: string,
    courseId: string,
    allowSkip: boolean
  ): Promise<{ canAccess: boolean; reason?: string; isSkippable?: boolean }> {
    try {
      // Get all modules for the course
      const modules = await this.moduleRepository.listByCourse(courseId);
      modules.sort((a, b) => a.order - b.order);

      // Find the target lesson and its position
      let targetModuleData: { id: string; lessons?: Array<{ id: string; order: number }> } | null = null;
      let targetLessonIndex = -1;

      for (const moduleData of modules) {
        const lessons = await this.lessonRepository.listByModule(moduleData.id);
        lessons.sort((a, b) => a.order - b.order);
        
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
          targetModuleData = { id: moduleData.id, lessons };
          targetLessonIndex = lessonIndex;
          // Store lessons in modules array for later use
          Object.assign(moduleData, { lessons });
          break;
        }
      }

      if (!targetModuleData || targetLessonIndex === -1) {
        throw new Error(`Lesson ${lessonId} not found in course ${courseId}`);
      }

      // If it's the first lesson of the first module, always allow access
      const moduleIndex = modules.findIndex(m => m.id === targetModuleData.id);
      if (moduleIndex === 0 && targetLessonIndex === 0) {
        return { canAccess: true, isSkippable: false };
      }

      // Check if all previous lessons are completed
      const incompleteLessons = await this.findIncompletePreviousLessons(
        userId,
        modules,
        moduleIndex,
        targetLessonIndex
      );

      if (incompleteLessons.length > 0) {
        // If allowSkip is enabled, allow access silently
        if (allowSkip) {
          return {
            canAccess: true,
            isSkippable: true
          };
        } else {
          return {
            canAccess: false,
            isSkippable: false
          };
        }
      }

      return { canAccess: true, isSkippable: false };
    } catch (error) {
      console.error('Error checking sequential access:', error);
      return {
        canAccess: false,
        reason: 'Erro ao verificar acesso à lição',
        isSkippable: false
      };
    }
  }

  private async findIncompletePreviousLessons(
    userId: string,
    modules: Array<{ id: string; lessons?: Array<{ id: string; order: number }> }>,
    targetModuleIndex: number,
    targetLessonIndex: number
  ): Promise<string[]> {
    const incompleteLessons: string[] = [];

    // Check all lessons in previous modules
    for (let moduleIdx = 0; moduleIdx < targetModuleIndex; moduleIdx++) {
      const moduleData = modules[moduleIdx];
      if (!moduleData.lessons) {
        const lessons = await this.lessonRepository.listByModule(moduleData.id);
        moduleData.lessons = lessons.sort((a, b) => a.order - b.order);
      }

      for (const lesson of moduleData.lessons) {
        const progress = await this.lessonProgressRepository.findByUserAndLesson(userId, lesson.id);
        if (!progress || !progress.isCompleted()) {
          incompleteLessons.push(lesson.id);
        }
      }
    }

    // Check previous lessons in the same module
    const targetModuleData = modules[targetModuleIndex];
    if (!targetModuleData.lessons) {
      const lessons = await this.lessonRepository.listByModule(targetModuleData.id);
      targetModuleData.lessons = lessons.sort((a, b) => a.order - b.order);
    }

    for (let lessonIdx = 0; lessonIdx < targetLessonIndex; lessonIdx++) {
      const lesson = targetModuleData.lessons[lessonIdx];
      const progress = await this.lessonProgressRepository.findByUserAndLesson(userId, lesson.id);
      if (!progress || !progress.isCompleted()) {
        incompleteLessons.push(lesson.id);
      }
    }

    return incompleteLessons;
  }

  private validateInput(input: CanAccessLessonInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }

    if (!input.courseId || input.courseId.trim() === '') {
      throw new Error('Course ID is required');
    }
  }
}