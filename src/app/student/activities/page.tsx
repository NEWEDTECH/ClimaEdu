"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/button'

const mockActivities = [
  {
    id: 'a1',
    title: 'Implementação de Algoritmos Básicos',
    courseTitle: 'Introdução à Programação',
    moduleTitle: 'Estruturas de Controle',
    dueDate: '2025-04-20',
    status: 'pending',
    description: 'Implemente os algoritmos de ordenação bubble sort e selection sort em JavaScript.',
    instructions: `
      1. Crie uma função chamada bubbleSort que recebe um array de números e retorna o array ordenado usando o algoritmo bubble sort.
      2. Crie uma função chamada selectionSort que recebe um array de números e retorna o array ordenado usando o algoritmo selection sort.
      3. Compare a eficiência dos dois algoritmos e explique qual é mais eficiente e por quê.
      4. Submeta seu código em um arquivo .js.
    `,
    resourceUrl: 'https://example.com/sorting-algorithms.pdf'
  },
  {
    id: 'a2',
    title: 'Criação de Layout Responsivo',
    courseTitle: 'Desenvolvimento Web',
    moduleTitle: 'HTML Básico',
    dueDate: '2025-04-15',
    status: 'completed',
    description: 'Crie um layout responsivo para uma página de blog usando HTML e CSS.',
    instructions: `
      1. Crie uma página HTML com cabeçalho, menu de navegação, área de conteúdo principal e rodapé.
      2. Implemente um design responsivo que se adapte a dispositivos móveis, tablets e desktops.
      3. Use media queries para ajustar o layout em diferentes tamanhos de tela.
      4. Submeta os arquivos HTML e CSS.
    `,
    resourceUrl: 'https://example.com/responsive-design.pdf',
    submissionDate: '2025-04-10',
    feedback: 'Bom trabalho! O layout está responsivo e bem estruturado. Considere usar CSS Grid para simplificar o layout em futuras implementações.'
  },
  {
    id: 'a3',
    title: 'Análise de Algoritmos',
    courseTitle: 'Introdução à Programação',
    moduleTitle: 'Algoritmos Avançados',
    dueDate: '2025-04-25',
    status: 'pending',
    description: 'Analise a complexidade de tempo e espaço de diferentes algoritmos de busca.',
    instructions: `
      1. Compare os algoritmos de busca linear e busca binária.
      2. Implemente ambos os algoritmos em JavaScript.
      3. Analise a complexidade de tempo e espaço de cada algoritmo.
      4. Crie um gráfico comparando o desempenho dos dois algoritmos com diferentes tamanhos de entrada.
    `,
    resourceUrl: 'https://example.com/search-algorithms.pdf'
  }
];

export default function AtividadesPage() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
  };

  const handleSubmissionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubmissionText(e.target.value);
  };

  const handleSubmit = () => {
    alert('Atividade enviada com sucesso!');
    setSubmissionText('');
    handleBackToList();
  };

  const renderActivityList = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Minhas Atividades</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize e complete as atividades dos seus cursos
        </p>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                {activity.status === 'completed' ? (
                  <svg 
                    className="w-5 h-5 text-green-500 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-5 h-5 text-yellow-500 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                )}
                {activity.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><strong>Curso:</strong> {activity.courseTitle}</p>
                <p><strong>Módulo:</strong> {activity.moduleTitle}</p>
                <p><strong>Data de entrega:</strong> {new Date(activity.dueDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Status:</strong> {activity.status === 'completed' ? 'Concluída' : 'Pendente'}</p>
              </div>
              <p className="mb-4">{activity.description}</p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleActivitySelect(activity.id)}
                variant={activity.status === 'completed' ? 'primary' : 'secondary'}
              >
                {activity.status === 'completed' ? 'Ver detalhes' : 'Realizar atividade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );

  const renderActivityDetail = () => {
    const activity = mockActivities.find(a => a.id === selectedActivity);
    if (!activity) return null;

    return (
      <>
        <div className="mb-6">
          <Button 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de atividades
          </Button>
          <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Curso:</strong> {activity.courseTitle}</p>
            <p><strong>Módulo:</strong> {activity.moduleTitle}</p>
            <p><strong>Data de entrega:</strong> {new Date(activity.dueDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Status:</strong> {activity.status === 'completed' ? 'Concluída' : 'Pendente'}</p>
            {activity.status === 'completed' && activity.submissionDate && (
              <p><strong>Data de envio:</strong> {new Date(activity.submissionDate).toLocaleDateString('pt-BR')}</p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{activity.description}</p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line mb-4">{activity.instructions}</div>
            {activity.resourceUrl && (
              <div className="mt-4">
                <a 
                  href={activity.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Material de apoio
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {activity.status === 'completed' && activity.feedback && (
          <Card className="mt-4 border-green-500 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">Feedback do Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{activity.feedback}</p>
            </CardContent>
          </Card>
        )}

        {activity.status === 'pending' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Enviar Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[200px]"
                placeholder="Digite sua resposta ou cole seu código aqui..."
                value={submissionText}
                onChange={handleSubmissionChange}
              />
              <div className="mt-4">
                <Button 
                  variant="ghost"
                  className="mr-2"
                >
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                    />
                  </svg>
                  Anexar arquivo
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!submissionText.trim()}
                >
                  Enviar atividade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {selectedActivity ? renderActivityDetail() : renderActivityList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
