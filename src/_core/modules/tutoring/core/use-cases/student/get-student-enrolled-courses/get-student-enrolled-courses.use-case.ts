import { inject, injectable } from 'inversify'
import type { EnrollmentRepository } from '@/_core/modules/enrollment'
import { EnrollmentStatus, type Enrollment } from '@/_core/modules/enrollment'
import type { CourseRepository } from '@/_core/modules/content'
import { Register } from '@/_core/shared/container'
import type { GetStudentEnrolledCoursesInput } from './get-student-enrolled-courses.input'
import type { GetStudentEnrolledCoursesOutput } from './get-student-enrolled-courses.output'

/**
 * Use case for getting student enrolled courses available for tutoring
 */
@injectable()
export class GetStudentEnrolledCoursesUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository
  ) {}

  async execute(input: GetStudentEnrolledCoursesInput): Promise<GetStudentEnrolledCoursesOutput> {
    // Get enrollments for the student
    const enrollments = await this.enrollmentRepository.listByUser(input.studentId)
    
    // Filter only enrolled status (active enrollments)
    const activeEnrollments = enrollments.filter((enrollment: Enrollment) => 
      enrollment.status === EnrollmentStatus.ENROLLED
    )

    // Get course details for each enrollment
    const courses = await Promise.all(
      activeEnrollments.map(async (enrollment: Enrollment) => {
        const course = await this.courseRepository.findById(enrollment.courseId)
        if (!course) {
          throw new Error(`Course not found: ${enrollment.courseId}`)
        }
        return course
      })
    )

    return {
      courses
    }
  }
}
