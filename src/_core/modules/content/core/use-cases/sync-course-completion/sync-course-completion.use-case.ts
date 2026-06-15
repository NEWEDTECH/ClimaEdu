import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus';
import { LessonProgressStatus } from '../../entities/ProgressStatus';

export interface SyncCourseCompletionInput {
  userId: string;
  lessonId: string;
  institutionId: string;
}

@injectable()
export class SyncCourseCompletionUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(input: SyncCourseCompletionInput): Promise<boolean> {
    const lesson = await this.lessonRepository.findById(input.lessonId);
    if (!lesson) return false;

    const courseModule = await this.moduleRepository.findById(lesson.moduleId);
    if (!courseModule) return false;

    const courseId = courseModule.courseId;

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(input.userId, courseId);
    if (!enrollment || enrollment.status === EnrollmentStatus.COMPLETED) return false;

    const course = await this.courseRepository.findById(courseId);
    if (!course) return false;

    const allLessonIds: string[] = [];
    for (const mod of course.modules) {
      for (const courseLesson of mod.lessons) {
        allLessonIds.push(courseLesson.id);
      }
    }
    if (allLessonIds.length === 0) return false;

    const progresses = await this.lessonProgressRepository.findByUserAndInstitution(
      input.userId,
      input.institutionId
    );
    const completedLessonIds = new Set(
      progresses
        .filter(p => p.status === LessonProgressStatus.COMPLETED)
        .map(p => p.lessonId)
    );

    const allCompleted = allLessonIds.every(id => completedLessonIds.has(id));
    if (!allCompleted) return false;

    enrollment.complete();
    await this.enrollmentRepository.save(enrollment);
    return true;
  }
}
