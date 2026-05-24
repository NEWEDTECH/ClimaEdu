import { injectable } from 'inversify'
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc,
  getDocs, query, where, DocumentData, Timestamp
} from 'firebase/firestore'
import { firestore } from '@/_core/shared/firebase/firebase-client'
import { NSScoreQuestion } from '../../../core/entities/NSScoreQuestion'
import type { NSScoreFieldType } from '../../../core/entities/NSScoreQuestion'
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
    return new NSScoreQuestion(
      data.id,
      data.courseId,
      data.institutionId,
      data.text,
      data.order ?? 0,
      createdAt,
      (data.fieldType as NSScoreFieldType) ?? 'textarea'
    )
  }

  async save(question: NSScoreQuestion): Promise<NSScoreQuestion> {
    const ref = doc(firestore, this.col, question.id)
    await setDoc(ref, {
      id: question.id,
      courseId: question.courseId,
      institutionId: question.institutionId,
      text: question.text,
      order: question.order,
      fieldType: question.fieldType,
      createdAt: question.createdAt
    })
    return question
  }

  async update(question: NSScoreQuestion): Promise<NSScoreQuestion> {
    const ref = doc(firestore, this.col, question.id)
    await updateDoc(ref, {
      text: question.text,
      fieldType: question.fieldType,
      order: question.order,
    })
    return question
  }

  async findById(id: string): Promise<NSScoreQuestion | null> {
    const ref = doc(firestore, this.col, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return this.map({ id: snap.id, ...snap.data() })
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
      where('courseId', '==', courseId)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map(d => this.map({ id: d.id, ...d.data() }))
      .sort((a, b) => a.order - b.order)
  }
}
