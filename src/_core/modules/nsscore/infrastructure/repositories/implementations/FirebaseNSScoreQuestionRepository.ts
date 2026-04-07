import { injectable } from 'inversify'
import {
  collection, doc, getDoc, setDoc, deleteDoc,
  getDocs, query, where, orderBy, DocumentData, Timestamp
} from 'firebase/firestore'
import { firestore } from '@/_core/shared/firebase/firebase-client'
import { NSScoreQuestion } from '../../../core/entities/NSScoreQuestion'
import type { NSScoreQuestionRepository } from '../NSScoreQuestionRepository'
import { nanoid } from 'nanoid'

@injectable()
export class FirebaseNSScoreQuestionRepository implements NSScoreQuestionRepository {
  private readonly col = 'nsscore_questions'
  private readonly prefix = 'nsq_'

  async generateId(): Promise<string> {
    return `${this.prefix}${nanoid(10)}`
  }

  private map(data: DocumentData): NSScoreQuestion {
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt)
    return new NSScoreQuestion(data.id, data.courseId, data.institutionId, data.text, data.order ?? 0, createdAt)
  }

  async save(question: NSScoreQuestion): Promise<NSScoreQuestion> {
    const ref = doc(firestore, this.col, question.id)
    await setDoc(ref, {
      id: question.id,
      courseId: question.courseId,
      institutionId: question.institutionId,
      text: question.text,
      order: question.order,
      createdAt: question.createdAt
    })
    return question
  }

  async delete(id: string): Promise<boolean> {
    const ref = doc(firestore, this.col, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    await deleteDoc(ref)
    return true
  }

  async listByCourse(courseId: string): Promise<NSScoreQuestion[]> {
    const q = query(
      collection(firestore, this.col),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => this.map({ id: d.id, ...d.data() }))
  }
}
