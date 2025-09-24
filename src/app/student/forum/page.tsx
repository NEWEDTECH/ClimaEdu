"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/button'

const mockDiscussions = [
  {
    id: 'd1',
    title: 'Dúvida sobre algoritmos de ordenação',
    courseTitle: 'Introdução à Programação',
    moduleTitle: 'Estruturas de Controle',
    createdAt: '2025-04-05T14:30:00',
    author: {
      id: 'u1',
      name: 'João Silva',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    content: 'Estou com dificuldade em entender a diferença entre o bubble sort e o selection sort. Alguém poderia explicar de forma mais simples?',
    replies: [
      {
        id: 'r1',
        createdAt: '2025-04-05T15:20:00',
        author: {
          id: 'u2',
          name: 'Maria Oliveira',
          avatarUrl: 'https://i.pravatar.cc/150?img=5',
          role: 'TUTOR'
        },
        content: 'Olá João! A principal diferença está na forma como eles encontram o elemento a ser movido. O bubble sort compara elementos adjacentes e os troca se estiverem na ordem errada, "borbulhando" os maiores valores para o final. Já o selection sort encontra o menor elemento e o coloca na posição correta. O bubble sort faz várias trocas, enquanto o selection sort minimiza o número de trocas.'
      },
      {
        id: 'r2',
        createdAt: '2025-04-05T16:15:00',
        author: {
          id: 'u3',
          name: 'Pedro Santos',
          avatarUrl: 'https://i.pravatar.cc/150?img=8'
        },
        content: 'Achei um vídeo que explica isso muito bem: https://example.com/sorting-algorithms. Espero que ajude!'
      }
    ]
  },
  {
    id: 'd2',
    title: 'Como implementar media queries corretamente?',
    courseTitle: 'Desenvolvimento Web',
    moduleTitle: 'HTML Básico',
    createdAt: '2025-04-08T10:45:00',
    author: {
      id: 'u4',
      name: 'Ana Costa',
      avatarUrl: 'https://i.pravatar.cc/150?img=9'
    },
    content: 'Estou tentando fazer meu site responder a diferentes tamanhos de tela, mas as media queries não parecem funcionar corretamente. Alguém pode me ajudar com a sintaxe correta?',
    replies: [
      {
        id: 'r3',
        createdAt: '2025-04-08T11:30:00',
        author: {
          id: 'u5',
          name: 'Carlos Mendes',
          avatarUrl: 'https://i.pravatar.cc/150?img=12',
          role: 'TUTOR'
        },
        content: 'Ana, verifique se você está usando a meta tag viewport corretamente no seu HTML: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Além disso, a sintaxe básica para media queries é: `@media screen and (max-width: 768px) { /* seus estilos aqui */ }`. Tente isso e me diga se funciona!'
      }
    ]
  },
  {
    id: 'd3',
    title: 'Recursos recomendados para aprender React',
    courseTitle: 'Desenvolvimento Web',
    moduleTitle: 'Frameworks JavaScript',
    createdAt: '2025-04-10T09:15:00',
    author: {
      id: 'u6',
      name: 'Luiza Ferreira',
      avatarUrl: 'https://i.pravatar.cc/150?img=20'
    },
    content: 'Estou começando a aprender React e gostaria de saber quais recursos vocês recomendam além do material do curso. Livros, cursos online, canais do YouTube, etc.',
    replies: []
  }
];

export default function DiscussoesPage() {
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);

  const handleDiscussionSelect = (discussionId: string) => {
    setSelectedDiscussion(discussionId);
  };

  const handleBackToList = () => {
    setSelectedDiscussion(null);
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
  };

  const handleSubmitReply = () => {
    alert('Resposta enviada com sucesso!');
    setReplyText('');
  };

  const handleNewDiscussionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDiscussionTitle(e.target.value);
  };

  const handleNewDiscussionContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewDiscussionContent(e.target.value);
  };

  const handleCreateDiscussion = () => {
    alert('Discussão criada com sucesso!');
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    setIsCreatingDiscussion(false);
  };

  const renderDiscussionList = () => (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Fórum de Discussões</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Participe das discussões dos seus cursos
          </p>
        </div>
        <Button onClick={() => setIsCreatingDiscussion(true)}>
          Nova Discussão
        </Button>
      </div>

      {isCreatingDiscussion ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Discussão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="Digite o título da discussão..."
                value={newDiscussionTitle}
                onChange={handleNewDiscussionTitleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Conteúdo</label>
              <textarea
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
                placeholder="Digite o conteúdo da sua discussão..."
                value={newDiscussionContent}
                onChange={handleNewDiscussionContentChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingDiscussion(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateDiscussion}
              disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim()}
            >
              Criar Discussão
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <div className="space-y-4">
        {mockDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{discussion.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <img 
                  src={discussion.author.avatarUrl} 
                  alt={discussion.author.name} 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-medium">{discussion.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(discussion.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="mb-4 line-clamp-2">{discussion.content}</p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Curso:</strong> {discussion.courseTitle}</p>
                <p><strong>Módulo:</strong> {discussion.moduleTitle}</p>
                <p><strong>Respostas:</strong> {discussion.replies.length}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleDiscussionSelect(discussion.id)}
                variant="ghost"
              >
                Ver discussão
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );

  const renderDiscussionDetail = () => {
    const discussion = mockDiscussions.find(d => d.id === selectedDiscussion);
    if (!discussion) return null;

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de discussões
          </Button>
          <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Curso:</strong> {discussion.courseTitle}</p>
            <p><strong>Módulo:</strong> {discussion.moduleTitle}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <img 
                src={discussion.author.avatarUrl} 
                alt={discussion.author.name} 
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{discussion.author.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(discussion.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p>{discussion.content}</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Respostas ({discussion.replies.length})</h2>

        {discussion.replies.length > 0 ? (
          <div className="space-y-4 mb-6">
            {discussion.replies.map((reply) => (
              <Card key={reply.id} className={reply.author.role === 'TUTOR' ? 'border-blue-500 dark:border-blue-700' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={reply.author.avatarUrl} 
                      alt={reply.author.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{reply.author.name}</p>
                        {reply.author.role === 'TUTOR' && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            Tutor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{reply.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">Ainda não há respostas nesta discussão.</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sua Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
              placeholder="Digite sua resposta..."
              value={replyText}
              onChange={handleReplyChange}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
            >
              Enviar Resposta
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {selectedDiscussion ? renderDiscussionDetail() : renderDiscussionList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
