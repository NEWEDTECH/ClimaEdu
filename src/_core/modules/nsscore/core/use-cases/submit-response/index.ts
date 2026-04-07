import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreResponseRepository } from '../../../infrastructure/repositories/NSScoreResponseRepository'
import { NSScoreResponse, QuestionAnswer } from '../../entities/NSScoreResponse'

export class SubmitNSScoreResponseInput {
  constructor(
    public readonly courseId: string,
    public readonly userId: string,
    public readonly institutionId: string,
    public readonly score: number,
    public readonly questionAnswers: QuestionAnswer[]
  ) {}
}
export class SubmitNSScoreResponseOutput {
  constructor(public readonly success: boolean) {}
}

@injectable()
export class SubmitNSScoreResponseUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreResponseRepository)
    private readonly repo: NSScoreResponseRepository
  ) {}
  async execute(input: SubmitNSScoreResponseInput): Promise<SubmitNSScoreResponseOutput> {
    const id = await this.repo.generateId()
    const response = NSScoreResponse.create({
      id,
      courseId: input.courseId,
      userId: input.userId,
      institutionId: input.institutionId,
      score: input.score,
      questionAnswers: input.questionAnswers
    })
    await this.repo.save(response)
    return new SubmitNSScoreResponseOutput(true)
  }
}
