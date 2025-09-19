import { inject, injectable } from 'inversify';
import type { NoteRepository } from '../../repositories/NoteRepository';
import { DeleteNoteInput } from './delete-note.input';

@injectable()
export class DeleteNoteUseCase {
  constructor(
    @inject('NoteRepository')
    private readonly noteRepository: NoteRepository
  ) {}

  async execute(input: DeleteNoteInput): Promise<void> {
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
      throw new Error('Você não tem permissão para deletar esta anotação');
    }

    await this.noteRepository.delete(input.id);
  }
}
