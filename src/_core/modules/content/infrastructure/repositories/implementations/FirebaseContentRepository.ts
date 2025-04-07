import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, UpdateData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Content } from '../../../core/entities/Content';
import { ContentType } from '../../../core/entities/ContentType';
import type { ContentRepository, CreateContentDTO } from '../ContentRepository';

/**
 * Firebase implementation of the ContentRepository
 */
@injectable()
export class FirebaseContentRepository implements ContentRepository {
  private readonly collectionName = 'contents';

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
   * Create new content
   * @param contentData Content data for creation
   * @returns Created content with id
   */
  async create(contentData: CreateContentDTO): Promise<Content> {
    const contentsRef = collection(firestore, this.collectionName);
    const newContentRef = doc(contentsRef);
    const id = newContentRef.id;
    
    // Create a new Content entity
    const newContent = Content.create({
      id,
      lessonId: contentData.lessonId,
      type: contentData.type,
      title: contentData.title,
      url: contentData.url
    });
    
    // Convert to a plain object for Firestore
    const contentDataForFirestore: {
      id: string;
      lessonId: string;
      type: ContentType;
      title: string;
      url: string;
    } = {
      id,
      lessonId: contentData.lessonId,
      type: contentData.type,
      title: contentData.title,
      url: contentData.url
    };

    await setDoc(newContentRef, contentDataForFirestore);
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

    const data = contentDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Update content
   * @param id Content id
   * @param contentData Content data to update
   * @returns Updated content
   */
  async update(id: string, contentData: Partial<Omit<Content, 'id'>>): Promise<Content> {
    const contentRef = doc(firestore, this.collectionName, id);
    const currentContent = await this.findById(id);

    if (!currentContent) {
      throw new Error(`Content with id ${id} not found`);
    }

    // Prepare the update data for Firestore
    const updateData = {} as UpdateData<DocumentData>;

    // Add fields to update in Firestore
    if (contentData.title !== undefined) {
      updateData.title = contentData.title;
    }

    if (contentData.url !== undefined) {
      updateData.url = contentData.url;
    }

    if (contentData.type !== undefined) {
      updateData.type = contentData.type;
    }

    // Update the document in Firestore
    await updateDoc(contentRef, updateData);

    // Create and return the updated content entity without making another database query
    return Content.create({
      id: currentContent.id,
      lessonId: currentContent.lessonId,
      title: contentData.title !== undefined ? contentData.title : currentContent.title,
      url: contentData.url !== undefined ? contentData.url : currentContent.url,
      type: contentData.type !== undefined ? contentData.type : currentContent.type
    });
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
