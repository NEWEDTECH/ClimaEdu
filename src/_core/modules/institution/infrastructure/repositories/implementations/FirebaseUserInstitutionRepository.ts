import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { UserInstitution } from '../../../core/entities/UserInstitution';
import type { UserInstitutionRepository } from '../UserInstitutionRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the UserInstitutionRepository
 */
@injectable()
export class FirebaseUserInstitutionRepository implements UserInstitutionRepository {
  private readonly collectionName = 'user_institutions';
  private readonly idPrefix = 'usr_inst_';

  /**
   * Generate a new unique ID for a user-institution association
   * @returns A unique ID with the user-institution prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a UserInstitution entity
   * @param data Firestore document data
   * @returns UserInstitution entity
   */
  private mapToEntity(data: DocumentData): UserInstitution {
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    return UserInstitution.create({
      id: data.id,
      userId: data.userId,
      institutionId: data.institutionId,
      userRole: data.userRole,
      createdAt,
      updatedAt
    });
  }

  /**
   * Find a user-institution association by id
   * @param id Association id
   * @returns UserInstitution or null if not found
   */
  async findById(id: string): Promise<UserInstitution | null> {
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
   * @returns List of UserInstitution
   */
  async findByUserId(userId: string): Promise<UserInstitution[]> {

    const contentsRef = collection(firestore, this.collectionName);
    
    const q = query(contentsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find associations by institution ID
   * @param institutionId Institution ID
   * @returns List of UserInstitution
   */
  async findByInstitutionId(institutionId: string): Promise<UserInstitution[]> {
    const q = query(
      collection(firestore, this.collectionName),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find a specific association between user and institution
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns UserInstitution or null if not found
   */
  async findByUserAndInstitution(userId: string, institutionId: string): Promise<UserInstitution | null> {
    const q = query(
      collection(firestore, this.collectionName),
      where('userId', '==', userId),
      where('institutionId', '==', institutionId)
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
   * Save a user-institution association
   * @param userInstitution UserInstitution to save
   * @returns Saved UserInstitution
   */
  async save(userInstitution: UserInstitution): Promise<UserInstitution> {
    const docRef = doc(firestore, this.collectionName, userInstitution.id);
    
    const data = {
      id: userInstitution.id,
      userId: userInstitution.userId,
      institutionId: userInstitution.institutionId,
      createdAt: userInstitution.createdAt,
      updatedAt: userInstitution.updatedAt
    };

    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, data);
    }

    return userInstitution;
  }

  /**
   * Delete a user-institution association
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
