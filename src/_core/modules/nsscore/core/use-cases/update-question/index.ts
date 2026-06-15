import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreQuestionRepository } from '../../../infrastructure/repositories/NSScoreQuestionRepository'
import type { NSScoreQuestion } from '../../entities/NSScoreQuestion'
import type { NSScoreFieldType } from '../../entities/NSScoreQuestion'

export class UpdateNSScoreQuestionInput {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly fieldType: NSScoreFieldType
  ) {}
}
export class UpdateNSScoreQuestionOutput {
  constructor(public readonly question: NSScoreQuestion) {}
}

@injectable()
export class UpdateNSScoreQuestionUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreQuestionRepository)
    private readonly repo: NSScoreQuestionRepository
  ) {}
  async execute(input: UpdateNSScoreQuestionInput): Promise<UpdateNSScoreQuestionOutput> {
    const question = await this.repo.findById(input.id)
    if (!question) throw new Error('Question not found')
    question.text = input.text
    question.fieldType = input.fieldType
    const updated = await this.repo.update(question)
    return new UpdateNSScoreQuestionOutput(updated)
  }
}
