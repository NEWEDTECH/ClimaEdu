export type NSScoreFieldType = 'textarea' | 'text' | 'number' | 'boolean' | 'rating'

export const FIELD_TYPE_LABELS: Record<NSScoreFieldType, string> = {
  textarea: 'Texto longo',
  text: 'Texto curto',
  number: 'Número',
  boolean: 'Sim / Não',
  rating: 'Avaliação (1–5)',
}

export const FIELD_TYPES: NSScoreFieldType[] = ['textarea', 'text', 'number', 'boolean', 'rating']

export class NSScoreQuestion {
  constructor(
    readonly id: string,
    readonly courseId: string,
    readonly institutionId: string,
    public text: string,
    public order: number,
    readonly createdAt: Date,
    public fieldType: NSScoreFieldType = 'textarea'
  ) {}

  static create(params: {
    id: string
    courseId: string
    institutionId: string
    text: string
    order?: number
    fieldType?: NSScoreFieldType
  }): NSScoreQuestion {
    if (!params.courseId.trim()) throw new Error('courseId is required')
    if (!params.text.trim()) throw new Error('text is required')
    return new NSScoreQuestion(
      params.id,
      params.courseId,
      params.institutionId,
      params.text,
      params.order ?? 0,
      new Date(),
      params.fieldType ?? 'textarea'
    )
  }
}
