import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { firestore } from '@/shared/firebase/firebase-client';
import { Content, ContentType } from '../../../core/entities/Content';
import type { ContentRepository } from '../ContentRepository';

/**
 * Firebase implementation of the ContentRepository
 */
@injectable()
export class FirebaseContentRepository implements ContentRepository {
  private readonly collectionName = 'contents';

  /**
   * Create new content
   * @param content Content data without id
   * @returns Created content with id
   */
  async create(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const contentsRef = collection(firestore, this.collectionName);
    const newContentRef = doc(contentsRef);
    const id = newContentRef.id;
    
    const createdAt = new Date();
    const newContent: Content = {
      id,
      ...content,
      createdAt,
      updatedAt: createdAt,
    };

    await setDoc(newContentRef, newContent);
    return newContent;
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

    return contentDoc.data() as Content;
  }

  /**
   * Update content
   * @param id Content id
   * @param content Content data to update
   * @returns Updated content
   */
  async update(id: string, content: Partial<Omit<Content, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Content> {
    const contentRef = doc(firestore, this.collectionName, id);
    const currentContent = await this.findById(id);

    if (!currentContent) {
      throw new Error(`Content with id ${id} not found`);
    }

    const updatedContent = {
      ...currentContent,
      ...content,
      updatedAt: new Date(),
    };

    await updateDoc(contentRef, updatedContent);
    return updatedContent;
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

    return querySnapshot.docs.map(doc => doc.data() as Content);
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

    return querySnapshot.docs.map(doc => doc.data() as Content);
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

    return querySnapshot.docs.map(doc => doc.data() as Content);
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
      .map(doc => doc.data() as Content)
      .filter(content => 
        content.title.toLowerCase().includes(termLowerCase) || 
        content.description.toLowerCase().includes(termLowerCase)
      );
  }
}
