import { injectable, inject } from 'inversify';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Module } from '../../../core/entities/Module';
import type { ModuleRepository } from '../ModuleRepository';
import type { LessonRepository } from '../LessonRepository';
import { Register } from '@/_core/shared/container';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the ModuleRepository
 */
@injectable()
export class FirebaseModuleRepository implements ModuleRepository {
  private readonly collectionName = 'modules';
  private readonly idPrefix = 'mod_';

  constructor(
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository
  ) {}

  /**
   * Generate a new unique ID for a module
   * @returns A unique ID with the module prefix
   */
  async generateId(): Promise<string> {
    // Generate a unique ID with the module prefix
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Module entity
   * @param data Firestore document data
   * @returns Module entity
   */
  private mapToEntity(data: DocumentData): Module {
    // Create and return a Module entity
    return Module.create({
      id: data.id,
      courseId: data.courseId,
      title: data.title,
      coverImageUrl: data.coverImageUrl,
      order: data.order,
      lessons: data.lessons || []
    });
  }

  /**
   * Find a module by id
   * @param id Module id
   * @returns Module or null if not found
   */
  async findById(id: string): Promise<Module | null> {
    const moduleRef = doc(firestore, this.collectionName, id);
    const moduleDoc = await getDoc(moduleRef);

    if (!moduleDoc.exists()) {
      return null;
    }

    const data = moduleDoc.data();
    
    // Fetch lessons from separate collection
    const lessons = await this.lessonRepository.listByModule(id);
    
    return this.mapToEntity({ id, ...data, lessons });
  }

  /**
   * Save a module
   * @param module Module to save
   * @returns Saved module
   */
  async save(module: Module): Promise<Module> {
    const moduleRef = doc(firestore, this.collectionName, module.id);
    
    // Prepare the module data for Firestore
    const moduleData = {
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      coverImageUrl: module.coverImageUrl,
      order: module.order
    };

    // Check if the module already exists
    const moduleDoc = await getDoc(moduleRef);
    
    if (moduleDoc.exists()) {
      // Update existing module
      await updateDoc(moduleRef, moduleData);
    } else {
      // Create new module
      await setDoc(moduleRef, moduleData);
    }

    return module;
  }

  /**
   * Delete a module
   * @param id Module id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const moduleRef = doc(firestore, this.collectionName, id);
    const moduleDoc = await getDoc(moduleRef);

    if (!moduleDoc.exists()) {
      return false;
    }

    await deleteDoc(moduleRef);
    return true;
  }

  /**
   * List modules by course
   * @param courseId Course id
   * @returns List of modules
   */
  async listByCourse(courseId: string): Promise<Module[]> {
    const modulesRef = collection(firestore, this.collectionName);
    const q = query(modulesRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);

    // Fetch lessons for each module
    const modulesWithLessons = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const lessons = await this.lessonRepository.listByModule(docSnapshot.id);
              
        return this.mapToEntity({ id: docSnapshot.id, ...data, lessons });
      })
    );

    return modulesWithLessons;
  }

  /**
   * Update the order of a module
   * @param id Module id
   * @param order New order value
   */
  async updateOrder(id: string, order: number): Promise<void> {
    const moduleRef = doc(firestore, this.collectionName, id);
    await updateDoc(moduleRef, { order });
  }
}
