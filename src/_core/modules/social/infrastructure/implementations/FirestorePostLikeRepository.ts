import { injectable } from 'inversify';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getCountFromServer,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { PostLikeRepository } from '../repositories/PostLikeRepository';
import { PostLike, PostLikeProps } from '../../core/entities/PostLike';

@injectable()
export class FirestorePostLikeRepository implements PostLikeRepository {
  private readonly collectionName = 'post_likes';

  async generateId(): Promise<string> {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    return `plike_${uniqueId}`;
  }

  async save(postLike: PostLike): Promise<PostLike> {
    try {
      const postLikeData = this.toFirestoreData(postLike.toPlainObject());
      const docRef = doc(firestore, this.collectionName, postLike.id);
      
      await setDoc(docRef, postLikeData);
      
      return postLike;
    } catch (error) {
      console.error('Error saving post like:', error);
      throw new Error('Failed to save post like');
    }
  }

  async findById(id: string): Promise<PostLike | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const postLikeProps = this.fromFirestoreData(data);
      
      return PostLike.fromPlainObject(postLikeProps);
    } catch (error) {
      console.error('Error finding post like by id:', error);
      throw new Error('Failed to find post like');
    }
  }

  async findByPost(postId: string): Promise<PostLike[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('postId', '==', postId)
      );

      const querySnapshot = await getDocs(q);
      const postLikes: PostLike[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const postLikeProps = this.fromFirestoreData(data);
        postLikes.push(PostLike.fromPlainObject(postLikeProps));
      });

      return postLikes;
    } catch (error) {
      console.error('Error finding post likes by post:', error);
      throw new Error('Failed to find post likes by post');
    }
  }

  async findByUserAndPost(userId: string, postId: string): Promise<PostLike | null> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        where('postId', '==', postId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const postLikeProps = this.fromFirestoreData(data);
      
      return PostLike.fromPlainObject(postLikeProps);
    } catch (error) {
      console.error('Error finding post like by user and post:', error);
      throw new Error('Failed to find post like by user and post');
    }
  }

  async countByPost(postId: string): Promise<number> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('postId', '==', postId)
      );

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting post likes:', error);
      throw new Error('Failed to count post likes');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post like:', error);
      throw new Error('Failed to delete post like');
    }
  }

  private toFirestoreData(postLikeProps: PostLikeProps): DocumentData {
    return {
      id: postLikeProps.id,
      postId: postLikeProps.postId,
      userId: postLikeProps.userId,
      institutionId: postLikeProps.institutionId,
      createdAt: Timestamp.fromDate(postLikeProps.createdAt)
    };
  }

  private fromFirestoreData(data: DocumentData): PostLikeProps {
    return {
      id: data.id,
      postId: data.postId,
      userId: data.userId,
      institutionId: data.institutionId,
      createdAt: data.createdAt.toDate()
    };
  }
}
