import { inject, injectable } from 'inversify';
import type { IScormContentRepository } from '../../../infrastructure/repositories/ScormContentRepository';
import { ListScormsByInstitutionInput } from './list-scorms-by-institution.input';
import { ListScormsByInstitutionOutput } from './list-scorms-by-institution.output';

@injectable()
export class ListScormsByInstitutionUseCase {
  constructor(
    @inject('IScormContentRepository')
    private readonly scormContentRepository: IScormContentRepository
  ) {}

  async execute(
    input: ListScormsByInstitutionInput
  ): Promise<ListScormsByInstitutionOutput> {
    return this.scormContentRepository.findByInstitutionId(
      input.institutionId
    );
  }
}
