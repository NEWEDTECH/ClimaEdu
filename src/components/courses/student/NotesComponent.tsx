'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/button';
import { container } from '@/_core/shared/container';
import { 
  CreateNoteUseCase, 
  CreateNoteInput,
  ListNotesUseCase,
  ListNotesInput,
  UpdateNoteUseCase,
  UpdateNoteInput,
  DeleteNoteUseCase,
  DeleteNoteInput,
  Note
} from '@/_core/modules/notes';

type NoteType = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type NotesComponentProps = {
  courseId: string;
  userId: string;
  isEmbedded?: boolean;
};

export function NotesComponent({ courseId, userId, isEmbedded = false }: NotesComponentProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [editNoteTitle, setEditNoteTitle] = useState<string>('');
  const [editNoteContent, setEditNoteContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from backend
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        
        const listNotesUseCase = container.get<ListNotesUseCase>(ListNotesUseCase);
        const input = new ListNotesInput(userId);
        const output = await listNotesUseCase.execute(input);
        
        setNotes(output.notes);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadNotes();
    }
  }, [userId]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setNewNoteTitle('');
    setNewNoteContent('');
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const handleSaveNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      setIsLoading(true);
      
      const createNoteUseCase = container.get<CreateNoteUseCase>(CreateNoteUseCase);
      const input = new CreateNoteInput(userId, newNoteTitle.trim(), newNoteContent.trim());
      const output = await createNoteUseCase.execute(input);
      
      setNotes(prev => [output.note, ...prev]);
      setIsCreating(false);
      setSelectedNote(output.note);
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleEditNote = () => {
    if (!selectedNote) return;
    
    setIsEditing(true);
    setEditNoteTitle(selectedNote.title);
    setEditNoteContent(selectedNote.content);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const handleSaveEdit = async () => {
    if (!selectedNote || !editNoteTitle.trim()) return;

    try {
      setIsLoading(true);
      
      const updateNoteUseCase = container.get<UpdateNoteUseCase>(UpdateNoteUseCase);
      const input = new UpdateNoteInput(selectedNote.id, userId, editNoteTitle.trim(), editNoteContent.trim());
      const output = await updateNoteUseCase.execute(input);
      
      // Update the note in the list
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id ? output.note : note
      ));
      
      setSelectedNote(output.note);
      setIsEditing(false);
      setEditNoteTitle('');
      setEditNoteContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditNoteTitle('');
    setEditNoteContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsLoading(true);
      
      const deleteNoteUseCase = container.get<DeleteNoteUseCase>(DeleteNoteUseCase);
      const input = new DeleteNoteInput(noteId, userId);
      await deleteNoteUseCase.execute(input);
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return formatDate(date);
  };

  return (
    <div className="h-full flex bg-white dark:bg-black" style={{ height: 'calc(100vh - 11.5rem)' }}>
      {/* Notes List - Left Side */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Minhas Anotações</h3>
            <Button
              onClick={handleCreateNote}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Nova anotação"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar anotações..."
              className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500 text-center">
                {searchTerm ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda.\nCrie sua primeira anotação!'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                        {note.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {note.content || 'Sem conteúdo'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatRelativeDate(note.updatedAt)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="Excluir anotação"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor - Right Side */}
      <div className="flex-1 flex flex-col">
        {isCreating ? (
          <>
            {/* Create Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Nova Anotação</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCancelCreate}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    disabled={!newNoteTitle.trim()}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>

            {/* Create Note Form */}
            <div className="flex-1 p-4 flex flex-col space-y-4">
              <input
                ref={titleInputRef}
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Título da anotação..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
              <textarea
                ref={contentTextareaRef}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Escreva sua anotação aqui..."
                className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
          </>
        ) : selectedNote ? (
          <>
            {isEditing ? (
              <>
                {/* Edit Note Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Editar Anotação</h3>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editNoteTitle.trim()}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Edit Note Form */}
                <div className="flex-1 p-4 flex flex-col space-y-4">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editNoteTitle}
                    onChange={(e) => setEditNoteTitle(e.target.value)}
                    placeholder="Título da anotação..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  />
                  <textarea
                    ref={contentTextareaRef}
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    placeholder="Escreva sua anotação aqui..."
                    className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Selected Note Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{selectedNote.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Criado em {formatDate(selectedNote.createdAt)}
                        {selectedNote.updatedAt.getTime() !== selectedNote.createdAt.getTime() && (
                          <span> • Editado em {formatDate(selectedNote.updatedAt)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleEditNote}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Editar anotação"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Excluir anotação"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Selected Note Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {selectedNote.content || 'Esta anotação está vazia.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Suas Anotações do Curso
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Selecione uma anotação para visualizar ou crie uma nova
              </p>
              <Button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Criar Nova Anotação
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
