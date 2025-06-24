import { inject, injectable } from "inversify";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { GetTrailInput } from "./get-trail.input";
import { GetTrailOutput } from "./get-trail.output";

@injectable()
export class GetTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: GetTrailInput): Promise<GetTrailOutput> {
    const trail = await this.trailRepository.findById(input.id);
    return new GetTrailOutput(trail);
  }
}
