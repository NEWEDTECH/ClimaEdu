import { inject, injectable } from 'inversify';
import { Note } from '../../entities/Note';
import type { NoteRepository } from '../../repositories/NoteRepository';
import { CreateNoteInput } from './create-note.input';
import { CreateNoteOutput } from './create-note.output';

@injectable()
export class CreateNoteUseCase {
  constructor(
    @inject('NoteRepository')
    private readonly noteRepository: NoteRepository
  ) {}

  async execute(input: CreateNoteInput): Promise<CreateNoteOutput> {
    if (!input.title.trim()) {
      throw new Error('Título da anotação é obrigatório');
    }

    if (!input.userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    const note = Note.create({
      userId: input.userId,
      title: input.title.trim(),
      content: input.content.trim()
    });

    await this.noteRepository.save(note);

    return new CreateNoteOutput(note);
  }
}
