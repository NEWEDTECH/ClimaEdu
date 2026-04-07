import { Container } from 'inversify'
import { repositories, useCases } from './symbols'

import type { NSScoreQuestionRepository } from '@/_core/modules/nsscore/infrastructure/repositories/NSScoreQuestionRepository'
import type { NSScoreResponseRepository } from '@/_core/modules/nsscore/infrastructure/repositories/NSScoreResponseRepository'
import { FirebaseNSScoreQuestionRepository } from '@/_core/modules/nsscore/infrastructure/repositories/implementations/FirebaseNSScoreQuestionRepository'
import { FirebaseNSScoreResponseRepository } from '@/_core/modules/nsscore/infrastructure/repositories/implementations/FirebaseNSScoreResponseRepository'

import { ListNSScoreQuestionsUseCase } from '@/_core/modules/nsscore/core/use-cases/list-questions'
import { CreateNSScoreQuestionUseCase } from '@/_core/modules/nsscore/core/use-cases/create-question'
import { DeleteNSScoreQuestionUseCase } from '@/_core/modules/nsscore/core/use-cases/delete-question'
import { SubmitNSScoreResponseUseCase } from '@/_core/modules/nsscore/core/use-cases/submit-response'
import { GetNSScoreStatsUseCase } from '@/_core/modules/nsscore/core/use-cases/get-stats'
import { CheckNSScoreSubmittedUseCase } from '@/_core/modules/nsscore/core/use-cases/check-submitted'
import { ListNSScoreResponsesUseCase } from '@/_core/modules/nsscore/core/use-cases/list-responses'

export function registerNSScoreModule(container: Container): void {
  container.bind<NSScoreQuestionRepository>(repositories.NSScoreQuestionRepository).to(FirebaseNSScoreQuestionRepository)
  container.bind<NSScoreResponseRepository>(repositories.NSScoreResponseRepository).to(FirebaseNSScoreResponseRepository)

  container.bind(useCases.ListNSScoreQuestionsUseCase).to(ListNSScoreQuestionsUseCase)
  container.bind(useCases.CreateNSScoreQuestionUseCase).to(CreateNSScoreQuestionUseCase)
  container.bind(useCases.DeleteNSScoreQuestionUseCase).to(DeleteNSScoreQuestionUseCase)
  container.bind(useCases.SubmitNSScoreResponseUseCase).to(SubmitNSScoreResponseUseCase)
  container.bind(useCases.GetNSScoreStatsUseCase).to(GetNSScoreStatsUseCase)
  container.bind(useCases.CheckNSScoreSubmittedUseCase).to(CheckNSScoreSubmittedUseCase)
  container.bind(useCases.ListNSScoreResponsesUseCase).to(ListNSScoreResponsesUseCase)
}
