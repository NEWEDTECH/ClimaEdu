import { ScormContent } from '../../core/entities';

export interface IScormContentRepository {
  save(file: Buffer, content: Omit<ScormContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScormContent>;
  findById(id: string): Promise<ScormContent | null>;
}
