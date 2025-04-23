"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Progress } from '@/components/ui/helpers/progress';

const mockQuestionnaires = [
  {
    id: 'q1',
    title: 'Avaliação de Algoritmos de Ordenação',
    courseTitle: 'Introdução à Programação',
    moduleTitle: 'Estruturas de Controle',
    lessonTitle: 'Algoritmos de Ordenação',
    dueDate: '2025-04-25',
    status: 'available',
    description: 'Avaliação sobre os conceitos de algoritmos de ordenação vistos nas aulas.',
    maxAttempts: 3,
    passingScore: 70,
    timeLimit: 30, 
    questions: [
      {
        id: 'qq1',
        questionText: 'Qual algoritmo de ordenação tem a melhor complexidade de tempo no caso médio?',
        options: [
          'Bubble Sort',
          'Selection Sort',
          'Quick Sort',
          'Insertion Sort'
        ],
        correctAnswerIndex: 2
      },
      {
        id: 'qq2',
        questionText: 'Qual é a complexidade de tempo do Bubble Sort no pior caso?',
        options: [
          'O(n)',
          'O(n log n)',
          'O(n²)',
          'O(log n)'
        ],
        correctAnswerIndex: 2
      },
      {
        id: 'qq3',
        questionText: 'Qual algoritmo de ordenação é mais eficiente para listas quase ordenadas?',
        options: [
          'Quick Sort',
          'Merge Sort',
          'Heap Sort',
          'Insertion Sort'
        ],
        correctAnswerIndex: 3
      }
    ]
  },
  {
    id: 'q2',
    title: 'Avaliação de HTML e CSS',
    courseTitle: 'Desenvolvimento Web',
    moduleTitle: 'HTML Básico',
    lessonTitle: 'Estrutura HTML e CSS',
    dueDate: '2025-04-15',
    status: 'completed',
    description: 'Avaliação sobre os conceitos básicos de HTML e CSS.',
    maxAttempts: 2,
    passingScore: 60,
    timeLimit: 20,
    attempts: [
      {
        id: 'a1',
        date: '2025-04-10T14:30:00',
        score: 80,
        passed: true,
        timeSpent: 15,
        answers: [
          { questionId: 'qq4', selectedOptionIndex: 1, isCorrect: true },
          { questionId: 'qq5', selectedOptionIndex: 0, isCorrect: true },
          { questionId: 'qq6', selectedOptionIndex: 2, isCorrect: false },
          { questionId: 'qq7', selectedOptionIndex: 3, isCorrect: true },
          { questionId: 'qq8', selectedOptionIndex: 1, isCorrect: true }
        ]
      }
    ],
    questions: [
      {
        id: 'qq4',
        questionText: 'Qual tag HTML é usada para criar um link?',
        options: [
          '<link>',
          '<a>',
          '<href>',
          '<url>'
        ],
        correctAnswerIndex: 1
      },
      {
        id: 'qq5',
        questionText: 'Qual propriedade CSS é usada para alterar a cor do texto?',
        options: [
          'color',
          'text-color',
          'font-color',
          'text-style'
        ],
        correctAnswerIndex: 0
      },
      {
        id: 'qq6',
        questionText: 'Qual seletor CSS seleciona todos os elementos <p> dentro de um elemento com id="main"?',
        options: [
          'p.main',
          '#main p',
          'p#main',
          'main > p'
        ],
        correctAnswerIndex: 1
      },
      {
        id: 'qq7',
        questionText: 'Qual tag HTML cria um título de nível 1?',
        options: [
          '<title>',
          '<header>',
          '<heading>',
          '<h1>'
        ],
        correctAnswerIndex: 3
      },
      {
        id: 'qq8',
        questionText: 'Qual propriedade CSS define o espaçamento entre elementos?',
        options: [
          'space',
          'margin',
          'padding',
          'gap'
        ],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: 'q3',
    title: 'Avaliação de JavaScript Básico',
    courseTitle: 'Desenvolvimento Web',
    moduleTitle: 'JavaScript Fundamentals',
    lessonTitle: 'Introdução ao JavaScript',
    dueDate: '2025-05-05',
    status: 'available',
    description: 'Avaliação sobre os conceitos básicos de JavaScript.',
    maxAttempts: 3,
    passingScore: 70,
    timeLimit: 25,
    questions: [
      {
        id: 'qq9',
        questionText: 'Qual é a forma correta de declarar uma variável em JavaScript moderno?',
        options: [
          'var x = 5;',
          'let x = 5;',
          'const x = 5;',
          'both let and const are correct'
        ],
        correctAnswerIndex: 3
      },
      {
        id: 'qq10',
        questionText: 'Como você verifica se duas variáveis são iguais em valor e tipo?',
        options: [
          'x = y',
          'x == y',
          'x === y',
          'x.equals(y)'
        ],
        correctAnswerIndex: 2
      }
    ]
  }
];

export default function QuestionariosPage() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionnaireSelect = (questionnaireId: string) => {
    setSelectedQuestionnaire(questionnaireId);
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
  };

  const handleBackToList = () => {
    setSelectedQuestionnaire(null);
    setIsStarted(false);
  };

  const handleStartQuestionnaire = () => {
    const questionnaire = mockQuestionnaires.find(q => q.id === selectedQuestionnaire);
    if (questionnaire) {
      setIsStarted(true);
      setTimeRemaining(questionnaire.timeLimit * 60); 
      setSelectedAnswers(new Array(questionnaire.questions.length).fill(-1));
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    const questionnaire = mockQuestionnaires.find(q => q.id === selectedQuestionnaire);
    if (questionnaire && currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuestionnaire = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Questionário enviado com sucesso!');
      setIsSubmitting(false);
      setIsStarted(false);
      handleBackToList();
    }, 1500);
  };

  const renderQuestionnaireList = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Questionários</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Avaliações disponíveis para os seus cursos
        </p>
      </div>

      <div className="space-y-4">
        {mockQuestionnaires.map((questionnaire) => (
          <Card 
            key={questionnaire.id} 
            className={`hover:shadow-md transition-shadow ${
              questionnaire.status === 'completed' ? 'border-green-500 dark:border-green-700' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                {questionnaire.status === 'completed' && (
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
                )}
                {questionnaire.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><strong>Curso:</strong> {questionnaire.courseTitle}</p>
                <p><strong>Módulo:</strong> {questionnaire.moduleTitle}</p>
                <p><strong>Aula:</strong> {questionnaire.lessonTitle}</p>
                <p><strong>Data limite:</strong> {new Date(questionnaire.dueDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Status:</strong> {questionnaire.status === 'completed' ? 'Concluído' : 'Disponível'}</p>
                {questionnaire.status === 'completed' && questionnaire.attempts && (
                  <p><strong>Nota:</strong> {questionnaire.attempts[0].score}%</p>
                )}
              </div>
              <p className="mb-4">{questionnaire.description}</p>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tentativas permitidas:</span>
                  <span>{questionnaire.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nota para aprovação:</span>
                  <span>{questionnaire.passingScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo limite:</span>
                  <span>{questionnaire.timeLimit} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span>Questões:</span>
                  <span>{questionnaire.questions.length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleQuestionnaireSelect(questionnaire.id)}
                variant={questionnaire.status === 'completed' ? 'outline' : 'default'}
              >
                {questionnaire.status === 'completed' ? 'Ver resultados' : 'Iniciar questionário'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );

  const renderQuestionnaireDetail = () => {
    const questionnaire = mockQuestionnaires.find(q => q.id === selectedQuestionnaire);
    if (!questionnaire) return null;

    if (questionnaire.status === 'completed' && questionnaire.attempts) {
      return renderCompletedQuestionnaire(questionnaire);
    }

    if (!isStarted) {
      return renderQuestionnaireInstructions(questionnaire);
    }

    return renderQuestionnaireQuestions(questionnaire);
  };

  const renderQuestionnaireInstructions = (questionnaire: typeof mockQuestionnaires[0]) => (
    <>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToList}
          className="mb-4"
        >
          ← Voltar para lista de questionários
        </Button>
        <h1 className="text-2xl font-bold mb-2">{questionnaire.title}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p><strong>Curso:</strong> {questionnaire.courseTitle}</p>
          <p><strong>Módulo:</strong> {questionnaire.moduleTitle}</p>
          <p><strong>Aula:</strong> {questionnaire.lessonTitle}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{questionnaire.description}</p>
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tentativas permitidas:</span>
              <span>{questionnaire.maxAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span>Nota para aprovação:</span>
              <span>{questionnaire.passingScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Tempo limite:</span>
              <span>{questionnaire.timeLimit} minutos</span>
            </div>
            <div className="flex justify-between">
              <span>Questões:</span>
              <span>{questionnaire.questions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <svg 
              className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Atenção</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>Uma vez iniciado, o cronômetro não pode ser pausado.</li>
                <li>Você pode navegar entre as questões livremente.</li>
                <li>Suas respostas são salvas automaticamente.</li>
                <li>Ao finalizar o tempo ou enviar o questionário, suas respostas serão avaliadas.</li>
                <li>Certifique-se de ter uma conexão estável com a internet.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToList}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleStartQuestionnaire}
        >
          Iniciar Questionário
        </Button>
      </div>
    </>
  );

  const renderQuestionnaireQuestions = (questionnaire: typeof mockQuestionnaires[0]) => {
    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
      <>
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">{questionnaire.title}</h1>
          <div className="text-lg font-mono">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div>
            Questão {currentQuestionIndex + 1} de {questionnaire.questions.length}
          </div>
          <div className="flex space-x-2">
            {questionnaire.questions.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : selectedAnswers[index] >= 0
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border cursor-pointer ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleSelectAnswer(currentQuestionIndex, index)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-700 dark:bg-blue-700'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    {option}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>
          
          {currentQuestionIndex < questionnaire.questions.length - 1 ? (
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === -1}
            >
              Próxima
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitQuestionnaire}
              disabled={selectedAnswers.includes(-1) || isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar Questionário'}
            </Button>
          )}
        </div>

        <div className="mt-6">
          <Progress value={(selectedAnswers.filter(a => a !== -1).length / questionnaire.questions.length) * 100} />
          <div className="flex justify-between text-sm mt-1">
            <span>Progresso</span>
            <span>{selectedAnswers.filter(a => a !== -1).length} de {questionnaire.questions.length} respondidas</span>
          </div>
        </div>
      </>
    );
  };

  const renderCompletedQuestionnaire = (questionnaire: typeof mockQuestionnaires[0]) => {
    if (!questionnaire.attempts) return null;
    const attempt = questionnaire.attempts[0];

    return (
      <>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Voltar para lista de questionários
          </Button>
          <h1 className="text-2xl font-bold mb-2">{questionnaire.title}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p><strong>Curso:</strong> {questionnaire.courseTitle}</p>
            <p><strong>Módulo:</strong> {questionnaire.moduleTitle}</p>
            <p><strong>Aula:</strong> {questionnaire.lessonTitle}</p>
            <p><strong>Data de realização:</strong> {new Date(attempt.date).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <Card className={`mb-6 ${
          attempt.passed 
            ? 'border-green-500 dark:border-green-700' 
            : 'border-red-500 dark:border-red-700'
        }`}>
          <CardHeader>
            <CardTitle className={
              attempt.passed 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }>
              Resultado: {attempt.passed ? 'Aprovado' : 'Reprovado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span>Pontuação</span>
                <span className={
                  attempt.passed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }>
                  {attempt.score}%
                </span>
              </div>
              <Progress 
                value={attempt.score} 
                className={
                  attempt.passed 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }
              />
              <div className="flex justify-between text-sm mt-1">
                <span>Nota mínima: {questionnaire.passingScore}%</span>
                <span>Tempo gasto: {attempt.timeSpent} minutos</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questões corretas:</span>
                <span>{attempt.answers.filter(a => a.isCorrect).length} de {attempt.answers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Revisão das Questões</h2>

        <div className="space-y-6">
          {questionnaire.questions.map((question, index) => {
            const answer = attempt.answers.find(a => a.questionId === question.id);
            const isCorrect = answer?.isCorrect;

            return (
              <Card 
                key={question.id} 
                className={`${
                  isCorrect 
                    ? 'border-green-500 dark:border-green-700' 
                    : 'border-red-500 dark:border-red-700'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    {isCorrect ? (
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
                        className="w-5 h-5 text-red-500 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    )}
                    Questão {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.questionText}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-md border ${
                          answer && answer.selectedOptionIndex === optIndex && !isCorrect
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                            : question.correctAnswerIndex === optIndex
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          {answer && answer.selectedOptionIndex === optIndex && !isCorrect && (
                            <svg 
                              className="w-5 h-5 text-red-500 mr-2" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                              />
                            </svg>
                          )}
                          {question.correctAnswerIndex === optIndex && (
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
                          )}
                          {!(answer && answer.selectedOptionIndex === optIndex && !isCorrect) && 
                            question.correctAnswerIndex !== optIndex && (
                            <div className="w-5 h-5 mr-2"></div>
                          )}
                          {option}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {selectedQuestionnaire ? renderQuestionnaireDetail() : renderQuestionnaireList()}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
