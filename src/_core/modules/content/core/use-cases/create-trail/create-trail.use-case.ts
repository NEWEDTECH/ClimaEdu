import { inject, injectable } from "inversify";
import { Trail } from "../../entities/Trail";
import type { TrailRepository } from "../../../infrastructure/repositories/TrailRepository";
import { CreateTrailInput } from "./create-trail.input";
import { CreateTrailOutput } from "./create-trail.output";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";

@injectable()
export class CreateTrailUseCase {
  constructor(
    @inject(ContentSymbols.repositories.TrailRepository)
    private readonly trailRepository: TrailRepository
  ) {}

  async execute(input: CreateTrailInput): Promise<CreateTrailOutput> {
    const id = await this.trailRepository.generateId();

    const trail = Trail.create({
      id,
      institutionId: input.institutionId,
      title: input.title,
      description: input.description,
      courseIds: input.courseIds,
      coverImageUrl: input.coverImageUrl,
    });

    await this.trailRepository.save(trail);

    return new CreateTrailOutput(trail);
  }
}
