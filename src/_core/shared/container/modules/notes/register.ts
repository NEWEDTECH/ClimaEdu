import { Container } from 'inversify';
import type { NoteRepository } from '@/_core/modules/notes/core/repositories/NoteRepository';
import { FirebaseNoteRepository } from '@/_core/modules/notes/infrastructure/repositories/FirebaseNoteRepository';
import { CreateNoteUseCase } from '@/_core/modules/notes/core/use-cases/create-note/create-note.use-case';
import { ListNotesUseCase } from '@/_core/modules/notes/core/use-cases/list-notes/list-notes.use-case';
import { UpdateNoteUseCase } from '@/_core/modules/notes/core/use-cases/update-note/update-note.use-case';
import { DeleteNoteUseCase } from '@/_core/modules/notes/core/use-cases/delete-note/delete-note.use-case';

export function registerNotesModule(container: Container): void {
  // Repository
  container.bind<NoteRepository>('NoteRepository').to(FirebaseNoteRepository);

  // Use Cases
  container.bind<CreateNoteUseCase>(CreateNoteUseCase).toSelf();
  container.bind<ListNotesUseCase>(ListNotesUseCase).toSelf();
  container.bind<UpdateNoteUseCase>(UpdateNoteUseCase).toSelf();
  container.bind<DeleteNoteUseCase>(DeleteNoteUseCase).toSelf();
}
