import { inject, injectable } from 'inversify';
import type { NoteRepository } from '../../repositories/NoteRepository';
import { ListNotesInput } from './list-notes.input';
import { ListNotesOutput } from './list-notes.output';

@injectable()
export class ListNotesUseCase {
  constructor(
    @inject('NoteRepository')
    private readonly noteRepository: NoteRepository
  ) {}

  async execute(input: ListNotesInput): Promise<ListNotesOutput> {
    if (!input.userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    const notes = await this.noteRepository.findByUserId(input.userId);

    // Ordenar por data de atualização (mais recente primeiro)
    notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return new ListNotesOutput(notes);
  }
}
