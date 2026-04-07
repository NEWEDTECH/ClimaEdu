import { injectable, inject } from 'inversify';
import { FaqSymbols } from '../../../../../shared/container/modules/faq/symbols';
import type { FAQRepository } from '../../../infrastructure/repositories/FAQRepository';
import { ListFaqsByInstitutionInput } from './list-faqs-by-institution.input';
import { ListFaqsByInstitutionOutput } from './list-faqs-by-institution.output';

@injectable()
export class ListFaqsByInstitutionUseCase {
  constructor(
    @inject(FaqSymbols.repositories.FAQRepository)
    private readonly faqRepository: FAQRepository
  ) {}

  async execute(input: ListFaqsByInstitutionInput): Promise<ListFaqsByInstitutionOutput> {
    const faqs = await this.faqRepository.listByInstitution(input.institutionId);
    return new ListFaqsByInstitutionOutput(faqs);
  }
}
