import { injectable, inject } from 'inversify';
import { FaqSymbols } from '../../../../../shared/container/modules/faq/symbols';
import type { FAQRepository } from '../../../infrastructure/repositories/FAQRepository';
import { DeleteFaqInput } from './delete-faq.input';
import { DeleteFaqOutput } from './delete-faq.output';

@injectable()
export class DeleteFaqUseCase {
  constructor(
    @inject(FaqSymbols.repositories.FAQRepository)
    private readonly faqRepository: FAQRepository
  ) {}

  async execute(input: DeleteFaqInput): Promise<DeleteFaqOutput> {
    const success = await this.faqRepository.delete(input.id);
    return new DeleteFaqOutput(success);
  }
}
