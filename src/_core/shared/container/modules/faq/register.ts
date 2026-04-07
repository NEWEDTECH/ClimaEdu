import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

import type { FAQRepository } from '@/_core/modules/faq/infrastructure/repositories/FAQRepository';
import { FirebaseFAQRepository } from '@/_core/modules/faq/infrastructure/repositories/implementations/FirebaseFAQRepository';

import { ListFaqsByInstitutionUseCase } from '@/_core/modules/faq/core/use-cases/list-faqs-by-institution/list-faqs-by-institution.use-case';
import { CreateFaqUseCase } from '@/_core/modules/faq/core/use-cases/create-faq/create-faq.use-case';
import { UpdateFaqUseCase } from '@/_core/modules/faq/core/use-cases/update-faq/update-faq.use-case';
import { DeleteFaqUseCase } from '@/_core/modules/faq/core/use-cases/delete-faq/delete-faq.use-case';

export function registerFaqModule(container: Container): void {
  container.bind<FAQRepository>(repositories.FAQRepository).to(FirebaseFAQRepository);

  container.bind(useCases.ListFaqsByInstitutionUseCase).to(ListFaqsByInstitutionUseCase);
  container.bind(useCases.CreateFaqUseCase).to(CreateFaqUseCase);
  container.bind(useCases.UpdateFaqUseCase).to(UpdateFaqUseCase);
  container.bind(useCases.DeleteFaqUseCase).to(DeleteFaqUseCase);
}
