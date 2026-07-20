import { inject, injectable } from 'inversify';
import { ContentSymbols } from '@/_core/shared/container/modules/content/symbols';
import { EnrollmentSymbols } from '@/_core/shared/container/modules/enrollment/symbols';
import type { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import type { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
import type { ClassRepository } from '@/_core/modules/enrollment/infrastructure/repositories/ClassRepository';
import { ListTutorClassesInput } from './list-tutor-classes.input';
import { ListTutorClassesOutput, TutorClassOption } from './list-tutor-classes.output';

/**
 * Use case for listing the classes (turmas) linked to the courses the tutor teaches
 * These are the classes the tutor can schedule a live class for
 */
@injectable()
export class ListTutorClassesUseCase {
  constructor(
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository,
    @inject(ContentSymbols.repositories.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: ListTutorClassesInput): Promise<ListTutorClassesOutput> {
    const courseTutors = await this.courseTutorRepository.findByUserId(input.tutorId);

    if (courseTutors.length === 0) {
      return { classes: [] };
    }

    const tutorCourseIds = new Set(courseTutors.map(courseTutor => courseTutor.courseId));

    const [institutionClasses, courses] = await Promise.all([
      this.classRepository.findAll(input.institutionId),
      Promise.all(
        Array.from(tutorCourseIds).map(courseId => this.courseRepository.findById(courseId))
      )
    ]);

    const courseTitleById = new Map(
      courses
        .filter((course): course is NonNullable<typeof course> => course !== null)
        .map(course => [course.id, course.title])
    );

    const classes: TutorClassOption[] = institutionClasses
      .filter(klass => klass.courseId !== null && tutorCourseIds.has(klass.courseId))
      .map(klass => ({
        classId: klass.id,
        className: klass.name,
        courseId: klass.courseId as string,
        courseTitle: courseTitleById.get(klass.courseId as string) ?? 'Curso'
      }));

    return { classes };
  }
}
