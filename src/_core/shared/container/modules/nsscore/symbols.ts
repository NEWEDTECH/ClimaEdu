export const repositories = {
  NSScoreQuestionRepository: Symbol.for('NSScoreQuestionRepository'),
  NSScoreResponseRepository: Symbol.for('NSScoreResponseRepository'),
}

export const useCases = {
  ListNSScoreQuestionsUseCase: Symbol.for('ListNSScoreQuestionsUseCase'),
  CreateNSScoreQuestionUseCase: Symbol.for('CreateNSScoreQuestionUseCase'),
  DeleteNSScoreQuestionUseCase: Symbol.for('DeleteNSScoreQuestionUseCase'),
  SubmitNSScoreResponseUseCase: Symbol.for('SubmitNSScoreResponseUseCase'),
  GetNSScoreStatsUseCase: Symbol.for('GetNSScoreStatsUseCase'),
  CheckNSScoreSubmittedUseCase: Symbol.for('CheckNSScoreSubmittedUseCase'),
  ListNSScoreResponsesUseCase: Symbol.for('ListNSScoreResponsesUseCase'),
}

export const NSScoreSymbols = { repositories, useCases }
