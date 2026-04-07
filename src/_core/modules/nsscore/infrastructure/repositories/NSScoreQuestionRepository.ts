import type { NSScoreQuestion } from '../../core/entities/NSScoreQuestion'

export interface NSScoreQuestionRepository {
  generateId(): Promise<string>
  save(question: NSScoreQuestion): Promise<NSScoreQuestion>
  delete(id: string): Promise<boolean>
  listByCourse(courseId: string): Promise<NSScoreQuestion[]>
}
