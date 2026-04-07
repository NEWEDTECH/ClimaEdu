import { injectable, inject } from 'inversify';
import { FaqSymbols } from '../../../../../shared/container/modules/faq/symbols';
import type { FAQRepository } from '../../../infrastructure/repositories/FAQRepository';
import { FAQ } from '../../entities/FAQ';
import { CreateFaqInput } from './create-faq.input';
import { CreateFaqOutput } from './create-faq.output';

@injectable()
export class CreateFaqUseCase {
  constructor(
    @inject(FaqSymbols.repositories.FAQRepository)
    private readonly faqRepository: FAQRepository
  ) {}

  async execute(input: CreateFaqInput): Promise<CreateFaqOutput> {
    const id = await this.faqRepository.generateId();
    const faq = FAQ.create({
      id,
      institutionId: input.institutionId,
      title: input.title,
      content: input.content
    });
    const saved = await this.faqRepository.save(faq);
    return new CreateFaqOutput(saved);
  }
}
