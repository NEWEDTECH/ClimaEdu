import { injectable } from 'inversify'
import {
  collection, doc, setDoc, getDocs, query,
  where, DocumentData, Timestamp, limit
} from 'firebase/firestore'
import { firestore } from '@/_core/shared/firebase/firebase-client'
import { NSScoreResponse } from '../../../core/entities/NSScoreResponse'
import type { NSScoreResponseRepository } from '../NSScoreResponseRepository'
import { nanoid } from 'nanoid'

@injectable()
export class FirebaseNSScoreResponseRepository implements NSScoreResponseRepository {
  private readonly col = 'nsscore_responses'
  private readonly prefix = 'nsr_'

  async generateId(): Promise<string> {
    return `${this.prefix}${nanoid(10)}`
  }

  private map(data: DocumentData): NSScoreResponse {
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt)
    return new NSScoreResponse(
      data.id, data.courseId, data.userId, data.institutionId,
      data.score, data.questionAnswers ?? [], createdAt
    )
  }

  async save(response: NSScoreResponse): Promise<NSScoreResponse> {
    const ref = doc(firestore, this.col, response.id)
    await setDoc(ref, {
      id: response.id,
      courseId: response.courseId,
      userId: response.userId,
      institutionId: response.institutionId,
      score: response.score,
      questionAnswers: response.questionAnswers,
      createdAt: response.createdAt
    })
    return response
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<NSScoreResponse | null> {
    const q = query(
      collection(firestore, this.col),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return this.map({ id: d.id, ...d.data() })
  }

  async listByCourse(courseId: string): Promise<NSScoreResponse[]> {
    const q = query(
      collection(firestore, this.col),
      where('courseId', '==', courseId)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => this.map({ id: d.id, ...d.data() }))
  }
}
