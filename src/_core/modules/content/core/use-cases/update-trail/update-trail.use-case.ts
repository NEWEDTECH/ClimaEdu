import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { UpdateTrailInput } from "./update-trail.input";
import { UpdateTrailOutput } from "./update-trail.output";

@injectable()
export class UpdateTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: UpdateTrailInput): Promise<UpdateTrailOutput> {
    const trail = await this.trailRepository.findById(input.id);

    if (!trail) {
      throw new AppError("Trail not found", 404);
    }

    if (input.title) {
      trail.updateTitle(input.title);
    }

    if (input.description) {
      trail.updateDescription(input.description);
    }

    await this.trailRepository.save(trail);

    return new UpdateTrailOutput(trail);
  }
}
