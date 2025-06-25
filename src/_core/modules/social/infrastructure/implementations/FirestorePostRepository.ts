import { injectable } from 'inversify';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { PostRepository } from '../repositories/PostRepository';
import { Post, PostProps, PostStatus } from '../../core/entities/Post';

@injectable()
export class FirestorePostRepository implements PostRepository {
  private readonly collectionName = 'posts';

  async generateId(): Promise<string> {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    return `pst_${uniqueId}`;
  }

  async save(post: Post): Promise<Post> {
    try {
      const postData = this.toFirestoreData(post.toPlainObject());
      const docRef = doc(firestore, this.collectionName, post.id);
      
      await setDoc(docRef, postData);
      
      return post;
    } catch (error) {
      console.error('Error saving post:', error);
      throw new Error('Failed to save post');
    }
  }

  async findById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const postProps = this.fromFirestoreData(data);
      
      return Post.fromPlainObject(postProps);
    } catch (error) {
      console.error('Error finding post by id:', error);
      throw new Error('Failed to find post');
    }
  }

  async findByAuthor(authorId: string, institutionId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('authorId', '==', authorId),
        where('institutionId', '==', institutionId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postProps = this.fromFirestoreData(data);
        posts.push(Post.fromPlainObject(postProps));
      });

      return posts;
    } catch (error) {
      console.error('Error finding posts by author:', error);
      throw new Error('Failed to find posts by author');
    }
  }

  async findByInstitution(institutionId: string, status?: PostStatus): Promise<Post[]> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        where('institutionId', '==', institutionId)
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postProps = this.fromFirestoreData(data);
        posts.push(Post.fromPlainObject(postProps));
      });

      return posts;
    } catch (error) {
      console.error('Error finding posts by institution:', error);
      throw new Error('Failed to find posts by institution');
    }
  }

  async findPublishedPosts(institutionId: string, limitCount?: number): Promise<Post[]> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        where('institutionId', '==', institutionId),
        where('status', '==', PostStatus.PUBLISHED),
        orderBy('publishedAt', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      // For pagination, we would need to implement cursor-based pagination
      // This is a simplified version without offset support
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postProps = this.fromFirestoreData(data);
        posts.push(Post.fromPlainObject(postProps));
      });

      return posts;
    } catch (error) {
      console.error('Error finding published posts:', error);
      throw new Error('Failed to find published posts');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  private toFirestoreData(postProps: PostProps): DocumentData {
    return {
      id: postProps.id,
      authorId: postProps.authorId,
      institutionId: postProps.institutionId,
      title: postProps.title,
      content: postProps.content,
      status: postProps.status,
      createdAt: Timestamp.fromDate(postProps.createdAt),
      updatedAt: Timestamp.fromDate(postProps.updatedAt),
      publishedAt: postProps.publishedAt ? Timestamp.fromDate(postProps.publishedAt) : null
    };
  }

  private fromFirestoreData(data: DocumentData): PostProps {
    return {
      id: data.id,
      authorId: data.authorId,
      institutionId: data.institutionId,
      title: data.title,
      content: data.content,
      status: data.status as PostStatus,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      publishedAt: data.publishedAt ? data.publishedAt.toDate() : undefined
    };
  }
}
