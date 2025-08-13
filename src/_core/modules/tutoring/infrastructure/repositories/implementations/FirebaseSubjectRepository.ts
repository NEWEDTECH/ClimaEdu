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
  orderBy, 
  DocumentData, 
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Subject } from '../../../core/entities/Subject';
import type { SubjectRepository, CategoryCount, SubjectWithStats } from '../SubjectRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the SubjectRepository
 */
@injectable()
export class FirebaseSubjectRepository implements SubjectRepository {
  private readonly collectionName = 'subjects';
  private readonly idPrefix = 'sub_';

  /**
   * Generate a new unique ID for a subject
   * @returns A unique ID with the subject prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Subject entity
   * @param data Firestore document data
   * @returns Subject entity
   */
  private mapToEntity(data: DocumentData): Subject {
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return a Subject entity
    return Subject.create({
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category || undefined,
      prerequisites: data.prerequisites || undefined,
      createdAt,
      updatedAt
    });
  }

  /**
   * Private method to convert Subject entity to Firestore document data
   * @param subject Subject entity
   * @returns Firestore document data
   */
  private mapToFirestoreData(subject: Subject): DocumentData {
    return {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      isActive: subject.isActive,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      category: subject.category || null,
      prerequisites: subject.prerequisites || null
    };
  }

  /**
   * Saves a subject to the repository
   * @param subject The subject to save
   * @returns Promise<Subject> The saved subject
   */
  async save(subject: Subject): Promise<Subject> {
    const subjectRef = doc(firestore, this.collectionName, subject.id);
    const subjectData = this.mapToFirestoreData(subject);
    
    // Check if the subject already exists
    const subjectDoc = await getDoc(subjectRef);
    
    if (subjectDoc.exists()) {
      // Update existing subject
      await updateDoc(subjectRef, subjectData);
    } else {
      // Create new subject
      await setDoc(subjectRef, subjectData);
    }

    return subject;
  }

  /**
   * Finds a subject by its ID
   * @param id The subject ID
   * @returns Promise<Subject | null> The subject if found, null otherwise
   */
  async findById(id: string): Promise<Subject | null> {
    const subjectRef = doc(firestore, this.collectionName, id);
    const subjectDoc = await getDoc(subjectRef);

    if (!subjectDoc.exists()) {
      return null;
    }

    const data = subjectDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Finds a subject by its name
   * @param name The subject name
   * @returns Promise<Subject | null> The subject if found, null otherwise
   */
  async findByName(name: string): Promise<Subject | null> {
    const subjectsRef = collection(firestore, this.collectionName);
    const q = query(subjectsRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Finds all active subjects
   * @returns Promise<Subject[]> Array of active subjects
   */
  async findAllActive(): Promise<Subject[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    const q = query(
      subjectsRef, 
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds all subjects (active and inactive)
   * @returns Promise<Subject[]> Array of all subjects
   */
  async findAll(): Promise<Subject[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    const q = query(subjectsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds subjects by category
   * @param category The category to filter by
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of subjects in the category
   */
  async findByCategory(category: string, activeOnly: boolean = true): Promise<Subject[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    let q = query(
      subjectsRef,
      where('category', '==', category),
      orderBy('name', 'asc')
    );

    if (activeOnly) {
      q = query(
        subjectsRef,
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds subjects that have specific prerequisites
   * @param prerequisite The prerequisite to search for
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of subjects with the prerequisite
   */
  async findByPrerequisite(prerequisite: string, activeOnly: boolean = true): Promise<Subject[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    let q = query(
      subjectsRef,
      where('prerequisites', 'array-contains', prerequisite),
      orderBy('name', 'asc')
    );

    if (activeOnly) {
      q = query(
        subjectsRef,
        where('prerequisites', 'array-contains', prerequisite),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Searches subjects by name or description
   * @param searchTerm The term to search for
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<Subject[]> Array of matching subjects
   */
  async search(searchTerm: string, activeOnly: boolean = true): Promise<Subject[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simplified implementation that searches for exact matches or starts-with
    const subjectsRef = collection(firestore, this.collectionName);
    
    // Get all subjects and filter in memory (not ideal for large datasets)
    let q = query(subjectsRef, orderBy('name', 'asc'));
    
    if (activeOnly) {
      q = query(
        subjectsRef,
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    const subjects = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });

    // Filter by search term (case-insensitive)
    const searchTermLower = searchTerm.toLowerCase();
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTermLower) ||
      subject.description.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Gets all unique categories
   * @param activeOnly Whether to include only categories from active subjects
   * @returns Promise<string[]> Array of unique categories
   */
  async getCategories(activeOnly: boolean = true): Promise<string[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    let q = query(subjectsRef);
    
    if (activeOnly) {
      q = query(subjectsRef, where('isActive', '==', true));
    }

    const querySnapshot = await getDocs(q);
    const categories = new Set<string>();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Gets subjects available for a specific tutor
   * Note: This implementation returns all active subjects as we don't have tutor-subject mapping yet
   * In a production system, this would query a separate tutor-subjects mapping collection
   * @param tutorId The tutor's ID
   * @returns Promise<Subject[]> Array of subjects the tutor can teach
   */
  async findByTutorId(tutorId: string): Promise<Subject[]> {
    // Validate input
    if (!tutorId || tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    // IMPLEMENTATION NOTE: In a production system, this would:
    // 1. Query a tutor-subjects mapping collection/table
    // 2. Get the subject IDs that the tutor is qualified to teach
    // 3. Return only those subjects
    // 
    // For now, we return all active subjects as a fallback
    // This allows the system to work while the tutor-subject mapping is not implemented
    
    return this.findAllActive();
  }

  /**
   * Gets the count of active subjects
   * @returns Promise<number> Number of active subjects
   */
  async getActiveCount(): Promise<number> {
    const subjectsRef = collection(firestore, this.collectionName);
    const q = query(subjectsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  /**
   * Gets the count of subjects by category
   * @param activeOnly Whether to count only active subjects
   * @returns Promise<CategoryCount[]> Array of category counts
   */
  async getCountByCategory(activeOnly: boolean = true): Promise<CategoryCount[]> {
    const subjectsRef = collection(firestore, this.collectionName);
    let q = query(subjectsRef);
    
    if (activeOnly) {
      q = query(subjectsRef, where('isActive', '==', true));
    }

    const querySnapshot = await getDocs(q);
    const categoryCounts = new Map<string, number>();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'Uncategorized';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => a.category.localeCompare(b.category));
  }

  /**
   * Checks if a subject name already exists
   * @param name The subject name to check
   * @param excludeId Optional ID to exclude from the check (for updates)
   * @returns Promise<boolean> True if name exists, false otherwise
   */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const subjectsRef = collection(firestore, this.collectionName);
    const q = query(subjectsRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    // If excludeId is provided, check if the found subject is different
    if (excludeId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeId);
    }

    return true;
  }

  /**
   * Deletes a subject
   * @param id The subject ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    const subjectRef = doc(firestore, this.collectionName, id);
    await deleteDoc(subjectRef);
  }

  /**
   * Checks if a subject exists
   * @param id The subject ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const subjectRef = doc(firestore, this.collectionName, id);
    const subjectDoc = await getDoc(subjectRef);
    return subjectDoc.exists();
  }

  /**
   * Gets subjects with their tutoring session counts
   * Note: This would require joining with tutoring sessions collection
   * For now, returns subjects with zero stats
   * @param activeOnly Whether to include only active subjects
   * @returns Promise<SubjectWithStats[]> Array of subjects with statistics
   */
  async findWithSessionStats(activeOnly: boolean = true): Promise<SubjectWithStats[]> {
    const subjects = activeOnly ? await this.findAllActive() : await this.findAll();
    
    // TODO: Implement actual statistics by joining with tutoring sessions
    return subjects.map(subject => ({
      subject,
      totalSessions: 0,
      completedSessions: 0,
      averageRating: undefined,
      activeTutors: 0
    }));
  }
}
