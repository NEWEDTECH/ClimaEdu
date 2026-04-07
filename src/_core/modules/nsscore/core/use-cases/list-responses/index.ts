import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreResponseRepository } from '../../../infrastructure/repositories/NSScoreResponseRepository'
import type { NSScoreResponse } from '../../entities/NSScoreResponse'

export class ListNSScoreResponsesInput {
  constructor(public readonly courseId: string) {}
}
export class ListNSScoreResponsesOutput {
  constructor(public readonly responses: NSScoreResponse[]) {}
}

@injectable()
export class ListNSScoreResponsesUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreResponseRepository)
    private readonly repo: NSScoreResponseRepository
  ) {}
  async execute(input: ListNSScoreResponsesInput): Promise<ListNSScoreResponsesOutput> {
    const responses = await this.repo.listByCourse(input.courseId)
    return new ListNSScoreResponsesOutput(responses)
  }
}
