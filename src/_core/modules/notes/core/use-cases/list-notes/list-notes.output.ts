import { Note } from '../../entities/Note';

export class ListNotesOutput {
  constructor(
    public readonly notes: Note[]
  ) {}
}
