import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { RemoveCourseFromTrailInput } from "./remove-course-from-trail.input";
import { RemoveCourseFromTrailOutput } from "./remove-course-from-trail.output";

@injectable()
export class RemoveCourseFromTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(
    input: RemoveCourseFromTrailInput
  ): Promise<RemoveCourseFromTrailOutput> {
    const trail = await this.trailRepository.findById(input.trailId);

    if (!trail) {
      throw new AppError("Trail not found", 404);
    }

    trail.removeCourse(input.courseId);

    await this.trailRepository.save(trail);

    return new RemoveCourseFromTrailOutput(trail);
  }
}
