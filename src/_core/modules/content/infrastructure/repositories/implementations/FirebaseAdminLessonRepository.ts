import { injectable, inject } from 'inversify';
import {
  DocumentData,
  Firestore,
} from 'firebase-admin/firestore';
import { Lesson } from '../../../core/entities/Lesson';
import type { LessonRepository } from '../LessonRepository';
import { nanoid } from 'nanoid';

@injectable()
export class FirebaseAdminLessonRepository implements LessonRepository {
  private readonly collectionName = 'lessons';
  private readonly idPrefix = 'les_';
  private firestore: Firestore;

  constructor(@inject('Firestore') firestore: Firestore) {
    this.firestore = firestore;
  }

  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  private mapToEntity(data: DocumentData): Lesson {
    return Lesson.create({
      id: data.id,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description || '',
      coverImageUrl: data.coverImageUrl,
      order: data.order,
      contents: data.contents || [],
      activity: data.activity,
      questionnaire: data.questionnaire,
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    const lessonRef = this.firestore.collection(this.collectionName).doc(id);
    const lessonDoc = await lessonRef.get();

    if (!lessonDoc.exists) {
      return null;
    }

    const data = lessonDoc.data();
    if (!data) return null;
    return this.mapToEntity({ id, ...data });
  }

  async save(lesson: Lesson): Promise<Lesson> {
    const lessonRef = this.firestore.collection(this.collectionName).doc(lesson.id);
    
    const lessonData = {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      coverImageUrl: lesson.coverImageUrl,
      order: lesson.order,
      contents: lesson.contents.map(c => JSON.parse(JSON.stringify(c))),
      activity: lesson.activity ? JSON.parse(JSON.stringify(lesson.activity)) : null,
      questionnaire: lesson.questionnaire ? JSON.parse(JSON.stringify(lesson.questionnaire)) : null,
    };

    await lessonRef.set(lessonData, { merge: true });

    return lesson;
  }

  async delete(id: string): Promise<boolean> {
    const lessonRef = this.firestore.collection(this.collectionName).doc(id);
    const lessonDoc = await lessonRef.get();

    if (!lessonDoc.exists) {
      return false;
    }

    await lessonRef.delete();
    return true;
  }

  async listByModule(moduleId: string): Promise<Lesson[]> {
    const lessonsRef = this.firestore.collection(this.collectionName);
    const q = lessonsRef.where('moduleId', '==', moduleId);
    const querySnapshot = await q.get();

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  async countByModule(moduleId: string): Promise<number> {
    const lessonsRef = this.firestore.collection(this.collectionName);
    const q = lessonsRef.where('moduleId', '==', moduleId);
    const querySnapshot = await q.get();

    return querySnapshot.size;
  }

  async reorderLessons(moduleId: string, startOrder: number): Promise<boolean> {
    const lessonsRef = this.firestore.collection(this.collectionName);
    const q = lessonsRef
      .where('moduleId', '==', moduleId)
      .where('order', '>=', startOrder);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return true;
    }

    const batch = this.firestore.batch();

    querySnapshot.docs.forEach(docSnapshot => {
      const lessonRef = this.firestore.collection(this.collectionName).doc(docSnapshot.id);
      const currentOrder = docSnapshot.data().order;
      batch.update(lessonRef, { order: currentOrder + 1 });
    });

    await batch.commit();
    return true;
  }
}
