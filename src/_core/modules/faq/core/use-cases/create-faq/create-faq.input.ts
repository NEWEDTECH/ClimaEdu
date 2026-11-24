import { FAQType } from '../../entities/FAQType';

export class CreateFaqInput {
  constructor(
    public readonly institutionId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly type: FAQType = FAQType.GENERAL
  ) {}
}
