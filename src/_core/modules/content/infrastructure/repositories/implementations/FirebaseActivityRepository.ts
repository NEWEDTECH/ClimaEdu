import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Activity } from '../../../core/entities/Activity';
import type { ActivityRepository } from '../ActivityRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the ActivityRepository
 */
@injectable()
export class FirebaseActivityRepository implements ActivityRepository {
  private readonly collectionName = 'activities';
  private readonly idPrefix = 'act_';

  /**
   * Generate a new unique ID for an activity
   * @returns A unique ID with the activity prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the activity prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to an Activity entity
   * @param data Firestore document data
   * @returns Activity entity
   */
  private mapToEntity(data: DocumentData): Activity {
    // Create and return an Activity entity
    return Activity.create({
      id: data.id,
      lessonId: data.lessonId,
      description: data.description,
      instructions: data.instructions,
      resourceUrl: data.resourceUrl
    });
  }

  /**
   * Find an activity by lesson ID
   * @param lessonId Lesson ID
   * @returns Activity or null if not found
   */
  async findByLessonId(lessonId: string): Promise<Activity | null> {
    const activitiesRef = collection(firestore, this.collectionName);
    const q = query(activitiesRef, where('lessonId', '==', lessonId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Save an activity
   * @param activity Activity to save
   * @returns Saved activity
   */
  async save(activity: Activity): Promise<Activity> {
    const activityRef = doc(firestore, this.collectionName, activity.id);
    
    // Prepare the activity data for Firestore
    const activityData = {
      id: activity.id,
      lessonId: activity.lessonId,
      description: activity.description,
      instructions: activity.instructions,
      resourceUrl: activity.resourceUrl
    };

    // Check if the activity already exists
    const activityDoc = await getDoc(activityRef);
    
    if (activityDoc.exists()) {
      // Update existing activity
      await updateDoc(activityRef, activityData);
    } else {
      // Create new activity
      await setDoc(activityRef, activityData);
    }

    return activity;
  }

  /**
   * Delete an activity
   * @param lessonId Lesson ID
   * @returns true if deleted, false if not found
   */
  async delete(lessonId: string): Promise<boolean> {
    const activity = await this.findByLessonId(lessonId);
    
    if (!activity) {
      return false;
    }

    const activityRef = doc(firestore, this.collectionName, activity.id);
    await deleteDoc(activityRef);
    return true;
  }
}
