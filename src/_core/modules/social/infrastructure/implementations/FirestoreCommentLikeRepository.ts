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
import { CommentLikeRepository } from '../repositories/CommentLikeRepository';
import { CommentLike, CommentLikeProps } from '../../core/entities/CommentLike';

@injectable()
export class FirestoreCommentLikeRepository implements CommentLikeRepository {
  private readonly collectionName = 'comment_likes';

  async generateId(): Promise<string> {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    return `clike_${uniqueId}`;
  }

  async save(commentLike: CommentLike): Promise<CommentLike> {
    try {
      const commentLikeData = this.toFirestoreData(commentLike.toPlainObject());
      const docRef = doc(firestore, this.collectionName, commentLike.id);
      
      await setDoc(docRef, commentLikeData);
      
      return commentLike;
    } catch (error) {
      console.error('Error saving comment like:', error);
      throw new Error('Failed to save comment like');
    }
  }

  async findById(id: string): Promise<CommentLike | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const commentLikeProps = this.fromFirestoreData(data);
      
      return CommentLike.fromPlainObject(commentLikeProps);
    } catch (error) {
      console.error('Error finding comment like by id:', error);
      throw new Error('Failed to find comment like');
    }
  }

  async findByComment(commentId: string): Promise<CommentLike[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('commentId', '==', commentId)
      );

      const querySnapshot = await getDocs(q);
      const commentLikes: CommentLike[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const commentLikeProps = this.fromFirestoreData(data);
        commentLikes.push(CommentLike.fromPlainObject(commentLikeProps));
      });

      return commentLikes;
    } catch (error) {
      console.error('Error finding comment likes by comment:', error);
      throw new Error('Failed to find comment likes by comment');
    }
  }

  async findByUserAndComment(userId: string, commentId: string): Promise<CommentLike | null> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        where('commentId', '==', commentId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const commentLikeProps = this.fromFirestoreData(data);
      
      return CommentLike.fromPlainObject(commentLikeProps);
    } catch (error) {
      console.error('Error finding comment like by user and comment:', error);
      throw new Error('Failed to find comment like by user and comment');
    }
  }

  async countByComment(commentId: string): Promise<number> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('commentId', '==', commentId)
      );

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting comment likes:', error);
      throw new Error('Failed to count comment likes');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment like:', error);
      throw new Error('Failed to delete comment like');
    }
  }

  private toFirestoreData(commentLikeProps: CommentLikeProps): DocumentData {
    return {
      id: commentLikeProps.id,
      commentId: commentLikeProps.commentId,
      userId: commentLikeProps.userId,
      institutionId: commentLikeProps.institutionId,
      createdAt: Timestamp.fromDate(commentLikeProps.createdAt)
    };
  }

  private fromFirestoreData(data: DocumentData): CommentLikeProps {
    return {
      id: data.id,
      commentId: data.commentId,
      userId: data.userId,
      institutionId: data.institutionId,
      createdAt: data.createdAt.toDate()
    };
  }
}
