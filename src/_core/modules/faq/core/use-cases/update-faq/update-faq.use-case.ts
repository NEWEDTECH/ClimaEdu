import { injectable, inject } from 'inversify';
import { FaqSymbols } from '../../../../../shared/container/modules/faq/symbols';
import type { FAQRepository } from '../../../infrastructure/repositories/FAQRepository';
import { UpdateFaqInput } from './update-faq.input';
import { UpdateFaqOutput } from './update-faq.output';

@injectable()
export class UpdateFaqUseCase {
  constructor(
    @inject(FaqSymbols.repositories.FAQRepository)
    private readonly faqRepository: FAQRepository
  ) {}

  async execute(input: UpdateFaqInput): Promise<UpdateFaqOutput> {
    const faq = await this.faqRepository.findById(input.id);
    if (!faq) throw new Error(`FAQ not found: ${input.id}`);

    faq.updateTitle(input.title);
    faq.updateContent(input.content);

    const saved = await this.faqRepository.save(faq);
    return new UpdateFaqOutput(saved);
  }
}
