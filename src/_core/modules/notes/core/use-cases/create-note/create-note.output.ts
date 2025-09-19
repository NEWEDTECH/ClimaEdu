import { Note } from '../../entities/Note';

export class CreateNoteOutput {
  constructor(
    public readonly note: Note
  ) {}
}
