import { Note } from '../entities/Note';

export interface NoteRepository {
  save(note: Note): Promise<void>;
  findById(id: string): Promise<Note | null>;
  findByUserId(userId: string): Promise<Note[]>;
  delete(id: string): Promise<void>;
  update(note: Note): Promise<void>;
}
