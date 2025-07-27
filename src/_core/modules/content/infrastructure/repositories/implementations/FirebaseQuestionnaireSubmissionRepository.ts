import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { QuestionnaireSubmission } from '../../../core/entities/QuestionnaireSubmission';
import type { QuestionnaireSubmissionRepository } from '../QuestionnaireSubmissionRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the QuestionnaireSubmissionRepository
 */
@injectable()
export class FirebaseQuestionnaireSubmissionRepository implements QuestionnaireSubmissionRepository {
  private readonly collectionName = 'questionnaire_submissions';
  private readonly idPrefix = 'subq_';

  /**
   * Generate a new unique ID for a questionnaire submission
   * @returns A unique ID with the questionnaire submission prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the questionnaire submission prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a QuestionnaireSubmission entity
   * @param data Firestore document data
   * @returns QuestionnaireSubmission entity
   */
  private mapToEntity(data: DocumentData): QuestionnaireSubmission {
    // Convert Firestore timestamps to Date objects
    const startedAt = data.startedAt instanceof Timestamp 
      ? data.startedAt.toDate() 
      : new Date(data.startedAt);
    
    const completedAt = data.completedAt instanceof Timestamp 
      ? data.completedAt.toDate() 
      : new Date(data.completedAt);
    
    // Create and return a QuestionnaireSubmission entity
    return QuestionnaireSubmission.create({
      id: data.id,
      questionnaireId: data.questionnaireId,
      userId: data.userId,
      institutionId: data.institutionId,
      startedAt,
      completedAt,
      score: data.score,
      passed: data.passed,
      attempt: data.attempt,
      questions: data.questions || []
    });
  }

  /**
   * Find a questionnaire submission by id
   * @param id Questionnaire submission id
   * @returns Questionnaire submission or null if not found
   */
  async findById(id: string): Promise<QuestionnaireSubmission | null> {
    const submissionRef = doc(firestore, this.collectionName, id);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      return null;
    }

    const data = submissionDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find questionnaire submissions by questionnaire id and user id
   * @param questionnaireId Questionnaire id
   * @param userId User id
   * @returns Array of questionnaire submissions
   */
  async findByQuestionnaireAndUser(questionnaireId: string, userId: string): Promise<QuestionnaireSubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(
      submissionsRef,
      where('questionnaireId', '==', questionnaireId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Count the number of attempts for a questionnaire by a user
   * @param questionnaireId Questionnaire id
   * @param userId User id
   * @returns Number of attempts
   */
  async countAttempts(questionnaireId: string, userId: string): Promise<number> {
    const submissions = await this.findByQuestionnaireAndUser(questionnaireId, userId);
    return submissions.length;
  }

  /**
   * Save a questionnaire submission
   * @param submission Questionnaire submission to save
   * @returns Saved questionnaire submission
   */
  async save(submission: QuestionnaireSubmission): Promise<QuestionnaireSubmission> {
    const submissionRef = doc(firestore, this.collectionName, submission.id);
    
    // Convert QuestionSubmission objects to plain objects for Firestore
    const questionsData = submission.questions.map(question => ({
      id: question.id,
      questionId: question.questionId,
      selectedOptionIndex: question.selectedOptionIndex,
      isCorrect: question.isCorrect
    }));
    
    // Prepare the submission data for Firestore
    const submissionData = {
      id: submission.id,
      questionnaireId: submission.questionnaireId,
      userId: submission.userId,
      institutionId: submission.institutionId,
      startedAt: submission.startedAt,
      completedAt: submission.completedAt,
      score: submission.score,
      passed: submission.passed,
      attempt: submission.attempt,
      questions: questionsData
    };

    // Check if the submission already exists
    const submissionDoc = await getDoc(submissionRef);
    
    if (submissionDoc.exists()) {
      // Update existing submission
      await updateDoc(submissionRef, submissionData);
    } else {
      // Create new submission
      await setDoc(submissionRef, submissionData);
    }

    return submission;
  }

  /**
   * List questionnaire submissions by user
   * @param userId User id
   * @returns List of questionnaire submissions
   */
  async listByUser(userId: string): Promise<QuestionnaireSubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(submissionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * List questionnaire submissions by questionnaire
   * @param questionnaireId Questionnaire id
   * @returns List of questionnaire submissions
   */
  async listByQuestionnaire(questionnaireId: string): Promise<QuestionnaireSubmission[]> {
    const submissionsRef = collection(firestore, this.collectionName);
    const q = query(submissionsRef, where('questionnaireId', '==', questionnaireId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  async listByUsers(userIds: string[]): Promise<QuestionnaireSubmission[]> {
    if (userIds.length === 0) {
      return [];
    }

    const chunks = [];
    for (let i = 0; i < userIds.length; i += 30) {
      chunks.push(userIds.slice(i, i + 30));
    }

    const promises = chunks.map(async (chunk) => {
      const submissionsRef = collection(firestore, this.collectionName);
      const q = query(submissionsRef, where('userId', 'in', chunk));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return this.mapToEntity({ id: doc.id, ...data });
      });
    });

    const results = await Promise.all(promises);
    return results.flat();
  }
}
