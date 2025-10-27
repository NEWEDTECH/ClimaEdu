import { injectable } from 'inversify';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { UserAccessHistory } from '../../../core/entities/UserAccessHistory';
import type { UserAccessHistoryRepository } from '../UserAccessHistoryRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the UserAccessHistoryRepository
 *
 * Manages user access history in Firestore subcollection:
 * /users/{userId}/access-history/{institutionId}
 */
@injectable()
export class FirebaseUserAccessHistoryRepository implements UserAccessHistoryRepository {
  private readonly collectionName = 'users';
  private readonly subcollectionName = 'access-history';
  private readonly idPrefix = 'uah_';

  /**
   * Generate a new unique ID for a user access history record
   *
   * @returns A unique ID with the user access history prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private method to convert Firestore document data to UserAccessHistory entity
   *
   * @param data Firestore document data
   * @param userId User ID
   * @param institutionId Institution ID (document ID)
   * @returns UserAccessHistory entity
   */
  private mapToEntity(data: DocumentData, userId: string, institutionId: string): UserAccessHistory {
    // Convert Firestore timestamps to Date objects
    const lastAccessDate = data.lastAccessDate instanceof Timestamp
      ? data.lastAccessDate.toDate()
      : new Date(data.lastAccessDate);

    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt);

    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt);

    // The document ID in subcollection is the institutionId
    // We generate a composite ID for the entity
    const id = data.id || `${this.idPrefix}${userId}_${institutionId}`;

    return UserAccessHistory.create({
      id,
      userId,
      institutionId,
      lastAccessDate,
      consecutiveDays: data.consecutiveDays,
      totalAccessDays: data.totalAccessDays,
      createdAt,
      updatedAt
    });
  }

  /**
   * Find access history by user and institution
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns UserAccessHistory or null if not found
   */
  async findByUserAndInstitution(
    userId: string,
    institutionId: string
  ): Promise<UserAccessHistory | null> {
    const docRef = doc(
      firestore,
      this.collectionName,
      userId,
      this.subcollectionName,
      institutionId
    );

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return this.mapToEntity(data, userId, institutionId);
  }

  /**
   * Find all access histories for a specific user across all institutions
   *
   * @param userId User ID
   * @returns Array of UserAccessHistory
   */
  async findByUser(userId: string): Promise<UserAccessHistory[]> {
    const subcollectionRef = collection(
      firestore,
      this.collectionName,
      userId,
      this.subcollectionName
    );

    const querySnapshot = await getDocs(subcollectionRef);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const institutionId = doc.id; // Document ID is the institution ID
      return this.mapToEntity(data, userId, institutionId);
    });
  }

  /**
   * Save a user access history record
   *
   * Creates a new record if it doesn't exist, updates if it does.
   *
   * @param accessHistory UserAccessHistory to save
   * @returns Saved UserAccessHistory
   */
  async save(accessHistory: UserAccessHistory): Promise<UserAccessHistory> {
    const docRef = doc(
      firestore,
      this.collectionName,
      accessHistory.userId,
      this.subcollectionName,
      accessHistory.institutionId
    );

    // Prepare data for Firestore
    const data = {
      id: accessHistory.id,
      userId: accessHistory.userId,
      institutionId: accessHistory.institutionId,
      lastAccessDate: Timestamp.fromDate(accessHistory.lastAccessDate),
      consecutiveDays: accessHistory.consecutiveDays,
      totalAccessDays: accessHistory.totalAccessDays,
      createdAt: Timestamp.fromDate(accessHistory.createdAt),
      updatedAt: Timestamp.fromDate(accessHistory.updatedAt)
    };

    // Check if document exists
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, data);
    } else {
      // Create new document
      await setDoc(docRef, data);
    }

    return accessHistory;
  }

  /**
   * Delete a user access history record
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns true if deleted, false if not found
   */
  async delete(userId: string, institutionId: string): Promise<boolean> {
    const docRef = doc(
      firestore,
      this.collectionName,
      userId,
      this.subcollectionName,
      institutionId
    );

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    await deleteDoc(docRef);
    return true;
  }

  /**
   * Count total access history records for a user
   *
   * @param userId User ID
   * @returns Number of access history records
   */
  async countByUser(userId: string): Promise<number> {
    const subcollectionRef = collection(
      firestore,
      this.collectionName,
      userId,
      this.subcollectionName
    );

    const querySnapshot = await getDocs(subcollectionRef);
    return querySnapshot.size;
  }

  /**
   * Check if an access history record exists for a user and institution
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns true if exists, false otherwise
   */
  async exists(userId: string, institutionId: string): Promise<boolean> {
    const docRef = doc(
      firestore,
      this.collectionName,
      userId,
      this.subcollectionName,
      institutionId
    );

    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }
}
