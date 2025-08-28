import { inject, injectable } from 'inversify';
import type { IScormContentRepository } from '../../../infrastructure/repositories/ScormContentRepository';
import { GetScormContentInput } from './get-scorm-content.input';
import { GetScormContentOutput } from './get-scorm-content.output';

@injectable()
export class GetScormContentUseCase {
  constructor(
    @inject('IScormContentRepository')
    private readonly scormContentRepository: IScormContentRepository
  ) {}

  async execute(
    input: GetScormContentInput
  ): Promise<GetScormContentOutput> {
    const content = await this.scormContentRepository.findById(input.id);

    if (!content) {
      throw new Error('Scorm content not found.');
    }

    return content;
  }
}
