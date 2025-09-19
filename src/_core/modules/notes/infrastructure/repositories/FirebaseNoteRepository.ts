import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Note } from '../../core/entities/Note';
import type { NoteRepository } from '../../core/repositories/NoteRepository';

@injectable()
export class FirebaseNoteRepository implements NoteRepository {
  private readonly collectionName = 'notes';

  async save(note: Note): Promise<void> {
    try {
      const noteData = {
        userId: note.userId,
        title: note.title,
        content: note.content,
        createdAt: Timestamp.fromDate(note.createdAt),
        updatedAt: Timestamp.fromDate(note.updatedAt)
      };

      await addDoc(collection(firestore, this.collectionName), noteData);
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error('Falha ao salvar anotação');
    }
  }

  async findById(id: string): Promise<Note | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      return Note.create({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      });
    } catch (error) {
      console.error('Error finding note by id:', error);
      throw new Error('Falha ao buscar anotação');
    }
  }

  async findByUserId(userId: string): Promise<Note[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notes: Note[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const note = Note.create({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
        notes.push(note);
      });

      return notes;
    } catch (error) {
      console.error('Error finding notes by user id:', error);
      throw new Error('Falha ao buscar anotações do usuário');
    }
  }

  async update(note: Note): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, note.id);
      
      const updateData = {
        title: note.title,
        content: note.content,
        updatedAt: Timestamp.fromDate(note.updatedAt)
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Falha ao atualizar anotação');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Falha ao deletar anotação');
    }
  }
}
