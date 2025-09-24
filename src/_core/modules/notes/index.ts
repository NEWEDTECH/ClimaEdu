// Entities
export { Note } from './core/entities/Note';

// Repositories
export type { NoteRepository } from './core/repositories/NoteRepository';

// Use Cases
export { CreateNoteUseCase } from './core/use-cases/create-note/create-note.use-case';
export { CreateNoteInput } from './core/use-cases/create-note/create-note.input';
export { CreateNoteOutput } from './core/use-cases/create-note/create-note.output';

export { ListNotesUseCase } from './core/use-cases/list-notes/list-notes.use-case';
export { ListNotesInput } from './core/use-cases/list-notes/list-notes.input';
export { ListNotesOutput } from './core/use-cases/list-notes/list-notes.output';

export { UpdateNoteUseCase } from './core/use-cases/update-note/update-note.use-case';
export { UpdateNoteInput } from './core/use-cases/update-note/update-note.input';
export { UpdateNoteOutput } from './core/use-cases/update-note/update-note.output';

export { DeleteNoteUseCase } from './core/use-cases/delete-note/delete-note.use-case';
export { DeleteNoteInput } from './core/use-cases/delete-note/delete-note.input';

// Infrastructure
export { FirebaseNoteRepository } from './infrastructure/repositories/FirebaseNoteRepository';
