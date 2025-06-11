import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { DeleteTrailInput } from "./delete-trail.input";
import { DeleteTrailOutput } from "./delete-trail.output";

@injectable()
export class DeleteTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: DeleteTrailInput): Promise<DeleteTrailOutput> {
    const trail = await this.trailRepository.findById(input.id);

    if (!trail) {
      throw new AppError("Trail not found", 404);
    }

    await this.trailRepository.delete(input.id);

    return new DeleteTrailOutput(true);
  }
}
