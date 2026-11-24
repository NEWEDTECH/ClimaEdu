import { FAQType } from '../../entities/FAQType';

export class UpdateFaqInput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly type: FAQType
  ) {}
}
