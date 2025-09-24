export class CreateNoteInput {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string
  ) {}
}
