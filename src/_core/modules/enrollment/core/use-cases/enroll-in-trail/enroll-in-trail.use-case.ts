import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { EnrollmentRepository } from "../../../infrastructure/repositories/EnrollmentRepository";
import type { TrailRepository } from "../../../../content/infrastructure/repositories/TrailRepository";
import { EnrollInTrailInput } from "./enroll-in-trail.input";
import { EnrollInTrailOutput } from "./enroll-in-trail.output";
import { Enrollment } from "../../entities/Enrollment";

@injectable()
export class EnrollInTrailUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: EnrollInTrailInput): Promise<EnrollInTrailOutput> {
    const trail = await this.trailRepository.findById(input.trailId);

    if (!trail) {
      throw new AppError("Trail not found", 404);
    }

    const enrollments: Enrollment[] = [];

    for (const courseId of trail.courseIds) {
      const enrollment = Enrollment.create({
        userId: input.userId,
        courseId: courseId,
        institutionId: input.institutionId,
      });
      await this.enrollmentRepository.save(enrollment);
      enrollments.push(enrollment);
    }

    return new EnrollInTrailOutput(enrollments);
  }
}
