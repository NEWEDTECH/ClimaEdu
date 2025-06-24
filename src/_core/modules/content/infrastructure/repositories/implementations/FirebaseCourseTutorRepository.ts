import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { CourseTutor } from '../../../core/entities/CourseTutor';
import type { CourseTutorRepository } from '../CourseTutorRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the CourseTutorRepository
 */
@injectable()
export class FirebaseCourseTutorRepository implements CourseTutorRepository {
  private readonly collectionName = 'course_tutors';
  private readonly idPrefix = 'crs_tut_';

  /**
   * Generate a new unique ID for a course-tutor association
   * @returns A unique ID with the course-tutor prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a CourseTutor entity
   * @param data Firestore document data
   * @returns CourseTutor entity
   */
  private mapToEntity(data: DocumentData): CourseTutor {
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    return CourseTutor.create({
      id: data.id,
      userId: data.userId,
      courseId: data.courseId,
      createdAt,
      updatedAt
    });
  }

  /**
   * Find a course-tutor association by id
   * @param id Association id
   * @returns CourseTutor or null if not found
   */
  async findById(id: string): Promise<CourseTutor | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find associations by user ID
   * @param userId User ID
   * @returns List of CourseTutor
   */
  async findByUserId(userId: string): Promise<CourseTutor[]> {
    const q = query(
      collection(firestore, this.collectionName),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find associations by course ID
   * @param courseId Course ID
   * @returns List of CourseTutor
   */
  async findByCourseId(courseId: string): Promise<CourseTutor[]> {
    const q = query(
      collection(firestore, this.collectionName),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find a specific association between user and course
   * @param userId User ID
   * @param courseId Course ID
   * @returns CourseTutor or null if not found
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseTutor | null> {
    const q = query(
      collection(firestore, this.collectionName),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Save a course-tutor association
   * @param courseTutor CourseTutor to save
   * @returns Saved CourseTutor
   */
  async save(courseTutor: CourseTutor): Promise<CourseTutor> {
    const docRef = doc(firestore, this.collectionName, courseTutor.id);
    
    const data = {
      id: courseTutor.id,
      userId: courseTutor.userId,
      courseId: courseTutor.courseId,
      createdAt: courseTutor.createdAt,
      updatedAt: courseTutor.updatedAt
    };

    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, data);
    }

    return courseTutor;
  }

  /**
   * Delete a course-tutor association
   * @param id Association id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    await deleteDoc(docRef);
    return true;
  }
}
