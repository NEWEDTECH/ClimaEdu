import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp, deleteField } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { User, UserRole } from '../../../core/entities/User';
import { Email } from '../../../core/entities/Email';
import { Profile } from '../../../core/entities/Profile';
import type { UserRepository } from '../UserRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the UserRepository
 */
@injectable()
export class FirebaseUserRepository implements UserRepository {
  private readonly collectionName = 'users';
  private readonly idPrefix = 'usr_';

  /**
   * Generate a new unique ID for a user
   * @returns A unique ID with the user prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the user prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a User entity
   * @param data Firestore document data
   * @returns User entity
   */
  private mapToEntity(data: DocumentData): User {
    // Convert email string to Email value object
    const email = typeof data.email === 'string' 
      ? Email.create(data.email)
      : data.email instanceof Email 
        ? data.email 
        : Email.create(data.email.value);
    
    // Convert profile object to Profile value object if it exists
    let profile: Profile | undefined;
    if (data.profile) {
      profile = Profile.create({
        bio: data.profile.bio,
        avatarUrl: data.profile.avatarUrl,
        linkedinUrl: data.profile.linkedinUrl
      });
    }
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return a User entity
    return User.create({
      id: data.id,
      institutionId: data.institutionId,
      name: data.name,
      email,
      role: data.role,
      profile,
      createdAt,
      updatedAt
    });
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

    const data = userDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const usersRef = collection(firestore, this.collectionName);
    const q = query(usersRef, where('email.value', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Save a user
   * @param user User to save
   * @returns Saved user
   */
  async save(user: User): Promise<User> {
    const userRef = doc(firestore, this.collectionName, user.id);
    
    // Prepare the user data for Firestore
    const userData: {
      id: string;
      institutionId: string;
      name: string;
      email: { value: string };
      role: UserRole;
      createdAt: Date;
      updatedAt: Date;
      profile?: {
        bio?: string;
        avatarUrl?: string;
        linkedinUrl?: string;
      } | null;
    } = {
      id: user.id,
      institutionId: user.institutionId,
      name: user.name,
      email: { value: user.email.value },
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile ? {
        bio: user.profile.bio,
        avatarUrl: user.profile.avatarUrl,
        linkedinUrl: user.profile.linkedinUrl
      } : null
    };

    // Check if the user already exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      if (user.profile === null && userDoc.data().profile) {
        // If profile is null and it was previously set, remove it
        // We need to handle this separately because deleteField() can't be part of the userData object
        await updateDoc(userRef, {
          ...userData,
          profile: deleteField()
        });
      } else {
        // Normal update
        await updateDoc(userRef, userData);
      }
    } else {
      // Create new user
      await setDoc(userRef, userData);
    }

    return user;
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
  async listByType(type: UserRole): Promise<User[]> {
    const usersRef = collection(firestore, this.collectionName);
    const q = query(usersRef, where('role', '==', type));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }
}
