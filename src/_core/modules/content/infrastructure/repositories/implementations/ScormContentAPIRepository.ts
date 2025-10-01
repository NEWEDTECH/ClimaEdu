import { injectable } from 'inversify';
import { IScormContentClientRepository } from '../ScormContentClientRepository';
import { ScormContent } from '../../../core/entities';

@injectable()
export class ScormContentAPIRepository
  implements IScormContentClientRepository
{
  async findById(id: string): Promise<ScormContent | null> {
    try {
      const response = await fetch(`/api/scorm/content/${id}`);

      if (!response.ok) {
        console.error(
          'Failed to fetch SCORM content:',
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching SCORM content:', error);
      return null;
    }
  }
}
