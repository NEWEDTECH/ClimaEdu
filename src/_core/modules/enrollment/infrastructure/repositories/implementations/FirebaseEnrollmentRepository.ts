import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Enrollment } from '../../../core/entities/Enrollment';
import { EnrollmentStatus } from '../../../core/entities/EnrollmentStatus';
import type { EnrollmentRepository } from '../EnrollmentRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the EnrollmentRepository
 */
@injectable()
export class FirebaseEnrollmentRepository implements EnrollmentRepository {
  private readonly collectionName = 'enrollments';
  private readonly idPrefix = 'enr_';

  /**
   * Generate a new unique ID for an enrollment
   * @returns A unique ID with the enrollment prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the enrollment prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to an Enrollment entity
   * @param data Firestore document data
   * @returns Enrollment entity
   */
  private mapToEntity(data: DocumentData): Enrollment {
    // Convert Firestore timestamps to Date objects
    const enrolledAt = data.enrolledAt instanceof Timestamp 
      ? data.enrolledAt.toDate() 
      : new Date(data.enrolledAt);
    
    const completedAt = data.completedAt instanceof Timestamp 
      ? data.completedAt.toDate() 
      : data.completedAt ? new Date(data.completedAt) : undefined;
    
    // Create and return an Enrollment entity
    // Use a default institutionId if not present in the data
    return Enrollment.create({
      id: data.id,
      userId: data.userId,
      courseId: data.courseId,
      institutionId: data.institutionId,
      status: data.status as EnrollmentStatus,
      enrolledAt,
      completedAt
    });
  }

  /**
   * Find an enrollment by id
   * @param id Enrollment id
   * @returns Enrollment or null if not found
   */
  async findById(id: string): Promise<Enrollment | null> {
    const enrollmentRef = doc(firestore, this.collectionName, id);
    const enrollmentDoc = await getDoc(enrollmentRef);

    if (!enrollmentDoc.exists()) {
      return null;
    }

    const data = enrollmentDoc.data();
    
    // Check for required fields
    if (!data.institutionId || !data.courseId || !data.userId) {
      console.warn(`Invalid enrollment ${id}: missing required fields`);
      return null;
    }
    
    try {
      return this.mapToEntity({ id, ...data });
    } catch (error) {
      console.warn(`Invalid enrollment ${id}:`, error);
      return null;
    }
  }

  /**
   * Find an enrollment by user and course
   * @param userId User id
   * @param courseId Course id
   * @returns Enrollment or null if not found
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    const enrollmentsRef = collection(firestore, this.collectionName);
    const q = query(
      enrollmentsRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Check for required fields
    if (!data.institutionId || !data.courseId || !data.userId) {
      console.warn(`Invalid enrollment ${doc.id}: missing required fields`);
      return null;
    }
    
    try {
      return this.mapToEntity({ id: doc.id, ...data });
    } catch (error) {
      console.warn(`Invalid enrollment ${doc.id}:`, error);
      return null;
    }
  }

  /**
   * Save an enrollment
   * @param enrollment Enrollment to save
   * @returns Saved enrollment
   */
  async save(enrollment: Enrollment): Promise<Enrollment> {
    const enrollmentRef = doc(firestore, this.collectionName, enrollment.id);
    
    // Prepare the enrollment data for Firestore
    const enrollmentData: Record<string, string | Date | EnrollmentStatus | undefined> = {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      institutionId: enrollment.institutionId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt
    };
  
    if (enrollment.completedAt !== undefined) {
      enrollmentData.completedAt = enrollment.completedAt;
    }

    // Check if the enrollment already exists
    const enrollmentDoc = await getDoc(enrollmentRef);
    
    if (enrollmentDoc.exists()) {
      // Update existing enrollment
      await updateDoc(enrollmentRef, enrollmentData);
    } else {
      // Create new enrollment
      await setDoc(enrollmentRef, enrollmentData);
    }

    return enrollment;
  }

  /**
   * Delete an enrollment
   * @param id Enrollment id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const enrollmentRef = doc(firestore, this.collectionName, id);
    const enrollmentDoc = await getDoc(enrollmentRef);

    if (!enrollmentDoc.exists()) {
      return false;
    }

    await deleteDoc(enrollmentRef);
    return true;
  }

  /**
   * List enrollments by user
   * @param userId User id
   * @returns List of enrollments
   */
  async listByUser(userId: string): Promise<Enrollment[]> {
    const enrollmentsRef = collection(firestore, this.collectionName);
    const q = query(enrollmentsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const enrollments: Enrollment[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Skip enrollments with missing required fields
      if ( !data.courseId || !data.userId) {
        console.warn(`Skipping invalid enrollment ${doc.id}: missing required fields`);
        continue;
      }
      
      try {
        const enrollment = this.mapToEntity({ id: doc.id, ...data });
        enrollments.push(enrollment);
      } catch (error) {
        console.warn(`Skipping invalid enrollment ${doc.id}:`, error);
      }
    }

    return enrollments;
  }

  /**
   * List enrollments by course
   * @param courseId Course id
   * @returns List of enrollments
   */
  async listByCourse(courseId: string): Promise<Enrollment[]> {
    const enrollmentsRef = collection(firestore, this.collectionName);
    const q = query(enrollmentsRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);

    const enrollments: Enrollment[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Skip enrollments with missing required fields
      if (!data.institutionId || !data.courseId || !data.userId) {
        console.warn(`Skipping invalid enrollment ${doc.id}: missing required fields`);
        continue;
      }
      
      try {
        const enrollment = this.mapToEntity({ id: doc.id, ...data });
        enrollments.push(enrollment);
      } catch (error) {
        console.warn(`Skipping invalid enrollment ${doc.id}:`, error);
      }
    }

    return enrollments;
  }

  /**
   * List enrollments by institution
   * @param institutionId Institution id
   * @returns List of enrollments
   */
  async listByInstitution(institutionId: string): Promise<Enrollment[]> {
    const enrollmentsRef = collection(firestore, this.collectionName);
    const q = query(enrollmentsRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);

    const enrollments: Enrollment[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Skip enrollments with missing required fields
      if (!data.institutionId || !data.courseId || !data.userId) {
        console.warn(`Skipping invalid enrollment ${doc.id}: missing required fields`);
        continue;
      }
      
      try {
        const enrollment = this.mapToEntity({ id: doc.id, ...data });
        enrollments.push(enrollment);
      } catch (error) {
        console.warn(`Skipping invalid enrollment ${doc.id}:`, error);
      }
    }

    return enrollments;
  }
}
