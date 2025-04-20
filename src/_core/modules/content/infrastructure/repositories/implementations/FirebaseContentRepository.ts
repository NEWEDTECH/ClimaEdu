import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Content } from '../../../core/entities/Content';
import { ContentType } from '../../../core/entities/ContentType';
import type { ContentRepository } from '../ContentRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the ContentRepository
 */
@injectable()
export class FirebaseContentRepository implements ContentRepository {
  private readonly collectionName = 'contents';
  private readonly idPrefix = 'cnt_';

  /**
   * Generate a new unique ID for content
   * @returns A unique ID with the content prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the content prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Content entity
   * @param data Firestore document data
   * @returns Content entity
   */
  private mapToEntity(data: DocumentData): Content {
    return Content.create({
      id: data.id,
      lessonId: data.lessonId,
      type: data.type,
      title: data.title,
      url: data.url
    });
  }

  /**
   * Find content by id
   * @param id Content id
   * @returns Content or null if not found
   */
  async findById(id: string): Promise<Content | null> {
    const contentRef = doc(firestore, this.collectionName, id);
    const contentDoc = await getDoc(contentRef);

    if (!contentDoc.exists()) {
      return null;
    }

    const data = contentDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Save content
   * @param content Content to save
   * @returns Saved content
   */
  async save(content: Content): Promise<Content> {
    const contentRef = doc(firestore, this.collectionName, content.id);
    
    // Prepare the content data for Firestore
    const contentData = {
      id: content.id,
      lessonId: content.lessonId,
      type: content.type,
      title: content.title,
      url: content.url
    };

    // Check if the content already exists
    const contentDoc = await getDoc(contentRef);
    
    if (contentDoc.exists()) {
      // Update existing content
      await updateDoc(contentRef, contentData);
    } else {
      // Create new content
      await setDoc(contentRef, contentData);
    }

    return content;
  }

  /**
   * Delete content
   * @param id Content id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const contentRef = doc(firestore, this.collectionName, id);
    const contentDoc = await getDoc(contentRef);

    if (!contentDoc.exists()) {
      return false;
    }

    await deleteDoc(contentRef);
    return true;
  }

  /**
   * List content by type
   * @param type Content type
   * @returns List of content
   */
  async listByType(type: ContentType): Promise<Content[]> {
    const contentsRef = collection(firestore, this.collectionName);
    const q = query(contentsRef, where('type', '==', type));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * List content by author
   * @param authorId Author id
   * @returns List of content
   */
  async listByAuthor(authorId: string): Promise<Content[]> {
    const contentsRef = collection(firestore, this.collectionName);
    const q = query(contentsRef, where('authorId', '==', authorId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * List content by category
   * @param category Category
   * @returns List of content
   */
  async listByCategory(category: string): Promise<Content[]> {
    const contentsRef = collection(firestore, this.collectionName);
    const q = query(contentsRef, where('categories', 'array-contains', category));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Search content by title or description
   * @param term Search term
   * @returns List of content
   */
  async searchByTerm(term: string): Promise<Content[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simplified implementation that searches for exact matches in title
    // In a real application, you might want to use a service like Algolia or ElasticSearch
    const contentsRef = collection(firestore, this.collectionName);
    const querySnapshot = await getDocs(contentsRef);
    
    const termLowerCase = term.toLowerCase();
    
    return querySnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.title.toLowerCase().includes(termLowerCase);
      })
      .map(doc => {
        const data = doc.data();
        return this.mapToEntity({ id: doc.id, ...data });
      });
  }
}
