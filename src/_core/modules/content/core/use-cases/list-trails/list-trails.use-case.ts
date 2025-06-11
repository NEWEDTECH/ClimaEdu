import { inject, injectable } from "inversify";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { ListTrailsInput } from "./list-trails.input";
import { ListTrailsOutput } from "./list-trails.output";

@injectable()
export class ListTrailsUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: ListTrailsInput): Promise<ListTrailsOutput> {
    const trails = await this.trailRepository.findAll(input.institutionId);
    return new ListTrailsOutput(trails);
  }
}
