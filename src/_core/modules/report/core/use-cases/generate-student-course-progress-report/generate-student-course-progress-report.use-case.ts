import { inject, injectable } from 'inversify';
import { GenerateStudentCourseProgressReportInput } from './generate-student-course-progress-report.input';
import { GenerateStudentCourseProgressReportOutput, CourseProgressData } from './generate-student-course-progress-report.output';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { ModuleRepository } from '../../../../content/infrastructure/repositories/ModuleRepository';
import type { LessonRepository } from '../../../../content/infrastructure/repositories/LessonRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import { LessonProgress } from '../../../../content/core/entities/LessonProgress';
import { Enrollment } from '../../../../enrollment/core/entities/Enrollment';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating student course progress report
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateStudentCourseProgressReportUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GenerateStudentCourseProgressReportInput): Promise<GenerateStudentCourseProgressReportOutput> {
    // Validate user exists and get user info
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all enrollments for the user
    let enrollments = await this.enrollmentRepository.listByUser(input.userId);
    
    // Filter by institution
    enrollments = enrollments.filter((enrollment: Enrollment) => enrollment.institutionId === input.institutionId);
    
    // Filter by specific course if provided
    if (input.courseId) {
      enrollments = enrollments.filter((enrollment: Enrollment) => enrollment.courseId === input.courseId);
    }

    // Get lesson progresses for the user
    const lessonProgresses = await this.lessonProgressRepository.findByUserAndInstitution(
      input.userId, 
      input.institutionId
    );

    // Process each enrollment to build course progress data
    const courses: CourseProgressData[] = [];
    let totalStudyTime = 0;
    let totalCompletedCourses = 0;
    let totalInProgressCourses = 0;
    let totalNotStartedCourses = 0;
    let mostRecentActivity: Date | undefined;

    for (const enrollment of enrollments) {
      const courseProgressData = await this.buildCourseProgressData(
        enrollment,
        lessonProgresses
      );
      
      // Apply filters
      const shouldInclude = this.shouldIncludeCourse(courseProgressData, input);
      if (!shouldInclude) {
        continue;
      }

      courses.push(courseProgressData);
      totalStudyTime += courseProgressData.totalTimeSpent;

      // Update counters
      switch (courseProgressData.status) {
        case 'COMPLETED':
          totalCompletedCourses++;
          break;
        case 'IN_PROGRESS':
          totalInProgressCourses++;
          break;
        case 'NOT_STARTED':
          totalNotStartedCourses++;
          break;
      }

      // Track most recent activity
      if (courseProgressData.lastAccessedAt) {
        if (!mostRecentActivity || courseProgressData.lastAccessedAt > mostRecentActivity) {
          mostRecentActivity = courseProgressData.lastAccessedAt;
        }
      }
    }

    // Calculate overall metrics
    const totalEnrolledCourses = courses.length;
    const overallProgressPercentage = totalEnrolledCourses > 0 
      ? courses.reduce((sum, course) => sum + course.progressPercentage, 0) / totalEnrolledCourses
      : 0;
    
    const averageProgressPerCourse = overallProgressPercentage;

    // Estimate completion days (simple heuristic)
    const estimatedCompletionDays = this.calculateEstimatedCompletionDays(courses);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'StudentCourseProgressReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['Enrollment', 'LessonProgress', 'Course', 'Module', 'Lesson'],
        totalRecords: totalEnrolledCourses
      },
      studentId: input.userId,
      studentName: user.name,
      totalEnrolledCourses,
      completedCourses: totalCompletedCourses,
      inProgressCourses: totalInProgressCourses,
      notStartedCourses: totalNotStartedCourses,
      overallProgressPercentage: Math.round(overallProgressPercentage * 100) / 100,
      totalStudyTime,
      courses,
      mostRecentActivity,
      averageProgressPerCourse: Math.round(averageProgressPerCourse * 100) / 100,
      estimatedCompletionDays
    };
  }

  private async buildCourseProgressData(
    enrollment: Enrollment,
    lessonProgresses: LessonProgress[]
  ): Promise<CourseProgressData> {
    // Get course details
    const course = await this.courseRepository.findById(enrollment.courseId);
    if (!course) {
      throw new Error(`Course not found: ${enrollment.courseId}`);
    }

    // Get all modules for the course
    const modules = await this.moduleRepository.listByCourse(course.id);
    
    // Get all lessons for all modules
    let totalLessons = 0;
    const allLessons: Array<{ id: string; title: string }> = [];
    const lessonModuleMap = new Map<string, string>();

    for (const courseModule of modules) {
      const lessons = await this.lessonRepository.listByModule(courseModule.id);
      totalLessons += lessons.length;
      allLessons.push(...lessons);
      
      // Map lesson to module for pending lessons
      lessons.forEach(lesson => {
        lessonModuleMap.set(lesson.id, courseModule.title);
      });
    }

    // Filter lesson progresses for this course's lessons
    const courseLessonIds = allLessons.map(lesson => lesson.id);
    const courseLessonProgresses = lessonProgresses.filter(
      (progress: LessonProgress) => courseLessonIds.includes(progress.lessonId)
    );

    // Calculate progress metrics
    const completedLessons = courseLessonProgresses.filter(
      (progress: LessonProgress) => progress.isCompleted()
    ).length;

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Calculate total time spent
    const totalTimeSpent = courseLessonProgresses.reduce(
      (sum, progress) => sum + progress.getTotalTimeSpent(), 0
    );

    // Find last accessed date
    const lastAccessedAt = courseLessonProgresses.length > 0
      ? new Date(Math.max(...courseLessonProgresses.map(p => p.lastAccessedAt.getTime())))
      : undefined;

    // Determine status
    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    if (enrollment.status.toString() === 'COMPLETED') {
      status = 'COMPLETED';
    } else if (courseLessonProgresses.length === 0) {
      status = 'NOT_STARTED';
    } else {
      status = 'IN_PROGRESS';
    }

    // Find pending lessons
    const completedLessonIds = courseLessonProgresses
      .filter((progress: LessonProgress) => progress.isCompleted())
      .map((progress: LessonProgress) => progress.lessonId);
    
    const pendingLessons = allLessons
      .filter(lesson => !completedLessonIds.includes(lesson.id))
      .map(lesson => ({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        moduleTitle: lessonModuleMap.get(lesson.id) || 'Unknown Module'
      }));

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseDescription: course.description,
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      totalLessons,
      completedLessons,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      lastAccessedAt,
      totalTimeSpent,
      status,
      pendingLessons
    };
  }

  private shouldIncludeCourse(courseData: CourseProgressData, input: GenerateStudentCourseProgressReportInput): boolean {
    const includeCompleted = input.includeCompletedCourses ?? true;
    const includeInProgress = input.includeInProgressCourses ?? true;

    if (courseData.status === 'COMPLETED' && !includeCompleted) {
      return false;
    }

    if (courseData.status === 'IN_PROGRESS' && !includeInProgress) {
      return false;
    }

    return true;
  }

  private calculateEstimatedCompletionDays(courses: CourseProgressData[]): number | undefined {
    const inProgressCourses = courses.filter(course => course.status === 'IN_PROGRESS');
    
    if (inProgressCourses.length === 0) {
      return undefined;
    }

    // Simple heuristic: based on average progress rate
    const totalProgress = inProgressCourses.reduce((sum, course) => sum + course.progressPercentage, 0);
    const averageProgress = totalProgress / inProgressCourses.length;
    
    if (averageProgress <= 0) {
      return undefined;
    }

    // Estimate based on current progress rate (very simplified)
    const remainingProgress = 100 - averageProgress;
    const estimatedDays = Math.ceil(remainingProgress / 2); // Assume 2% progress per day
    
    return estimatedDays;
  }
}
