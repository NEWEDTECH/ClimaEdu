import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Course } from '../../../core/entities/Course';
import type { CourseRepository } from '../CourseRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the CourseRepository
 */
@injectable()
export class FirebaseCourseRepository implements CourseRepository {
  private readonly collectionName = 'courses';
  private readonly idPrefix = 'crs_';

  /**
   * Generate a new unique ID for a course
   * @returns A unique ID with the course prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the course prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Course entity
   * @param data Firestore document data
   * @returns Course entity
   */
  private mapToEntity(data: DocumentData): Course {
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return a Course entity
    return Course.create({
      id: data.id,
      institutionId: data.institutionId,
      title: data.title,
      description: data.description,
      modules: data.modules || [],
      createdAt,
      updatedAt
    });
  }

  /**
   * Find a course by id
   * @param id Course id
   * @returns Course or null if not found
   */
  async findById(id: string): Promise<Course | null> {
    const courseRef = doc(firestore, this.collectionName, id);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      return null;
    }

    const data = courseDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Save a course
   * @param course Course to save
   * @returns Saved course
   */
  async save(course: Course): Promise<Course> {
    const courseRef = doc(firestore, this.collectionName, course.id);
    
    // Prepare the course data for Firestore
    const courseData = {
      id: course.id,
      institutionId: course.institutionId,
      title: course.title,
      description: course.description,
      modules: course.modules,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };

    // Check if the course already exists
    const courseDoc = await getDoc(courseRef);
    
    if (courseDoc.exists()) {
      // Update existing course
      await updateDoc(courseRef, courseData);
    } else {
      // Create new course
      await setDoc(courseRef, courseData);
    }

    return course;
  }

  /**
   * Delete a course
   * @param id Course id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const courseRef = doc(firestore, this.collectionName, id);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      return false;
    }

    await deleteDoc(courseRef);
    return true;
  }

  /**
   * List courses by institution
   * @param institutionId Institution id
   * @returns List of courses
   */
  async listByInstitution(institutionId: string): Promise<Course[]> {
    const coursesRef = collection(firestore, this.collectionName);
    const q = query(coursesRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }
}
