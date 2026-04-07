import type { FAQ } from '../../entities/FAQ';

export class ListFaqsByInstitutionOutput {
  constructor(public readonly faqs: FAQ[]) {}
}
