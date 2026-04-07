import type { FAQ } from '../../core/entities/FAQ';

export interface FAQRepository {
  generateId(): Promise<string>;
  findById(id: string): Promise<FAQ | null>;
  save(faq: FAQ): Promise<FAQ>;
  delete(id: string): Promise<boolean>;
  listByInstitution(institutionId: string): Promise<FAQ[]>;
}
