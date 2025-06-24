import { injectable } from 'inversify';
import { getAdminFirestore, initializeFirebaseAdmin } from '@/_core/shared/firebase/firebase-admin';
import { User, UserRole } from '../../../core/entities/User';
import { Email } from '../../../core/entities/Email';
import { Profile } from '../../../core/entities/Profile';
import type { UserRepository } from '../UserRepository';
import { nanoid } from 'nanoid';

/**
 * Interface for Firestore document data structure
 */
interface FirestoreUserData {
  id: string;
  name?: string;
  email?: string | Email | { value: string };
  role?: UserRole;
  createdAt?: FirebaseFirestore.Timestamp | Date | string;
  updatedAt?: FirebaseFirestore.Timestamp | Date | string;
  profile?: {
    bio?: string;
    avatarUrl?: string;
    linkedinUrl?: string;
  };
}

/**
 * Firebase Admin implementation of the UserRepository for server-side operations
 */
@injectable()
export class FirebaseAdminUserRepository implements UserRepository {
  private readonly collectionName = 'users';
  private readonly idPrefix = 'usr_';

  constructor() {
    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();
  }

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
  private mapToEntity(data: FirestoreUserData): User {
    // Validate required fields
    if (!data.name || !data.email || !data.role || !data.createdAt || !data.updatedAt) {
      throw new Error('Missing required user data fields');
    }

    // Convert email string to Email value object
    const email = typeof data.email === 'string' 
      ? Email.create(data.email)
      : data.email instanceof Email 
        ? data.email 
        : Email.create((data.email as { value: string }).value);
    
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
    const createdAt = this.convertToDate(data.createdAt);
    const updatedAt = this.convertToDate(data.updatedAt);
    
    // Create and return a User entity
    return User.create({
      id: data.id,
      name: data.name,
      email,
      role: data.role,
      profile,
      createdAt,
      updatedAt
    });
  }

  /**
   * Helper method to convert various timestamp formats to Date
   * @param timestamp Firestore timestamp, Date, or string
   * @returns Date object
   */
  private convertToDate(timestamp: FirebaseFirestore.Timestamp | Date | string): Date {
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp);
  }

  /**
   * Find a user by id
   * @param id User id
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    try {
      const firestore = getAdminFirestore();
      const userDoc = await firestore.collection(this.collectionName).doc(id).get();

      if (!userDoc.exists) {
        return null;
      }

      const data = userDoc.data();
      return this.mapToEntity({ id, ...data });
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const firestore = getAdminFirestore();
      const querySnapshot = await firestore
        .collection(this.collectionName)
        .where('email.value', '==', email)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Save a user
   * @param user User to save
   * @returns Saved user
   */
  async save(user: User): Promise<User> {
    try {
      const firestore = getAdminFirestore();
      const userRef = firestore.collection(this.collectionName).doc(user.id);
      
      // Prepare the user data for Firestore
      const userData: {
        id: string;
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
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        // Update existing user
        await userRef.update(userData);
      } else {
        // Create new user
        await userRef.set(userData);
      }

      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id User id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      const firestore = getAdminFirestore();
      const userRef = firestore.collection(this.collectionName).doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return false;
      }

      await userRef.delete();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * List users by type
   * @param type User type
   * @returns List of users
   */
  async listByType(type: UserRole): Promise<User[]> {
    try {
      const firestore = getAdminFirestore();
      const querySnapshot = await firestore
        .collection(this.collectionName)
        .where('role', '==', type)
        .get();

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return this.mapToEntity({ id: doc.id, ...data });
      });
    } catch (error) {
      console.error('Error listing users by type:', error);
      throw error;
    }
  }
}
