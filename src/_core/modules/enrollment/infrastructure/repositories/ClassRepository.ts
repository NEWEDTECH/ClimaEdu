import { Class } from "../../core/entities/Class";

export interface ClassRepository {
  generateId(): Promise<string>;
  save(klass: Class): Promise<void>;
  findById(id: string): Promise<Class | null>;
  findAll(institutionId: string): Promise<Class[]>;
  delete(id: string): Promise<void>;
}
