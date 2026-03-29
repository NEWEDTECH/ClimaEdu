import type { FAQ } from '../../entities/FAQ';

export class CreateFaqOutput {
  constructor(public readonly faq: FAQ) {}
}
