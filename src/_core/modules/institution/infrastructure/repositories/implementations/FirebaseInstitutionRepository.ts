import { injectable } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Institution } from '../../../core/entities/Institution';
import { InstitutionSettings } from '../../../core/entities/InstitutionSettings';
import type { InstitutionRepository } from '../InstitutionRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the InstitutionRepository
 */
@injectable()
export class FirebaseInstitutionRepository implements InstitutionRepository {
  private readonly collectionName = 'institutions';
  private readonly idPrefix = 'ins_';

  /**
   * Generate a new unique ID for an institution
   * @returns A unique ID with the institution prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the institution prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to an Institution entity
   * @param data Firestore document data
   * @returns Institution entity
   */
  private mapToEntity(data: DocumentData): Institution {
    // Convert settings object to InstitutionSettings value object
    const settings = InstitutionSettings.create({
      logoUrl: data.settings?.logoUrl,
      primaryColor: data.settings?.primaryColor,
      secondaryColor: data.settings?.secondaryColor
    });
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return an Institution entity
    return Institution.create({
      id: data.id,
      name: data.name,
      domain: data.domain,
      settings,
      createdAt,
      updatedAt
    });
  }

  /**
   * Find an institution by id
   * @param id Institution id
   * @returns Institution or null if not found
   */
  async findById(id: string): Promise<Institution | null> {
    const institutionRef = doc(firestore, this.collectionName, id);
    const institutionDoc = await getDoc(institutionRef);

    if (!institutionDoc.exists()) {
      return null;
    }

    const data = institutionDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Find an institution by domain
   * @param domain Institution domain
   * @returns Institution or null if not found
   */
  async findByDomain(domain: string): Promise<Institution | null> {
    const institutionsRef = collection(firestore, this.collectionName);
    const q = query(institutionsRef, where('domain', '==', domain));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Save an institution
   * @param institution Institution to save
   * @returns Saved institution
   */
  async save(institution: Institution): Promise<Institution> {
    const institutionRef = doc(firestore, this.collectionName, institution.id);
    
    // Prepare the institution data for Firestore
    const institutionData = {
      id: institution.id,
      name: institution.name,
      domain: institution.domain,
      settings: {
        logoUrl: institution.settings.logoUrl,
        primaryColor: institution.settings.primaryColor,
        secondaryColor: institution.settings.secondaryColor
      },
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt
    };

    // Check if the institution already exists
    const institutionDoc = await getDoc(institutionRef);
    
    if (institutionDoc.exists()) {
      // Update existing institution
      await updateDoc(institutionRef, institutionData);
    } else {
      // Create new institution
      await setDoc(institutionRef, institutionData);
    }

    return institution;
  }

  /**
   * Delete an institution
   * @param id Institution id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const institutionRef = doc(firestore, this.collectionName, id);
    const institutionDoc = await getDoc(institutionRef);

    if (!institutionDoc.exists()) {
      return false;
    }

    await deleteDoc(institutionRef);
    return true;
  }

  /**
   * List all institutions
   * @returns List of institutions
   */
  async list(): Promise<Institution[]> {
    const institutionsRef = collection(firestore, this.collectionName);
    const querySnapshot = await getDocs(institutionsRef);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }
}
