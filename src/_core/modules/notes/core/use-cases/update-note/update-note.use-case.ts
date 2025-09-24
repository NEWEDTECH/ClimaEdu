import { inject, injectable } from 'inversify';
import type { NoteRepository } from '../../repositories/NoteRepository';
import { UpdateNoteInput } from './update-note.input';
import { UpdateNoteOutput } from './update-note.output';

@injectable()
export class UpdateNoteUseCase {
  constructor(
    @inject('NoteRepository')
    private readonly noteRepository: NoteRepository
  ) {}

  async execute(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
    if (!input.title.trim()) {
      throw new Error('Título da anotação é obrigatório');
    }

    if (!input.userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!input.id) {
      throw new Error('ID da anotação é obrigatório');
    }

    const existingNote = await this.noteRepository.findById(input.id);
    
    if (!existingNote) {
      throw new Error('Anotação não encontrada');
    }

    if (existingNote.userId !== input.userId) {
      throw new Error('Você não tem permissão para editar esta anotação');
    }

    existingNote.update(input.title.trim(), input.content.trim());

    await this.noteRepository.update(existingNote);

    return new UpdateNoteOutput(existingNote);
  }
}
