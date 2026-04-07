import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreQuestionRepository } from '../../../infrastructure/repositories/NSScoreQuestionRepository'
import { NSScoreQuestion } from '../../entities/NSScoreQuestion'

export class CreateNSScoreQuestionInput {
  constructor(
    public readonly courseId: string,
    public readonly institutionId: string,
    public readonly text: string,
    public readonly order: number
  ) {}
}
export class CreateNSScoreQuestionOutput {
  constructor(public readonly question: NSScoreQuestion) {}
}

@injectable()
export class CreateNSScoreQuestionUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreQuestionRepository)
    private readonly repo: NSScoreQuestionRepository
  ) {}
  async execute(input: CreateNSScoreQuestionInput): Promise<CreateNSScoreQuestionOutput> {
    const id = await this.repo.generateId()
    const question = NSScoreQuestion.create({
      id,
      courseId: input.courseId,
      institutionId: input.institutionId,
      text: input.text,
      order: input.order
    })
    const saved = await this.repo.save(question)
    return new CreateNSScoreQuestionOutput(saved)
  }
}
