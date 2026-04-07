import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreQuestionRepository } from '../../../infrastructure/repositories/NSScoreQuestionRepository'
import type { NSScoreQuestion } from '../../entities/NSScoreQuestion'

export class ListNSScoreQuestionsInput {
  constructor(public readonly courseId: string) {}
}
export class ListNSScoreQuestionsOutput {
  constructor(public readonly questions: NSScoreQuestion[]) {}
}

@injectable()
export class ListNSScoreQuestionsUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreQuestionRepository)
    private readonly repo: NSScoreQuestionRepository
  ) {}
  async execute(input: ListNSScoreQuestionsInput): Promise<ListNSScoreQuestionsOutput> {
    const questions = await this.repo.listByCourse(input.courseId)
    return new ListNSScoreQuestionsOutput(questions)
  }
}
