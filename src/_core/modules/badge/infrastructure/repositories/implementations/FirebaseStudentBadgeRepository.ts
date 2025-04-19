import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { StudentBadge } from '../../../core/entities/StudentBadge';
import { Badge } from '../../../core/entities/Badge';
import type { StudentBadgeRepository } from '../StudentBadgeRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the StudentBadgeRepository
 */
@injectable()
export class FirebaseStudentBadgeRepository implements StudentBadgeRepository {
  private readonly collectionName = 'student_badges';
  private readonly badgesCollectionName = 'badges';
  private readonly idPrefix = 'sbdg_';

  /**
   * Generate a new unique ID for a student badge
   * @returns A unique ID with the student badge prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the student badge prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a StudentBadge entity
   * @param data Firestore document data
   * @returns StudentBadge entity
   */
  private mapToEntity(data: DocumentData): StudentBadge {
    // Convert Firestore timestamp to Date object
    const awardedAt = data.awardedAt instanceof Timestamp 
      ? data.awardedAt.toDate() 
      : new Date(data.awardedAt);
    
    // Create and return a StudentBadge entity
    return StudentBadge.create({
      id: data.id,
      userId: data.userId,
      badgeId: data.badgeId,
      institutionId: data.institutionId,
      awardedAt
    });
  }

  /**
   * Find a student badge by id
   * @param id Student badge id
   * @returns Student badge or null if not found
   */
  async findById(id: string): Promise<StudentBadge | null> {
    const studentBadgeRef = doc(firestore, this.collectionName, id);
    const studentBadgeDoc = await getDoc(studentBadgeRef);

    if (!studentBadgeDoc.exists()) {
      return null;
    }

    const data = studentBadgeDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find student badges by user id
   * @param userId User id
   * @param institutionId Institution id
   * @returns Array of student badges
   */
  async findByUser(userId: string, institutionId: string): Promise<StudentBadge[]> {
    const studentBadgesRef = collection(firestore, this.collectionName);
    const q = query(
      studentBadgesRef,
      where('userId', '==', userId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find student badges by badge id
   * @param badgeId Badge id
   * @param institutionId Institution id
   * @returns Array of student badges
   */
  async findByBadge(badgeId: string, institutionId: string): Promise<StudentBadge[]> {
    const studentBadgesRef = collection(firestore, this.collectionName);
    const q = query(
      studentBadgesRef,
      where('badgeId', '==', badgeId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Check if a user has a specific badge
   * @param userId User id
   * @param badgeId Badge id
   * @param institutionId Institution id
   * @returns True if the user has the badge, false otherwise
   */
  async hasUserEarnedBadge(userId: string, badgeId: string, institutionId: string): Promise<boolean> {
    const studentBadgesRef = collection(firestore, this.collectionName);
    const q = query(
      studentBadgesRef,
      where('userId', '==', userId),
      where('badgeId', '==', badgeId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  }

  /**
   * Get all badges earned by a user with badge details
   * @param userId User id
   * @param institutionId Institution id
   * @returns Array of badges with their details
   */
  async getEarnedBadgesWithDetails(userId: string, institutionId: string): Promise<{
    studentBadge: StudentBadge;
    badge: Badge;
  }[]> {
    const studentBadges = await this.findByUser(userId, institutionId);
    const result: { studentBadge: StudentBadge; badge: Badge }[] = [];

    for (const studentBadge of studentBadges) {
      const badgeRef = doc(firestore, this.badgesCollectionName, studentBadge.badgeId);
      const badgeDoc = await getDoc(badgeRef);

      if (badgeDoc.exists()) {
        const badgeData = badgeDoc.data();
        const badge = Badge.create({
          id: studentBadge.badgeId,
          name: badgeData.name,
          description: badgeData.description,
          iconUrl: badgeData.iconUrl,
          criteriaType: badgeData.criteriaType,
          criteriaValue: badgeData.criteriaValue
        });

        result.push({ studentBadge, badge });
      }
    }

    return result;
  }

  /**
   * Save a student badge
   * @param studentBadge Student badge to save
   * @returns Saved student badge
   */
  async save(studentBadge: StudentBadge): Promise<StudentBadge> {
    const studentBadgeRef = doc(firestore, this.collectionName, studentBadge.id);
    
    // Prepare the student badge data for Firestore
    const studentBadgeData = {
      id: studentBadge.id,
      userId: studentBadge.userId,
      badgeId: studentBadge.badgeId,
      institutionId: studentBadge.institutionId,
      awardedAt: studentBadge.awardedAt
    };

    // Check if the student badge already exists
    const studentBadgeDoc = await getDoc(studentBadgeRef);
    
    if (studentBadgeDoc.exists()) {
      // Update existing student badge
      await updateDoc(studentBadgeRef, studentBadgeData);
    } else {
      // Create new student badge
      await setDoc(studentBadgeRef, studentBadgeData);
    }

    return studentBadge;
  }

  /**
   * Delete a student badge
   * @param id Student badge id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const studentBadgeRef = doc(firestore, this.collectionName, id);
    const studentBadgeDoc = await getDoc(studentBadgeRef);

    if (!studentBadgeDoc.exists()) {
      return false;
    }

    await deleteDoc(studentBadgeRef);
    return true;
  }
}
