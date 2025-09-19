import { Note } from '../../entities/Note';

export class UpdateNoteOutput {
  constructor(
    public readonly note: Note
  ) {}
}
