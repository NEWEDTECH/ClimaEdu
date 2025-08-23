import { ScormContent } from '../../core/entities';

export interface IScormContentClientRepository {
  findById(id: string): Promise<ScormContent | null>;
}
