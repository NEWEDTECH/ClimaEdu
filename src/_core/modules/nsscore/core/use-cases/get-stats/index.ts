import { injectable, inject } from 'inversify'
import { NSScoreSymbols } from '../../../../../shared/container/modules/nsscore/symbols'
import type { NSScoreResponseRepository } from '../../../infrastructure/repositories/NSScoreResponseRepository'

export class GetNSScoreStatsInput {
  constructor(public readonly courseId: string) {}
}
export class GetNSScoreStatsOutput {
  constructor(
    public readonly totalResponses: number,
    public readonly averageScore: number,
    public readonly scorePercentage: number
  ) {}
}

@injectable()
export class GetNSScoreStatsUseCase {
  constructor(
    @inject(NSScoreSymbols.repositories.NSScoreResponseRepository)
    private readonly repo: NSScoreResponseRepository
  ) {}
  async execute(input: GetNSScoreStatsInput): Promise<GetNSScoreStatsOutput> {
    const responses = await this.repo.listByCourse(input.courseId)
    const total = responses.length
    if (total === 0) return new GetNSScoreStatsOutput(0, 0, 0)
    const avg = responses.reduce((sum, r) => sum + r.score, 0) / total
    const percentage = Math.round((avg / 10) * 100)
    return new GetNSScoreStatsOutput(total, Math.round(avg * 10) / 10, percentage)
  }
}
