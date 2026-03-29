import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreResponseRepository } from '../../../infrastructure/repositories/NSScoreResponseRepository'

export class CheckNSScoreSubmittedInput {
  constructor(
    public readonly userId: string,
    public readonly courseId: string
  ) {}
}
export class CheckNSScoreSubmittedOutput {
  constructor(public readonly submitted: boolean) {}
}

@injectable()
export class CheckNSScoreSubmittedUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreResponseRepository)
    private readonly repo: NSScoreResponseRepository
  ) {}
  async execute(input: CheckNSScoreSubmittedInput): Promise<CheckNSScoreSubmittedOutput> {
    const existing = await this.repo.findByUserAndCourse(input.userId, input.courseId)
    return new CheckNSScoreSubmittedOutput(existing !== null)
  }
}
