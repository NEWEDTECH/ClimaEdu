import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit,
  orderBy,
  DocumentData,
  QueryConstraint,
  writeBatch 
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { DefaultAchievement } from '../../../core/entities/DefaultAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';
import type { DefaultAchievementRepository } from '../DefaultAchievementRepository';

/**
 * Firebase implementation of the DefaultAchievementRepository
 */
@injectable()
export class FirebaseDefaultAchievementRepository implements DefaultAchievementRepository {
  private readonly collectionName = 'achievements/default/items';

  /**
   * Private adapter method to convert Firestore document data to a DefaultAchievement entity
   * @param data Firestore document data
   * @returns DefaultAchievement entity
   */
  private mapToEntity(data: DocumentData): DefaultAchievement {
    return DefaultAchievement.create({
      id: data.id,
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      criteriaType: data.criteriaType as BadgeCriteriaType,
      criteriaValue: data.criteriaValue,
      category: data.category,
      isGloballyEnabled: data.isGloballyEnabled,
      version: data.version,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    });
  }

  /**
   * Private method to convert entity to Firestore data
   * @param achievement DefaultAchievement entity
   * @returns Firestore document data
   */
  private mapToFirestore(achievement: DefaultAchievement): DocumentData {
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      iconUrl: achievement.iconUrl,
      criteriaType: achievement.criteriaType,
      criteriaValue: achievement.criteriaValue,
      category: achievement.category,
      isGloballyEnabled: achievement.isGloballyEnabled,
      version: achievement.version,
      createdAt: achievement.createdAt,
      updatedAt: achievement.updatedAt
    };
  }

  async create(achievement: DefaultAchievement): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, achievement.id);
    const data = this.mapToFirestore(achievement);
    await setDoc(achievementRef, data);
  }

  async update(achievement: DefaultAchievement): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, achievement.id);
    const data = this.mapToFirestore(achievement);
    await updateDoc(achievementRef, data);
  }

  async findById(achievementId: string): Promise<DefaultAchievement | null> {
    const achievementRef = doc(firestore, this.collectionName, achievementId);
    const achievementDoc = await getDoc(achievementRef);
    
    if (!achievementDoc.exists()) {
      return null;
    }
    
    return this.mapToEntity(achievementDoc.data());
  }

  async listAll(options?: {
    isGloballyEnabled?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'name' | 'category';
    orderDirection?: 'asc' | 'desc';
  }): Promise<DefaultAchievement[]> {
    const constraints: QueryConstraint[] = [];

    if (options?.isGloballyEnabled !== undefined) {
      constraints.push(where('isGloballyEnabled', '==', options.isGloballyEnabled));
    }

    if (options?.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection || 'asc'));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: DefaultAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    // Handle offset manually since Firestore doesn't support OFFSET directly
    if (options?.offset && options.offset > 0) {
      return achievements.slice(options.offset);
    }

    return achievements;
  }

  async listByCategory(category: string, isGloballyEnabled?: boolean): Promise<DefaultAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('category', '==', category)
    ];

    if (isGloballyEnabled !== undefined) {
      constraints.push(where('isGloballyEnabled', '==', isGloballyEnabled));
    }

    constraints.push(orderBy('name', 'asc'));

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: DefaultAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    return achievements;
  }

  async findByCriteriaType(criteriaType: string, isGloballyEnabled?: boolean): Promise<DefaultAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('criteriaType', '==', criteriaType)
    ];

    if (isGloballyEnabled !== undefined) {
      constraints.push(where('isGloballyEnabled', '==', isGloballyEnabled));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: DefaultAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    return achievements;
  }

  async getCategories(): Promise<string[]> {
    const achievementsRef = collection(firestore, this.collectionName);
    const querySnapshot = await getDocs(achievementsRef);
    
    const categories = new Set<string>();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return Array.from(categories).sort();
  }

  async count(isGloballyEnabled?: boolean): Promise<number> {
    const constraints: QueryConstraint[] = [];

    if (isGloballyEnabled !== undefined) {
      constraints.push(where('isGloballyEnabled', '==', isGloballyEnabled));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const constraints: QueryConstraint[] = [
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

  async bulkCreate(achievements: DefaultAchievement[]): Promise<void> {
    const batch = writeBatch(firestore);
    
    for (const achievement of achievements) {
      const achievementRef = doc(firestore, this.collectionName, achievement.id);
      const data = this.mapToFirestore(achievement);
      batch.set(achievementRef, data);
    }
    
    await batch.commit();
  }
}