import type { FAQ } from '../../entities/FAQ';

export class UpdateFaqOutput {
  constructor(public readonly faq: FAQ) {}
}
