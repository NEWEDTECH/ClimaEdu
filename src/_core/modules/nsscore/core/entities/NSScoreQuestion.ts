export class NSScoreQuestion {
  constructor(
    readonly id: string,
    readonly courseId: string,
    readonly institutionId: string,
    public text: string,
    public order: number,
    readonly createdAt: Date
  ) {}

  static create(params: {
    id: string
    courseId: string
    institutionId: string
    text: string
    order?: number
  }): NSScoreQuestion {
    if (!params.courseId.trim()) throw new Error('courseId is required')
    if (!params.text.trim()) throw new Error('text is required')
    return new NSScoreQuestion(
      params.id,
      params.courseId,
      params.institutionId,
      params.text,
      params.order ?? 0,
      new Date()
    )
  }
}
