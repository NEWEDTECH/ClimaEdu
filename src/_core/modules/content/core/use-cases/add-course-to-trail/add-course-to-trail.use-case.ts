import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { AddCourseToTrailInput } from "./add-course-to-trail.input";
import { AddCourseToTrailOutput } from "./add-course-to-trail.output";

@injectable()
export class AddCourseToTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(
    input: AddCourseToTrailInput
  ): Promise<AddCourseToTrailOutput> {
    const trail = await this.trailRepository.findById(input.trailId);

    if (!trail) {
      throw new AppError("Trail not found", 404);
    }

    trail.addCourse(input.courseId);

    await this.trailRepository.save(trail);

    return new AddCourseToTrailOutput(trail);
  }
}
