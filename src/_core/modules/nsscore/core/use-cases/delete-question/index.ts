import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreQuestionRepository } from '../../../infrastructure/repositories/NSScoreQuestionRepository'

export class DeleteNSScoreQuestionInput {
  constructor(public readonly id: string) {}
}
export class DeleteNSScoreQuestionOutput {
  constructor(public readonly success: boolean) {}
}

@injectable()
export class DeleteNSScoreQuestionUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreQuestionRepository)
    private readonly repo: NSScoreQuestionRepository
  ) {}
  async execute(input: DeleteNSScoreQuestionInput): Promise<DeleteNSScoreQuestionOutput> {
    const success = await this.repo.delete(input.id)
    return new DeleteNSScoreQuestionOutput(success)
  }
}
