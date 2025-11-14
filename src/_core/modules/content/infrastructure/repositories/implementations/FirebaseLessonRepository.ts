import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, writeBatch } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Lesson } from '../../../core/entities/Lesson';
import { Content } from '../../../core/entities/Content';
import type { LessonRepository } from '../LessonRepository';
import { nanoid } from 'nanoid';
import { ContentType } from '../../../core/entities';

/**
 * Firebase implementation of the LessonRepository
 */
@injectable()
export class FirebaseLessonRepository implements LessonRepository {
  private readonly collectionName = 'lessons';
  private readonly idPrefix = 'les_';

  /**
   * Generate a new unique ID for a lesson
   * @returns A unique ID with the lesson prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the lesson prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Lesson entity
   * @param data Firestore document data
   * @returns Lesson entity
   */
  private mapToEntity(data: DocumentData): Lesson {
    // Convert contents from plain objects back to Content entities
    const contents = (data.contents || []).map((contentData: {
      id: string;
      lessonId: string;
      type: ContentType;
      title: string;
      url: string;
      order?: number;
    }) => Content.create({
      id: contentData.id,
      lessonId: contentData.lessonId,
      type: contentData.type,
      title: contentData.title,
      url: contentData.url,
      order: contentData.order ?? 0
    }));

    // Create and return a Lesson entity
    return Lesson.create({
      id: data.id,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description || '',
      coverImageUrl: data.coverImageUrl,
      order: data.order,
      contents: contents,
      contentSectionsOrder: data.contentSectionsOrder || ['video', 'description', 'scorm', 'pdf', 'supportmaterial', 'audio', 'activity', 'questionnaire'],
      activity: data.activity,
      questionnaire: data.questionnaire
    });
  }

  /**
   * Find a lesson by id
   * @param id Lesson id
   * @returns Lesson or null if not found
   */
  async findById(id: string): Promise<Lesson | null> {
    const lessonRef = doc(firestore, this.collectionName, id);
    const lessonDoc = await getDoc(lessonRef);

    if (!lessonDoc.exists()) {
      return null;
    }

    const data = lessonDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Save a lesson
   * @param lesson Lesson to save
   * @returns Saved lesson
   */
  async save(lesson: Lesson): Promise<Lesson> {
    const lessonRef = doc(firestore, this.collectionName, lesson.id);
    
    let activityData = null;
    if (lesson.activity) {
      activityData = {
        id: lesson.activity.id,
        lessonId: lesson.activity.lessonId,
        description: lesson.activity.description,
        instructions: lesson.activity.instructions,
        resourceUrl: lesson.activity.resourceUrl
      };
    }
    
    let questionnaireData = null;
    if (lesson.questionnaire) {
      questionnaireData = {
        id: lesson.questionnaire.id,
        lessonId: lesson.questionnaire.lessonId,
        title: lesson.questionnaire.title,
        maxAttempts: lesson.questionnaire.maxAttempts,
        passingScore: lesson.questionnaire.passingScore,
        questions: lesson.questionnaire.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex
        }))
      };
    }
    
    // Convert contents to plain objects
    const contentsData = lesson.contents.map(content => ({
      id: content.id,
      lessonId: content.lessonId,
      type: content.type,
      title: content.title,
      url: content.url,
      order: content.order
    }));

    // Prepare the lesson data for Firestore
    const lessonData = {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      coverImageUrl: lesson.coverImageUrl,
      order: lesson.order,
      contentSectionsOrder: lesson.contentSectionsOrder,
      contents: contentsData,
      activity: activityData,
      questionnaire: questionnaireData
    };

    // Check if the lesson already exists
    const lessonDoc = await getDoc(lessonRef);
    
    if (lessonDoc.exists()) {
      // Update existing lesson
      await updateDoc(lessonRef, lessonData);
    } else {
      // Create new lesson
      await setDoc(lessonRef, lessonData);
    }

    return lesson;
  }

  /**
   * Delete a lesson
   * @param id Lesson id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const lessonRef = doc(firestore, this.collectionName, id);
    const lessonDoc = await getDoc(lessonRef);

    if (!lessonDoc.exists()) {
      return false;
    }

    await deleteDoc(lessonRef);
    return true;
  }

  /**
   * List lessons by module
   * @param moduleId Module id
   * @returns List of lessons
   */
  async listByModule(moduleId: string): Promise<Lesson[]> {
    const lessonsRef = collection(firestore, this.collectionName);
    const q = query(lessonsRef, where('moduleId', '==', moduleId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Count lessons in a module
   * @param moduleId Module id
   * @returns Number of lessons in the module
   */
  async countByModule(moduleId: string): Promise<number> {
    const lessonsRef = collection(firestore, this.collectionName);
    const q = query(lessonsRef, where('moduleId', '==', moduleId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
  }

  /**
   * Reorder lessons in a module
   * This is used when inserting a new lesson at a specific position
   * @param moduleId Module id
   * @param startOrder The order from which to start reordering
   * @returns true if successful
   */
  async reorderLessons(moduleId: string, startOrder: number): Promise<boolean> {
    const lessonsRef = collection(firestore, this.collectionName);
    const q = query(
      lessonsRef,
      where('moduleId', '==', moduleId),
      where('order', '>=', startOrder)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return true; // No lessons to reorder
    }

    const batch = writeBatch(firestore);

    // Increment the order of all lessons with order >= startOrder
    querySnapshot.docs.forEach(docSnapshot => {
      const lessonRef = doc(firestore, this.collectionName, docSnapshot.id);
      const currentOrder = docSnapshot.data().order;
      batch.update(lessonRef, { order: currentOrder + 1 });
    });

    await batch.commit();
    return true;
  }

  /**
   * Update the order of a lesson
   * @param id Lesson id
   * @param order New order value
   */
  async updateOrder(id: string, order: number): Promise<void> {
    const lessonRef = doc(firestore, this.collectionName, id);
    await updateDoc(lessonRef, { order });
  }
}
