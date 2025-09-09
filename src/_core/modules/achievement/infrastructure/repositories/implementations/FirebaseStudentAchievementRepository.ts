import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  limit,
  orderBy,
  DocumentData,
  QueryConstraint,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { StudentAchievement, AchievementType, AchievementMetadata } from '../../../core/entities/StudentAchievement';
import type { StudentAchievementRepository } from '../StudentAchievementRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the StudentAchievementRepository
 */
@injectable()
export class FirebaseStudentAchievementRepository implements StudentAchievementRepository {
  private readonly collectionName = 'student-achievements';
  private readonly idPrefix = 'st_ach_';

  /**
   * Generate a new unique ID for a student achievement
   * @returns A unique ID with the student achievement prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a StudentAchievement entity
   * @param data Firestore document data
   * @returns StudentAchievement entity
   */
  private mapToEntity(data: DocumentData): StudentAchievement {
    return StudentAchievement.create({
      id: data.id,
      userId: data.userId,
      achievementId: data.achievementId,
      institutionId: data.institutionId,
      achievementType: data.achievementType as AchievementType,
      awardedAt: data.awardedAt?.toDate() || new Date(),
      metadata: data.metadata as AchievementMetadata
    });
  }

  /**
   * Private method to convert entity to Firestore data
   * @param studentAchievement StudentAchievement entity
   * @returns Firestore document data
   */
  private mapToFirestore(studentAchievement: StudentAchievement): DocumentData {
    return {
      id: studentAchievement.id,
      userId: studentAchievement.userId,
      achievementId: studentAchievement.achievementId,
      institutionId: studentAchievement.institutionId,
      achievementType: studentAchievement.achievementType,
      awardedAt: Timestamp.fromDate(studentAchievement.awardedAt),
      metadata: studentAchievement.metadata
    };
  }

  async award(studentAchievement: StudentAchievement): Promise<void> {
    const achievementRef = doc(firestore, this.collectionName, studentAchievement.id);
    const data = this.mapToFirestore(studentAchievement);
    await setDoc(achievementRef, data);
  }

  async findByUserAndAchievement(
    userId: string,
    achievementId: string,
    institutionId: string
  ): Promise<StudentAchievement | null> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('achievementId', '==', achievementId),
      where('institutionId', '==', institutionId)
    ];

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    // Should only be one result
    const doc = querySnapshot.docs[0];
    return this.mapToEntity(doc.data());
  }

  async listByUser(
    userId: string,
    institutionId: string,
    options?: {
      achievementType?: AchievementType;
      recentDays?: number;
      limit?: number;
      offset?: number;
      orderBy?: 'awardedAt' | 'achievementId';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<StudentAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('institutionId', '==', institutionId)
    ];

    if (options?.achievementType) {
      constraints.push(where('achievementType', '==', options.achievementType));
    }

    if (options?.recentDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.recentDays);
      constraints.push(where('awardedAt', '>=', Timestamp.fromDate(cutoffDate)));
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
    
    const achievements: StudentAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    // Handle offset manually
    if (options?.offset && options.offset > 0) {
      return achievements.slice(options.offset);
    }

    return achievements;
  }

  async listByAchievement(
    achievementId: string,
    institutionId: string,
    options?: {
      recentDays?: number;
      limit?: number;
      offset?: number;
      orderBy?: 'awardedAt' | 'userId';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<StudentAchievement[]> {
    const constraints: QueryConstraint[] = [
      where('achievementId', '==', achievementId),
      where('institutionId', '==', institutionId)
    ];

    if (options?.recentDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.recentDays);
      constraints.push(where('awardedAt', '>=', Timestamp.fromDate(cutoffDate)));
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
    
    const achievements: StudentAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    // Handle offset manually
    if (options?.offset && options.offset > 0) {
      return achievements.slice(options.offset);
    }

    return achievements;
  }

  async countByUser(userId: string, institutionId: string, achievementType?: AchievementType): Promise<number> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('institutionId', '==', institutionId)
    ];

    if (achievementType) {
      constraints.push(where('achievementType', '==', achievementType));
    }

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  async countByAchievement(achievementId: string, institutionId: string): Promise<number> {
    const constraints: QueryConstraint[] = [
      where('achievementId', '==', achievementId),
      where('institutionId', '==', institutionId)
    ];

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  async hasAchievement(userId: string, achievementId: string, institutionId: string): Promise<boolean> {
    const result = await this.findByUserAndAchievement(userId, achievementId, institutionId);
    return result !== null;
  }

  async getRecentAchievements(
    userId: string,
    institutionId: string,
    hoursBack: number = 24
  ): Promise<StudentAchievement[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursBack);

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('institutionId', '==', institutionId),
      where('awardedAt', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('awardedAt', 'desc')
    ];

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const achievements: StudentAchievement[] = [];
    querySnapshot.forEach((doc) => {
      achievements.push(this.mapToEntity(doc.data()));
    });

    return achievements;
  }

  async getInstitutionStats(institutionId: string): Promise<{
    totalAwarded: number;
    uniqueStudents: number;
    mostEarnedAchievements: Array<{ achievementId: string; count: number; }>;
    recentAwards: number;
  }> {
    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);
    
    const uniqueStudents = new Set<string>();
    const achievementCounts = new Map<string, number>();
    let recentAwards = 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      uniqueStudents.add(data.userId);
      
      // Count achievements
      const count = achievementCounts.get(data.achievementId) || 0;
      achievementCounts.set(data.achievementId, count + 1);
      
      // Count recent awards
      const awardedAt = data.awardedAt?.toDate();
      if (awardedAt && awardedAt >= sevenDaysAgo) {
        recentAwards++;
      }
    });
    
    // Get most earned achievements (top 5)
    const mostEarnedAchievements = Array.from(achievementCounts.entries())
      .map(([achievementId, count]) => ({ achievementId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalAwarded: querySnapshot.size,
      uniqueStudents: uniqueStudents.size,
      mostEarnedAchievements,
      recentAwards
    };
  }

  async getTopStudents(institutionId: string, limit: number = 10): Promise<Array<{
    userId: string;
    achievementCount: number;
    recentCount: number;
  }>> {
    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);
    
    const studentStats = new Map<string, { total: number; recent: number }>();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      
      const stats = studentStats.get(userId) || { total: 0, recent: 0 };
      stats.total++;
      
      const awardedAt = data.awardedAt?.toDate();
      if (awardedAt && awardedAt >= thirtyDaysAgo) {
        stats.recent++;
      }
      
      studentStats.set(userId, stats);
    });
    
    return Array.from(studentStats.entries())
      .map(([userId, stats]) => ({
        userId,
        achievementCount: stats.total,
        recentCount: stats.recent
      }))
      .sort((a, b) => b.achievementCount - a.achievementCount)
      .slice(0, limit);
  }

  async remove(userId: string, achievementId: string, institutionId: string): Promise<void> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('achievementId', '==', achievementId),
      where('institutionId', '==', institutionId)
    ];

    const achievementsRef = collection(firestore, this.collectionName);
    const q = query(achievementsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(docToDelete.ref);
    }
  }

  async bulkAward(studentAchievements: StudentAchievement[]): Promise<void> {
    const batch = writeBatch(firestore);
    
    for (const achievement of studentAchievements) {
      const achievementRef = doc(firestore, this.collectionName, achievement.id);
      const data = this.mapToFirestore(achievement);
      batch.set(achievementRef, data);
    }
    
    await batch.commit();
  }
}