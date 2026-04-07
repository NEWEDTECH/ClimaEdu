import type { NSScoreResponse } from '../../core/entities/NSScoreResponse'

export interface NSScoreResponseRepository {
  generateId(): Promise<string>
  save(response: NSScoreResponse): Promise<NSScoreResponse>
  findByUserAndCourse(userId: string, courseId: string): Promise<NSScoreResponse | null>
  listByCourse(courseId: string): Promise<NSScoreResponse[]>
}
