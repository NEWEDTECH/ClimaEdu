import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Questionnaire } from '../../../core/entities/Questionnaire';
import type { QuestionnaireRepository } from '../QuestionnaireRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the QuestionnaireRepository
 */
@injectable()
export class FirebaseQuestionnaireRepository implements QuestionnaireRepository {
  private readonly collectionName = 'questionnaires';
  private readonly idPrefix = 'qstnr_';

  /**
   * Generate a new unique ID for a questionnaire
   * @returns A unique ID with the questionnaire prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the questionnaire prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Questionnaire entity
   * @param data Firestore document data
   * @returns Questionnaire entity
   */
  private mapToEntity(data: DocumentData): Questionnaire {
    // Create and return a Questionnaire entity
    return Questionnaire.create({
      id: data.id,
      lessonId: data.lessonId,
      title: data.title,
      questions: data.questions || [],
      maxAttempts: data.maxAttempts,
      passingScore: data.passingScore
    });
  }

  /**
   * Find a questionnaire by id
   * @param id Questionnaire id
   * @returns Questionnaire or null if not found
   */
  async findById(id: string): Promise<Questionnaire | null> {
    const questionnaireRef = doc(firestore, this.collectionName, id);
    const questionnaireDoc = await getDoc(questionnaireRef);

    if (!questionnaireDoc.exists()) {
      return null;
    }

    const data = questionnaireDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find a questionnaire by lesson id
   * @param lessonId Lesson id
   * @returns Questionnaire or null if not found
   */
  async findByLessonId(lessonId: string): Promise<Questionnaire | null> {
    const questionnairesRef = collection(firestore, this.collectionName);
    const q = query(questionnairesRef, where('lessonId', '==', lessonId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Save a questionnaire
   * @param questionnaire Questionnaire to save
   * @returns Saved questionnaire
   */
  async save(questionnaire: Questionnaire): Promise<Questionnaire> {
    const questionnaireRef = doc(firestore, this.collectionName, questionnaire.id);
    
    // Convert Question objects to plain objects
    const questionsData = questionnaire.questions.map(question => ({
      id: question.id,
      questionText: question.questionText,
      options: question.options,
      correctAnswerIndex: question.correctAnswerIndex
    }));
    
    // Prepare the questionnaire data for Firestore
    const questionnaireData = {
      id: questionnaire.id,
      lessonId: questionnaire.lessonId,
      title: questionnaire.title,
      questions: questionsData,
      maxAttempts: questionnaire.maxAttempts,
      passingScore: questionnaire.passingScore
    };

    // Check if the questionnaire already exists
    const questionnaireDoc = await getDoc(questionnaireRef);
    
    if (questionnaireDoc.exists()) {
      // Update existing questionnaire
      await updateDoc(questionnaireRef, questionnaireData);
    } else {
      // Create new questionnaire
      await setDoc(questionnaireRef, questionnaireData);
    }

    return questionnaire;
  }

  /**
   * Delete a questionnaire
   * @param id Questionnaire id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const questionnaireRef = doc(firestore, this.collectionName, id);
    const questionnaireDoc = await getDoc(questionnaireRef);

    if (!questionnaireDoc.exists()) {
      return false;
    }

    await deleteDoc(questionnaireRef);
    return true;
  }
}
