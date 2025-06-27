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
  getDocs,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { CommentRepository } from '../repositories/CommentRepository';
import { Comment, CommentProps } from '../../core/entities/Comment';

@injectable()
export class FirestoreCommentRepository implements CommentRepository {
  private readonly collectionName = 'comments';

  async generateId(): Promise<string> {
    const uniqueId = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    return `cmt_${uniqueId}`;
  }

  async save(comment: Comment): Promise<Comment> {
    try {
      const commentData = this.toFirestoreData(comment.toPlainObject());
      const docRef = doc(firestore, this.collectionName, comment.id);
      
      await setDoc(docRef, commentData);
      
      return comment;
    } catch (error) {
      console.error('Error saving comment:', error);
      throw new Error('Failed to save comment');
    }
  }

  async findById(id: string): Promise<Comment | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const commentProps = this.fromFirestoreData(data);
      
      return Comment.fromPlainObject(commentProps);
    } catch (error) {
      console.error('Error finding comment by id:', error);
      throw new Error('Failed to find comment');
    }
  }

  async findByPost(postId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const commentProps = this.fromFirestoreData(data);
        comments.push(Comment.fromPlainObject(commentProps));
      });

      return comments;
    } catch (error) {
      console.error('Error finding comments by post:', error);
      throw new Error('Failed to find comments by post');
    }
  }

  async findReplies(parentCommentId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('parentCommentId', '==', parentCommentId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const replies: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const commentProps = this.fromFirestoreData(data);
        replies.push(Comment.fromPlainObject(commentProps));
      });

      return replies;
    } catch (error) {
      console.error('Error finding replies:', error);
      throw new Error('Failed to find replies');
    }
  }

  async findByAuthor(authorId: string, institutionId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('authorId', '==', authorId),
        where('institutionId', '==', institutionId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const commentProps = this.fromFirestoreData(data);
        comments.push(Comment.fromPlainObject(commentProps));
      });

      return comments;
    } catch (error) {
      console.error('Error finding comments by author:', error);
      throw new Error('Failed to find comments by author');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  private toFirestoreData(commentProps: CommentProps): DocumentData {
    return {
      id: commentProps.id,
      postId: commentProps.postId,
      parentCommentId: commentProps.parentCommentId || null,
      authorId: commentProps.authorId,
      institutionId: commentProps.institutionId,
      content: commentProps.content,
      createdAt: Timestamp.fromDate(commentProps.createdAt),
      updatedAt: Timestamp.fromDate(commentProps.updatedAt)
    };
  }

  private fromFirestoreData(data: DocumentData): CommentProps {
    return {
      id: data.id,
      postId: data.postId,
      parentCommentId: data.parentCommentId || undefined,
      authorId: data.authorId,
      institutionId: data.institutionId,
      content: data.content,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  }
}
