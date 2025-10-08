import { injectable } from 'inversify';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { ActivitySubmission } from '../../../core/entities/ActivitySubmission';
import { ActivitySubmissionStatus } from '../../../core/entities/ActivitySubmissionStatus';
import type { ActivitySubmissionRepository } from '../ActivitySubmissionRepository';

/**
 * Firebase implementation of ActivitySubmissionRepository
 * Handles all Firebase-specific operations for activity submissions
 */
@injectable()
export class FirebaseActivitySubmissionRepository implements ActivitySubmissionRepository {
  private readonly collectionName = 'activity_submissions';
  private readonly idPrefix = 'asub_';

  /**
   * Generate a new unique ID for an activity submission
   * @returns A unique ID with the activity submission prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Find an activity submission by ID
   * @param id Activity submission ID
   * @returns ActivitySubmission or null if not found
   */
  async findById(id: string): Promise<ActivitySubmission | null> {
    const submissionRef = doc(firestore, this.collectionName, id);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return null;
    }

    const data = submissionDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find activity submissions by activity ID and student ID
   * @param activityId Activity ID
   * @param studentId Student ID
   * @returns Array of activity submissions
   */
  async findByActivityAndStudent(
    activityId: string,
    studentId: string
  ): Promise<ActivitySubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(
      submissionsRef,
      where('activityId', '==', activityId),
      where('studentId', '==', studentId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Find activity submissions by activity ID
   * @param activityId Activity ID
   * @returns Array of activity submissions
   */
  async findByActivityId(activityId: string): Promise<ActivitySubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(submissionsRef, where('activityId', '==', activityId));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Find activity submissions by student ID
   * @param studentId Student ID
   * @param institutionId Institution ID
   * @returns Array of activity submissions
   */
  async findByStudentId(
    studentId: string,
    institutionId: string
  ): Promise<ActivitySubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(
      submissionsRef,
      where('studentId', '==', studentId),
      where('institutionId', '==', institutionId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Find activity submissions by status
   * @param status Submission status
   * @param institutionId Institution ID
   * @returns Array of activity submissions
   */
  async findByStatus(
    status: ActivitySubmissionStatus,
    institutionId: string
  ): Promise<ActivitySubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(
      submissionsRef,
      where('status', '==', status),
      where('institutionId', '==', institutionId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Save an activity submission
   * @param submission Activity submission to save
   * @returns Saved activity submission
   */
  async save(submission: ActivitySubmission): Promise<ActivitySubmission> {
    const submissionRef = doc(firestore, this.collectionName, submission.id);

    const submissionData = {
      id: submission.id,
      activityId: submission.activityId,
      studentId: submission.studentId,
      institutionId: submission.institutionId,
      fileUrls: submission.fileUrls,
      status: submission.status,
      feedback: submission.feedback,
      reviewedBy: submission.reviewedBy,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
    };

    const submissionDoc = await getDoc(submissionRef);

    if (submissionDoc.exists()) {
      await updateDoc(submissionRef, submissionData);
    } else {
      await setDoc(submissionRef, submissionData);
    }

    return submission;
  }

  /**
   * Delete an activity submission
   * @param id Activity submission ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const submissionRef = doc(firestore, this.collectionName, id);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return false;
    }

    await deleteDoc(submissionRef);
    return true;
  }

  /**
   * Map Firestore data to ActivitySubmission entity
   * @param data Firestore data
   * @returns ActivitySubmission entity
   */
  private mapToEntity(data: Record<string, unknown> & { id: string }): ActivitySubmission {
    return ActivitySubmission.create({
      id: data.id,
      activityId: data.activityId as string,
      studentId: data.studentId as string,
      institutionId: data.institutionId as string,
      fileUrls: (data.fileUrls as string[]) || [],
      status: data.status as ActivitySubmissionStatus,
      feedback: (data.feedback as string | null) || null,
      reviewedBy: (data.reviewedBy as string | null) || null,
      submittedAt: data.submittedAt && typeof data.submittedAt === 'object' && 'toDate' in data.submittedAt && typeof data.submittedAt.toDate === 'function' ? data.submittedAt.toDate() : new Date(data.submittedAt as Date),
      reviewedAt: data.reviewedAt && typeof data.reviewedAt === 'object' && 'toDate' in data.reviewedAt && typeof data.reviewedAt.toDate === 'function' ? data.reviewedAt.toDate() : (data.reviewedAt ? new Date(data.reviewedAt as Date) : null),
    });
  }
}
