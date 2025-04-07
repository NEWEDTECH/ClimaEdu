import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp, UpdateData, deleteField } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { User, UserRole } from '../../../core/entities/User';
import { Email } from '../../../core/entities/Email';
import { Profile } from '../../../core/entities/Profile';
import type { UserRepository, CreateUserDTO } from '../UserRepository';

/**
 * Firebase implementation of the UserRepository
 */
@injectable()
export class FirebaseUserRepository implements UserRepository {
  private readonly collectionName = 'users';

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
   * Create a new user
   * @param userData User data for creation
   * @returns Created user with id
   */
  async create(userData: CreateUserDTO): Promise<User> {
    const usersRef = collection(firestore, this.collectionName);
    const newUserRef = doc(usersRef);
    const id = newUserRef.id;
    
    const createdAt = new Date();
    
    // Create a new User entity
    const newUser = User.create({
      id,
      institutionId: userData.institutionId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      profile: userData.profile,
      createdAt,
      updatedAt: createdAt
    });
    
    // Convert to a plain object for Firestore
    const userDataForFirestore: {
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
      };
    } = {
      id,
      institutionId: userData.institutionId,
      name: userData.name,
      email: { value: userData.email.value },
      role: userData.role,
      createdAt,
      updatedAt: createdAt
    };

    // Only add profile if it exists
    if (userData.profile) {
      userDataForFirestore.profile = {
        bio: userData.profile.bio,
        avatarUrl: userData.profile.avatarUrl,
        linkedinUrl: userData.profile.linkedinUrl
      };
    }

    await setDoc(newUserRef, userDataForFirestore);
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

    const updatedAt = new Date();
    
    // Prepare the update data for Firestore
    const updateData = {
      updatedAt
    } as UpdateData<DocumentData>;

    // Add fields to update in Firestore
    if (user.name !== undefined) {
      updateData.name = user.name;
    }

    if (user.email !== undefined) {
      updateData.email = { value: user.email.value };
    }

    if (user.role !== undefined) {
      updateData.role = user.role;
    }

    if (user.profile !== undefined) {
      // If profile is null, remove it from the document
      if (user.profile === null) {
        // Firestore doesn't support setting fields to undefined, so we use FieldValue.delete()
        updateData.profile = deleteField();
      } else {
        // Otherwise, update with the new profile data
        updateData.profile = {
          bio: user.profile.bio,
          avatarUrl: user.profile.avatarUrl,
          linkedinUrl: user.profile.linkedinUrl
        };
      }
    }

    // Update the document in Firestore
    await updateDoc(userRef, updateData);

    // Create and return the updated user entity without making another database query
    return User.create({
      id: currentUser.id,
      institutionId: currentUser.institutionId,
      name: user.name !== undefined ? user.name : currentUser.name,
      email: user.email !== undefined ? user.email : currentUser.email,
      role: user.role !== undefined ? user.role : currentUser.role,
      profile: user.profile !== undefined ? user.profile : currentUser.profile,
      createdAt: currentUser.createdAt,
      updatedAt
    });
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
