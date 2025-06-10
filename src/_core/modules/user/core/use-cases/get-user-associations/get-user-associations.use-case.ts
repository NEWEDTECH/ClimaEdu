import { inject, injectable } from "inversify";
import { GetUserAssociationsInput } from "./get-user-associations.input";
import {
  GetUserAssociationsOutput,
  UserAssociation,
} from "./get-user-associations.output";
import { UserRole } from "../../entities/User";
import { ContentSymbols } from "@/_core/shared/container/modules/content/symbols";
import { EnrollmentSymbols } from "@/_core/shared/container/modules/enrollment/symbols";
import { InstitutionSymbols } from "@/_core/shared/container/modules/institution/symbols";
import type {
  CourseRepository,
  CourseTutor,
  CourseTutorRepository,
} from "@/_core/modules/content";
import type {
  Enrollment,
  EnrollmentRepository,
} from "@/_core/modules/enrollment";
import type {
  InstitutionRepository,
  UserInstitution,
  UserInstitutionRepository,
} from "@/_core/modules/institution";

@injectable()
export class GetUserAssociationsUseCase {
  constructor(
    @inject(InstitutionSymbols.repositories.InstitutionRepository)
    private readonly institutionRepository: InstitutionRepository,
    @inject(InstitutionSymbols.repositories.UserInstitutionRepository)
    private readonly userInstitutionRepository: UserInstitutionRepository,
    @inject(EnrollmentSymbols.repositories.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    @inject(ContentSymbols.repositories.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  async execute({
    userId,
  }: GetUserAssociationsInput): Promise<GetUserAssociationsOutput> {
    const [
      userInstitutions,
      enrollments,
      courseTutorings,
    ] = await Promise.all([
      this.userInstitutionRepository.findByUserId(userId),
      this.enrollmentRepository.listByUser(userId),
      this.courseTutorRepository.findByUserId(userId),
    ]);

    const institutionAssociations = await this.mapInstitutions(userInstitutions);
    const enrollmentAssociations = await this.mapEnrollments(enrollments);
    const tutorAssociations = await this.mapTutorings(courseTutorings);

    return [
      ...institutionAssociations,
      ...enrollmentAssociations,
      ...tutorAssociations,
    ];
  }

  private async mapInstitutions(
    associations: UserInstitution[]
  ): Promise<UserAssociation[]> {
    const promises = associations.map(async (assoc) => {
      const institution = await this.institutionRepository.findById(
        assoc.institutionId
      );
      return {
        contextId: assoc.institutionId,
        contextName: institution?.name || "Unknown Institution",
        role: assoc.userRole,
        contextType: "institution",
      } as UserAssociation;
    });
    return Promise.all(promises);
  }

  private async mapEnrollments(
    associations: Enrollment[]
  ): Promise<UserAssociation[]> {
    const promises = associations.map(async (assoc) => {
      const course = await this.courseRepository.findById(assoc.courseId);
      return {
        contextId: assoc.courseId,
        contextName: course?.title || "Unknown Course",
        role: UserRole.STUDENT,
        contextType: "course",
      } as UserAssociation;
    });
    return Promise.all(promises);
  }

  private async mapTutorings(
    associations: CourseTutor[]
  ): Promise<UserAssociation[]> {
    const promises = associations.map(async (assoc) => {
      const course = await this.courseRepository.findById(assoc.courseId);
      return {
        contextId: assoc.courseId,
        contextName: course?.title || "Unknown Course",
        role: UserRole.TUTOR,
        contextType: "course",
      } as UserAssociation;
    });
    return Promise.all(promises);
  }
}
