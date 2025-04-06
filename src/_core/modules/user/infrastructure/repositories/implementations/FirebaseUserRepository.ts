import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { User, UserType } from '../../../core/entities/User';
import type { UserRepository } from '../UserRepository';

/**
 * Firebase implementation of the UserRepository
 */
@injectable()
export class FirebaseUserRepository implements UserRepository {
  private readonly collectionName = 'users';

  /**
   * Create a new user
   * @param user User data without id
   * @returns Created user with id
   */
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const usersRef = collection(firestore, this.collectionName);
    const newUserRef = doc(usersRef);
    const id = newUserRef.id;
    
    const createdAt = new Date();
    const newUser: User = {
      id,
      ...user,
      createdAt,
      updatedAt: createdAt,
    };

    await setDoc(newUserRef, newUser);
    return newUser;
  }

  /**
   * Find a user by id
   * @param id User id
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const userRef = doc(firestore, this.collectionName, id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const usersRef = collection(firestore, this.collectionName);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as User;
  }

  /**
   * Update a user
   * @param id User id
   * @param user User data to update
   * @returns Updated user
   */
  async update(id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const userRef = doc(firestore, this.collectionName, id);
    const currentUser = await this.findById(id);

    if (!currentUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = {
      ...currentUser,
      ...user,
      updatedAt: new Date(),
    };

    await updateDoc(userRef, updatedUser);
    return updatedUser;
  }

  /**
   * Delete a user
   * @param id User id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const userRef = doc(firestore, this.collectionName, id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    await deleteDoc(userRef);
    return true;
  }

  /**
   * List users by type
   * @param type User type
   * @returns List of users
   */
  async listByType(type: UserType): Promise<User[]> {
    const usersRef = collection(firestore, this.collectionName);
    const q = query(usersRef, where('type', '==', type));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as User);
  }
}
