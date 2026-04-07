export type QuestionAnswer = {
  questionId: string
  answer: string
}

export class NSScoreResponse {
  constructor(
    readonly id: string,
    readonly courseId: string,
    readonly userId: string,
    readonly institutionId: string,
    readonly score: number,
    readonly questionAnswers: QuestionAnswer[],
    readonly createdAt: Date
  ) {}

  static create(params: {
    id: string
    courseId: string
    userId: string
    institutionId: string
    score: number
    questionAnswers?: QuestionAnswer[]
  }): NSScoreResponse {
    if (params.score < 0 || params.score > 10) throw new Error('Score must be 0–10')
    return new NSScoreResponse(
      params.id,
      params.courseId,
      params.userId,
      params.institutionId,
      params.score,
      params.questionAnswers ?? [],
      new Date()
    )
  }
}
