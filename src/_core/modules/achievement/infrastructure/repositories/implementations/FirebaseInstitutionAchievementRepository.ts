import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit,
  orderBy,
  startAfter,
  DocumentData,
  QueryConstraint 
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { InstitutionAchievement } from '../../../core/entities/InstitutionAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';
import type { InstitutionAchievementRepository } from '../InstitutionAchievementRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the InstitutionAchievementRepository
 */
@injectable()
export class FirebaseInstitutionAchievementRepository implements InstitutionAchievementRepository {
  private readonly collectionName = 'achievements/institution/items';
  private readonly idPrefix = 'inst_ach_';

  /**
   * Generate a new unique ID for an institution achievement
   * @returns A unique ID with the institution achievement prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to an InstitutionAchievement entity
   * @param data Firestore document data
   * @returns InstitutionAchievement entity
   */
  private mapToEntity(data: DocumentData): InstitutionAchievement {
    return InstitutionAchievement.create({
      id: data.id,
      institutionId: data.institutionId,
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      criteriaType: data.criteriaType as BadgeCriteriaType,
      criteriaValue: data.criteriaValue,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    });
  }

  /**
   * Private method to convert entity to Firestore data
   * @param achievement InstitutionAchievement entity
   * @returns Firestore document data
   */
  private mapToFirestore(achievement: InstitutionAchievement): DocumentData {
    return {
      id: achievement.id,
      institutionId: achievement.institutionId,
      name: achievement.name,
      description: achievement.description,
      iconUrl: achievement.iconUrl,
      criteriaType: achievement.criteriaType,
      criteriaValue: achievement.criteriaValue,
      isActive: achievement.isActive,
      createdAt: achievement.createdAt,
      updatedAt: achievement.updatedAt,
      createdBy: achievement.createdBy
    };
  }

  async create(achievement: InstitutionAchievement): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, achievement.id);
    const data = this.mapToFirestore(achievement);
    await setDoc(achievementRef, data);
  }

  async update(achievement: InstitutionAchievement): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, achievement.id);
    const data = this.mapToFirestore(achievement);
    await updateDoc(achievementRef, data);
  }

  async delete(achievementId: string, institutionId: string): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, achievementId);
    
    // Verify the achievement belongs to the institution before deletion
    const achievementDoc = await getDoc(achievementRef);
    if (!achievementDoc.exists()) {
      throw new Error('Achievement not found');
    }
    
    const data = achievementDoc.data();
    if (data.institutionId !== institutionId) {
      throw new Error('Achievement does not belong to this institution');
    }
    
    await deleteDoc(achievementRef);
  }

  async findById(achievementId: string, institutionId: string): Promise<InstitutionAchievement | null> {
    const achievementRef = doc(firestore, this.collectionName, achievementId);
    const achievementDoc = await getDoc(achievementRef);
    
    if (!achievementDoc.exists()) {
      return null;
    }
    
    const data = achievementDoc.data();
    
    // Verify the achievement belongs to the institution
    if (data.institutionId !== institutionId) {
      return null;
    }
    
    return this.mapToEntity(data);
  }

  async listByInstitution(
    institutionId: string,
    options?: {
      isActive?: boolean;
      limit?: number;
      offset?: number;
      orderBy?: 'createdAt' | 'updatedAt' | 'name';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<InstitutionAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('institutionId', '==', institutionId)
    ];

    if (options?.isActive !== undefined) {
      constraints.push(where('isActive', '==', options.isActive));
    }

    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection || 'desc'));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: InstitutionAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    // Handle offset manually since Firestore doesn't support OFFSET directly
    if (options?.offset && options.offset > 0) {
      return achievements.slice(options.offset);
    }

    return achievements;
  }

  async countByInstitution(institutionId: string, isActive?: boolean): Promise<number> {
    const constraints: QueryConstraint[] = [
      where('institutionId', '==', institutionId)
    ];

    if (isActive !== undefined) {
      constraints.push(where('isActive', '==', isActive));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  async findByCriteriaType(
    institutionId: string,
    criteriaType: string,
    isActive?: boolean
  ): Promise<InstitutionAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('institutionId', '==', institutionId),
      where('criteriaType', '==', criteriaType)
    ];

    if (isActive !== undefined) {
      constraints.push(where('isActive', '==', isActive));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: InstitutionAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    return achievements;
  }

  async existsByName(institutionId: string, name: string, excludeId?: string): Promise<boolean> {
    const constraints: QueryConstraint[] = [
      where('institutionId', '==', institutionId),
      where('name', '==', name)
    ];

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    if (excludeId) {
      // Check if any document has a different ID than excludeId
      let found = false;
      querySnapshot.forEach((doc) => {
        if (doc.data().id !== excludeId) {
          found = true;
        }
      });
      return found;
    }
    
    return querySnapshot.size > 0;
  }

  async findByInstitutionId(institutionId: string): Promise<InstitutionAchievement[]> {
    return this.listByInstitution(institutionId, { isActive: true });
  }
}