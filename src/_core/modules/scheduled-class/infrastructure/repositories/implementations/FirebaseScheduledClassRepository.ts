import { injectable } from 'inversify';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { ScheduledClass, ScheduledClassStatus } from '../../../core/entities/ScheduledClass';
import type { ScheduledClassRepository } from '../ScheduledClassRepository';
import { nanoid } from 'nanoid';

// Firestore 'in' queries accept a limited number of values, so we chunk the class IDs
const IN_QUERY_CHUNK_SIZE = 10;

/**
 * Firebase implementation of the ScheduledClassRepository
 */
@injectable()
export class FirebaseScheduledClassRepository implements ScheduledClassRepository {
  private readonly collectionName = 'scheduled-classes';
  private readonly idPrefix = 'sch_';

  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a ScheduledClass entity
   */
  private mapToEntity(data: DocumentData): ScheduledClass {
    return ScheduledClass.fromData({
      id: data.id,
      tutorId: data.tutorId,
      classId: data.classId,
      courseId: data.courseId,
      institutionId: data.institutionId,
      scheduledDate: this.toDate(data.scheduledDate),
      meetingUrl: data.meetingUrl,
      status: data.status || ScheduledClassStatus.SCHEDULED,
      createdAt: this.toDate(data.createdAt),
      updatedAt: this.toDate(data.updatedAt),
      title: data.title || undefined,
      cancelReason: data.cancelReason || undefined
    });
  }

  /**
   * Private method to convert ScheduledClass entity to Firestore document data
   */
  private mapToFirestoreData(scheduledClass: ScheduledClass): DocumentData {
    return {
      id: scheduledClass.id,
      tutorId: scheduledClass.tutorId,
      classId: scheduledClass.classId,
      courseId: scheduledClass.courseId,
      institutionId: scheduledClass.institutionId,
      scheduledDate: scheduledClass.scheduledDate,
      meetingUrl: scheduledClass.meetingUrl,
      status: scheduledClass.status,
      createdAt: scheduledClass.createdAt,
      updatedAt: scheduledClass.updatedAt,
      title: scheduledClass.title || null,
      cancelReason: scheduledClass.cancelReason || null
    };
  }

  private toDate(value: Timestamp | Date | string): Date {
    return value instanceof Timestamp ? value.toDate() : new Date(value);
  }

  async save(scheduledClass: ScheduledClass): Promise<ScheduledClass> {
    const docRef = doc(firestore, this.collectionName, scheduledClass.id);
    const data = this.mapToFirestoreData(scheduledClass);

    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, data);
    }

    return scheduledClass;
  }

  async findById(id: string): Promise<ScheduledClass | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return this.mapToEntity({ id, ...snapshot.data() });
  }

  async findByTutorId(tutorId: string): Promise<ScheduledClass[]> {
    const classesRef = collection(firestore, this.collectionName);
    // Sorting is done in memory to avoid requiring a composite Firestore index
    const q = query(classesRef, where('tutorId', '==', tutorId));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(docSnapshot => this.mapToEntity({ id: docSnapshot.id, ...docSnapshot.data() }))
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }

  async findByClassIds(classIds: string[]): Promise<ScheduledClass[]> {
    if (classIds.length === 0) {
      return [];
    }

    const classesRef = collection(firestore, this.collectionName);
    const chunks: string[][] = [];
    for (let i = 0; i < classIds.length; i += IN_QUERY_CHUNK_SIZE) {
      chunks.push(classIds.slice(i, i + IN_QUERY_CHUNK_SIZE));
    }

    const snapshots = await Promise.all(
      chunks.map(chunk => getDocs(query(classesRef, where('classId', 'in', chunk))))
    );

    return snapshots
      .flatMap(snapshot =>
        snapshot.docs.map(docSnapshot => this.mapToEntity({ id: docSnapshot.id, ...docSnapshot.data() }))
      )
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
