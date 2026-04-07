export class CreateFaqInput {
  constructor(
    public readonly institutionId: string,
    public readonly title: string,
    public readonly content: string
  ) {}
}
