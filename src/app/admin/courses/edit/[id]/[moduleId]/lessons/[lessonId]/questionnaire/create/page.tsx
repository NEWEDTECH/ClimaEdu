'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card/card';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { LoadingSpinner } from '@/components/loader';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CreateQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/create-questionnaire/create-questionnaire.use-case';
import { AddQuestionToQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.use-case';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { showToast } from '@/components/toast';

type QuestionFormData = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  id?: string;
}

type QuestionnaireFormData = {
  title: string;
  maxAttempts: number;
  passingScore: number;
}

export default function QuestionnairePage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId } = unwrappedParams;

  const [questionnaireFormData, setQuestionnaireFormData] = useState<QuestionnaireFormData>({
    title: '',
    maxAttempts: 3,
    passingScore: 70,
  });

  // Questions list
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData>({
    questionText: '',
    options: ['', ''],
    correctAnswerIndex: 0
  });

  // UI states
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [moduleName, setModuleName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState<boolean>(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        );

        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        );

        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        );

        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
          setError('Lição não encontrada');
          setIsLoading(false);
          return;
        }

        setLessonTitle(lesson.title);

        const moduleData = await moduleRepository.findById(moduleId);
        if (!moduleData) {
          setError('Módulo não encontrado');
          setIsLoading(false);
          return;
        }

        setModuleName(moduleData.title);


        // If we're creating, check if the lesson already has a questionnaire
        if (lesson.questionnaire) {
          setError('Esta lição já possui um questionário');
          setIsLoading(false);
          return;
        }

        const existingQuestionnaire = await questionnaireRepository.findByLessonId(lessonId);
        if (existingQuestionnaire) {
          setError('Esta lição já possui um questionário. Volte para a página da lição para visualizá-lo.');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Falha ao carregar dados';
        setError(errorMessage);
        showToast.error(errorMessage);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, moduleId]);

  // Questionnaire form handlers
  const handleQuestionnaireChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestionnaireFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttempts' || name === 'passingScore' ? parseInt(value, 10) : value
    }));
  };

  // Question form handlers
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentQuestion(prev => ({
      ...prev,
      questionText: e.target.value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;

    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSetCorrectAnswer = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswerIndex: index
    }));
  };

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      alert('Uma pergunta deve ter pelo menos 2 opções');
      return;
    }

    const newOptions = [...currentQuestion.options];
    newOptions.splice(index, 1);

    let newCorrectAnswerIndex = currentQuestion.correctAnswerIndex;
    if (index === currentQuestion.correctAnswerIndex) {
      newCorrectAnswerIndex = 0;
    } else if (index < currentQuestion.correctAnswerIndex) {
      newCorrectAnswerIndex--;
    }

    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswerIndex: newCorrectAnswerIndex
    }));
  };

  // Question management
  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('O texto da pergunta não pode estar vazio');
      return;
    }

    if (currentQuestion.options.some(option => !option.trim())) {
      alert('Todas as opções devem ser preenchidas');
      return;
    }

    if (isEditingQuestion && editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
      setQuestions(updatedQuestions);
    } else {
      // Add new question
      setQuestions(prev => [...prev, { ...currentQuestion }]);
    }

    // Reset form
    setCurrentQuestion({
      questionText: '',
      options: ['', ''],
      correctAnswerIndex: 0
    });
    setIsEditingQuestion(false);
    setEditingQuestionIndex(null);
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion({ ...questions[index] });
    setIsEditingQuestion(true);
    setEditingQuestionIndex(index);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length === 0) {
      alert('Adicione pelo menos uma pergunta ao questionário');
      return;
    }

    // Check if there's content in the current question form
    const hasContentInForm = currentQuestion.questionText.trim() !== '' ||
      currentQuestion.options.some(opt => opt.trim() !== '');

    // If there are more than 2 questions already created, we can bypass the form validation
    if (questions.length >= 2) {
      // If there's content in the options but no question text, show an error
      const hasOptionsContent = currentQuestion.options.some(opt => opt.trim() !== '');
      if (hasOptionsContent && !currentQuestion.questionText.trim()) {
        alert('Se houver conteúdo nas opções de resposta, o texto da pergunta é obrigatório');
        return;
      }

      // If there's content in both question text and options, ask if they want to add it
      if (hasContentInForm) {
        const confirmSave = window.confirm('Você tem uma pergunta não adicionada. Deseja adicionar esta pergunta antes de salvar?');
        if (confirmSave) {
          // User wants to add the current question first
          addQuestion();
          return; // Return here to prevent saving until the question is added
        }
      }

      // Otherwise, proceed with saving
    } else if (hasContentInForm) {
      // If there are fewer than 2 questions and there's content in the form, always ask
      const confirmSave = window.confirm('Você tem uma pergunta não adicionada. Deseja adicionar esta pergunta antes de salvar?');
      if (confirmSave) {
        // User wants to add the current question first
        addQuestion();
        return; // Return here to prevent saving until the question is added
      }
    }

    setIsSubmitting(true);

    try {

      // Create new questionnaire
      const createQuestionnaireUseCase = container.get<CreateQuestionnaireUseCase>(
        Register.content.useCase.CreateQuestionnaireUseCase
      );

      const result = await createQuestionnaireUseCase.execute({
        lessonId,
        title: questionnaireFormData.title,
        maxAttempts: questionnaireFormData.maxAttempts,
        passingScore: questionnaireFormData.passingScore,
      });

      const questionnaireId = result.questionnaire.id;

      // Add questions to questionnaire
      const addQuestionUseCase = container.get<AddQuestionToQuestionnaireUseCase>(
        Register.content.useCase.AddQuestionToQuestionnaireUseCase
      );

      // Add questions sequentially
      for (const question of questions) {
        await addQuestionUseCase.execute({
          questionnaireId,
          questionText: question.questionText,
          options: question.options,
          correctAnswerIndex: question.correctAnswerIndex
        });
      }


      // Redirect to lesson page
      router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);

    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
      alert(`Falha ao salvar questionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href={`/admin/courses/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`}>
                  <Button>Voltar para a Lição</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Salvar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Adicionar questionário à lição <span className="font-medium">{lessonTitle}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Módulo: <span className="font-medium">{moduleName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Questionnaire Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações do Questionário</CardTitle>
                <CardDescription>
                  Configure as informações básicas do questionário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título do Questionário
                    </label>
                    <InputText
                      id="title"
                      placeholder="Digite um título para o questionário"
                      name="title"
                      value={questionnaireFormData.title}
                      onChange={handleQuestionnaireChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Um título claro que descreva o objetivo do questionário
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Número Máximo de Tentativas
                      </label>
                      <InputText
                        id="maxAttempts"
                        type="number"
                        min="1"
                        max="10"
                        name="maxAttempts"
                        value={questionnaireFormData.maxAttempts.toString()}
                        onChange={handleQuestionnaireChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Quantas vezes o aluno pode tentar responder o questionário
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nota de Aprovação (%)
                      </label>
                      <InputText
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        name="passingScore"
                        value={questionnaireFormData.passingScore.toString()}
                        onChange={handleQuestionnaireChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Porcentagem mínima para aprovação no questionário
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Perguntas do Questionário</CardTitle>
                  <CardDescription>
                    {questions.length === 0
                      ? 'Adicione perguntas ao questionário'
                      : `${questions.length} pergunta(s) adicionada(s)`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Este questionário ainda não possui perguntas. Adicione perguntas abaixo para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 flex-shrink-0 text-blue-500 text-xs font-medium">
                                {index + 1}
                              </div>
                              <h3 className="font-medium">
                                {question.questionText}
                              </h3>
                            </div>
                            <div className="ml-8 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${optIndex === question.correctAnswerIndex
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}></div>
                                  <p className={`text-sm ${optIndex === question.correctAnswerIndex
                                    ? 'font-medium text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {option}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant='primary'
                              onClick={() => editQuestion(index)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                              onClick={() => removeQuestion(index)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add/Edit Question Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {isEditingQuestion ? 'Editar Pergunta' : 'Adicionar Nova Pergunta'}
                </CardTitle>
                <CardDescription>
                  {isEditingQuestion
                    ? 'Atualize os detalhes da pergunta'
                    : 'Crie uma nova pergunta para o questionário'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Texto da Pergunta
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[80px]"
                      placeholder="Digite o enunciado da pergunta"
                      value={currentQuestion.questionText}
                      onChange={handleQuestionTextChange}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">
                        Opções de Resposta
                      </label>
                      <Button
                        type="button"
                        className="bg-green-500 hover:bg-green-500"
                        onClick={handleAddOption}
                      >
                        Adicionar Opção
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${index === currentQuestion.correctAnswerIndex
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                            onClick={() => handleSetCorrectAnswer(index)}
                            title="Marcar como resposta correta"
                          >
                            {index === currentQuestion.correctAnswerIndex && (
                              <svg
                                className="w-4 h-4"
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
                          </div>
                          <InputText
                            id={`option-${index}`}
                            placeholder={`Opção ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-1"
                            onClick={() => handleRemoveOption(index)}
                            disabled={currentQuestion.options.length <= 2}
                            title="Remover opção"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Clique no círculo à esquerda para marcar a resposta correta
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    {isEditingQuestion && (
                      <Button
                        type="button"
                        className="border border-gray-300 bg-transparent hover:bg-gray-100"
                        onClick={() => {
                          setCurrentQuestion({
                            questionText: '',
                            options: ['', ''],
                            correctAnswerIndex: 0
                          });
                          setIsEditingQuestion(false);
                          setEditingQuestionIndex(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={addQuestion}
                    >
                      {isEditingQuestion ? 'Salvar Alterações' : 'Adicionar Pergunta'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                
                <Button
                  type="button"
                  variant='secondary'
                >
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting || questions.length === 0}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Questionário'}
              </Button>
            </div>
          </form>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para Criar Boas Perguntas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Seja Claro e Direto</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Evite ambiguidades e formule perguntas que tenham uma única interpretação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-green-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Alternativas Plausíveis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Todas as alternativas devem parecer possíveis, evitando opções obviamente incorretas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-yellow-500">
                    <svg
                      className="w-4 h-4"
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
                  </div>
                  <div>
                    <p className="font-medium">Evite Pistas Não Intencionais</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Não dê dicas sobre a resposta correta através da formulação ou extensão das alternativas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-purple-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Teste Conhecimentos Relevantes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Foque em conceitos importantes da lição, não em detalhes triviais.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
