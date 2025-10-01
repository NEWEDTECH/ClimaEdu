import { inject, injectable } from 'inversify';
import type { ListQuestionnaireSubmissionsForTutorInput } from './list-questionnaire-submissions-for-tutor.input';
import type { ListQuestionnaireSubmissionsForTutorOutput, SubmissionWithContext } from './list-questionnaire-submissions-for-tutor.output';
import type { QuestionnaireSubmissionRepository } from '../../../infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import { Register } from '../../../../../shared/container/symbols';
import { Course } from '../../entities/Course';

@injectable()
export class ListQuestionnaireSubmissionsForTutorUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,
    @inject(Register.content.repository.QuestionnaireRepository)
    private readonly questionnaireRepository: QuestionnaireRepository,
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(Register.content.repository.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository,
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository
  ) {}

  async execute(input: ListQuestionnaireSubmissionsForTutorInput): Promise<ListQuestionnaireSubmissionsForTutorOutput> {
    // Verificar se o usuário é tutor dos cursos da instituição
    const tutorCourses = await this.courseTutorRepository.findByUserId(input.tutorId);
    const courseIds = tutorCourses.map(tc => tc.courseId);

    if (courseIds.length === 0) {
      return {
        submissions: [],
        totalSubmissions: 0,
        passedSubmissions: 0,
        failedSubmissions: 0,
        averageScore: 0
      };
    }

    // Buscar cursos do tutor na instituição
    const courses = await Promise.all(
      courseIds.map(courseId => this.courseRepository.findById(courseId))
    );

    const filteredCourses = courses.filter((course): course is Course => 
      course !== null && course.institutionId === input.institutionId
    );

    if (input.courseId) {
      const courseExists = filteredCourses.some(course => course.id === input.courseId);
      if (!courseExists) {
        throw new Error('Course not found or you are not authorized to view its submissions');
      }
    }

    // Buscar todas as submissões da instituição
    const allSubmissions = await this.questionnaireSubmissionRepository.listByUsers([]);
    
    // Filtrar submissões por instituição e cursos do tutor
    let filteredSubmissions = allSubmissions.filter(submission => 
      submission.institutionId === input.institutionId
    );

    // Aplicar filtros adicionais
    if (input.studentId) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.userId === input.studentId
      );
    }

    if (input.questionnaireId) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.questionnaireId === input.questionnaireId
      );
    }

    // Buscar dados relacionados para cada submissão
    const submissionsWithContext: SubmissionWithContext[] = [];

    for (const submission of filteredSubmissions) {
      try {
        // Buscar questionário
        const questionnaire = await this.questionnaireRepository.findById(submission.questionnaireId);
        if (!questionnaire) continue;

        // Buscar estudante
        const student = await this.userRepository.findById(submission.userId);
        if (!student) continue;

        // Buscar lição para obter o módulo
        const lesson = await this.lessonRepository.findById(questionnaire.lessonId);
        if (!lesson) continue;

        // Buscar módulo para obter o curso
        const module = await this.moduleRepository.findById(lesson.moduleId);
        if (!module) continue;

        // Buscar curso
        const course = await this.courseRepository.findById(module.courseId);
        if (!course) continue;

        // Verificar se o curso pertence ao tutor
        const isTutorCourse = filteredCourses.some(c => c.id === course.id);
        if (!isTutorCourse) continue;

        // Aplicar filtro de curso se especificado
        if (input.courseId && course.id !== input.courseId) continue;

        submissionsWithContext.push({
          submission,
          questionnaire,
          student,
          course,
          lessonTitle: lesson.title
        });
      } catch (error) {
        // Log error but continue processing other submissions
        console.error('Error processing submission:', error);
        continue;
      }
    }

    // Calcular estatísticas
    const totalSubmissions = submissionsWithContext.length;
    const passedSubmissions = submissionsWithContext.filter(s => s.submission.passed).length;
    const failedSubmissions = totalSubmissions - passedSubmissions;
    const averageScore = totalSubmissions > 0 
      ? submissionsWithContext.reduce((sum, s) => sum + s.submission.score, 0) / totalSubmissions
      : 0;

    return {
      submissions: submissionsWithContext,
      totalSubmissions,
      passedSubmissions,
      failedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100
    };
  }
}
