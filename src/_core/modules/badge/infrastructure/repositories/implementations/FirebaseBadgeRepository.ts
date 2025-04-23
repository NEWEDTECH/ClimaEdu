import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Badge } from '../../../core/entities/Badge';
import { BadgeCriteriaType } from '../../../core/entities/BadgeCriteriaType';
import type { BadgeRepository } from '../BadgeRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the BadgeRepository
 */
@injectable()
export class FirebaseBadgeRepository implements BadgeRepository {
  private readonly collectionName = 'badges';
  private readonly idPrefix = 'bdg_';

  /**
   * Generate a new unique ID for a badge
   * @returns A unique ID with the badge prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the badge prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Badge entity
   * @param data Firestore document data
   * @returns Badge entity
   */
  private mapToEntity(data: DocumentData): Badge {
    // Create and return a Badge entity
    return Badge.create({
      id: data.id,
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      criteriaType: data.criteriaType as BadgeCriteriaType,
      criteriaValue: data.criteriaValue
    });
  }

  /**
   * Find a badge by id
   * @param id Badge id
   * @returns Badge or null if not found
   */
  async findById(id: string): Promise<Badge | null> {
    const badgeRef = doc(firestore, this.collectionName, id);
    const badgeDoc = await getDoc(badgeRef);

    if (!badgeDoc.exists()) {
      return null;
    }

    const data = badgeDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find badges by criteria type
   * @param criteriaType The type of criteria to filter by
   * @returns Array of badges
   */
  async findByCriteriaType(criteriaType: BadgeCriteriaType): Promise<Badge[]> {
    const badgesRef = collection(firestore, this.collectionName);
    const q = query(badgesRef, where('criteriaType', '==', criteriaType));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * List all badges
   * @returns Array of all badges
   */
  async listAll(): Promise<Badge[]> {
    const badgesRef = collection(firestore, this.collectionName);
    const querySnapshot = await getDocs(badgesRef);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Save a badge
   * @param badge Badge to save
   * @returns Saved badge
   */
  async save(badge: Badge): Promise<Badge> {
    const badgeRef = doc(firestore, this.collectionName, badge.id);
    
    // Prepare the badge data for Firestore
    const badgeData = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      criteriaType: badge.criteriaType,
      criteriaValue: badge.criteriaValue
    };

    // Check if the badge already exists
    const badgeDoc = await getDoc(badgeRef);
    
    if (badgeDoc.exists()) {
      // Update existing badge
      await updateDoc(badgeRef, badgeData);
    } else {
      // Create new badge
      await setDoc(badgeRef, badgeData);
    }

    return badge;
  }

  /**
   * Delete a badge
   * @param id Badge id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const badgeRef = doc(firestore, this.collectionName, id);
    const badgeDoc = await getDoc(badgeRef);

    if (!badgeDoc.exists()) {
      return false;
    }

    await deleteDoc(badgeRef);
    return true;
  }
}
