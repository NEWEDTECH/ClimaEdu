'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card/card';
import { Editor } from 'primereact/editor';
import 'quill/dist/quill.snow.css';
import { Button } from '@/components/button';
import { InputText } from '@/components/input';
import { FormSection } from '@/components/form';
import { LoadingSpinner } from '@/components/loader';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { ListQuestionsOfQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/list-questions-of-questionnaire/list-questions-of-questionnaire.use-case';
import { AddQuestionToQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.use-case';
import { UpdateQuestionUseCase } from '@/_core/modules/content/core/use-cases/update-question/update-question.use-case';
import { DeleteQuestionUseCase } from '@/_core/modules/content/core/use-cases/delete-question/delete-question.use-case';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { Question } from '@/_core/modules/content/core/entities/Question';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { showToast } from '@/components/toast';

type QuestionFormData = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

type QuestionnaireFormData = {
  title: string;
  maxAttempts: number;
  passingScore: number;
}

export default function QuestionsManagementPage({ params }: { params: Promise<{ id: string, moduleId: string, lessonId: string, questionnaireId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id: courseId, moduleId, lessonId, questionnaireId } = unwrappedParams;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionnaireTitle, setQuestionnaireTitle] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [moduleName, setModuleName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireFormData, setQuestionnaireFormData] = useState<QuestionnaireFormData>({
    title: '',
    maxAttempts: 3,
    passingScore: 70,
  });
  const [isUpdatingQuestionnaire, setIsUpdatingQuestionnaire] = useState<boolean>(false);

  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    questionText: '',
    options: ['', ''],
    correctAnswerIndex: 0
  });

  const [isDeletingQuestion, setIsDeletingQuestion] = useState<boolean>(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const questionnaireRepository = container.get<QuestionnaireRepository>(
          Register.content.repository.QuestionnaireRepository
        );

        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        );

        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        );

        const listQuestionsUseCase = container.get<ListQuestionsOfQuestionnaireUseCase>(
          Register.content.useCase.ListQuestionsOfQuestionnaireUseCase
        );

        const questionnaireData = await questionnaireRepository.findById(questionnaireId);
        if (!questionnaireData) {
          setError('Questionário não encontrado');
          setIsLoading(false);
          return;
        }

        setQuestionnaire(questionnaireData);
        setQuestionnaireTitle(questionnaireData.title);
        setQuestionnaireFormData({
          title: questionnaireData.title,
          maxAttempts: questionnaireData.maxAttempts,
          passingScore: questionnaireData.passingScore
        });

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

        const result = await listQuestionsUseCase.execute({
          questionnaireId
        });

        setQuestions(result.questions);
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
  }, [questionnaireId, lessonId, moduleId]);

  const handleAddOption = () => {
    setQuestionFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (questionFormData.options.length <= 2) {
      showToast.warning('Uma pergunta deve ter pelo menos 2 opções');
      return;
    }

    const newOptions = [...questionFormData.options];
    newOptions.splice(index, 1);

    let newCorrectAnswerIndex = questionFormData.correctAnswerIndex;
    if (index === questionFormData.correctAnswerIndex) {
      newCorrectAnswerIndex = 0;
    } else if (index < questionFormData.correctAnswerIndex) {
      newCorrectAnswerIndex--;
    }

    setQuestionFormData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswerIndex: newCorrectAnswerIndex
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = value;

    setQuestionFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };


  const handleSetCorrectAnswer = (index: number) => {
    setQuestionFormData(prev => ({
      ...prev,
      correctAnswerIndex: index
    }));
  };


  const resetFormData = () => {
    setQuestionFormData({
      questionText: '',
      options: ['', ''],
      correctAnswerIndex: 0
    });
    setIsAddingQuestion(false);
    setIsEditingQuestion(false);
    setEditingQuestionId(null);
  };

  const startAddQuestion = () => {
    resetFormData();
    setIsAddingQuestion(true);
  };


  const startEditQuestion = (question: Question) => {
    setQuestionFormData({
      questionText: question.questionText,
      options: [...question.options],
      correctAnswerIndex: question.correctAnswerIndex
    });
    setEditingQuestionId(question.id);
    setIsEditingQuestion(true);
    setIsAddingQuestion(false);
  };


  const startDeleteQuestion = (questionId: string) => {
    setDeletingQuestionId(questionId);
    setIsDeletingQuestion(true);
  };


  const cancelDeleteQuestion = () => {
    setDeletingQuestionId(null);
    setIsDeletingQuestion(false);
  };


  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      if (!questionFormData.questionText.trim()) {
        showToast.warning('O texto da pergunta não pode estar vazio');
        return;
      }

      if (questionFormData.options.some(option => !option.trim())) {
        showToast.warning('Todas as opções devem ser preenchidas');
        return;
      }

      // Show loading toast
      const loadingToastId = showToast.loading('Adicionando pergunta...');

      const addQuestionUseCase = container.get<AddQuestionToQuestionnaireUseCase>(
        Register.content.useCase.AddQuestionToQuestionnaireUseCase
      );


      const result = await addQuestionUseCase.execute({
        questionnaireId,
        questionText: questionFormData.questionText,
        options: questionFormData.options,
        correctAnswerIndex: questionFormData.correctAnswerIndex
      });

      setQuestions(prev => [...prev, result.question]);

      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Pergunta adicionada com sucesso!',
        type: 'success'
      });

      resetFormData();
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      showToast.error(`Falha ao adicionar pergunta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };


  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingQuestionId) return;

    try {

      if (!questionFormData.questionText.trim()) {
        showToast.warning('O texto da pergunta não pode estar vazio');
        return;
      }

      if (questionFormData.options.some(option => !option.trim())) {
        showToast.warning('Todas as opções devem ser preenchidas');
        return;
      }

      // Show loading toast
      const loadingToastId = showToast.loading('Atualizando pergunta...');

      const updateQuestionUseCase = container.get<UpdateQuestionUseCase>(
        Register.content.useCase.UpdateQuestionUseCase
      );

      const result = await updateQuestionUseCase.execute({
        questionnaireId,
        questionId: editingQuestionId,
        questionText: questionFormData.questionText,
        options: questionFormData.options,
        correctAnswerIndex: questionFormData.correctAnswerIndex
      });

      setQuestions(prev =>
        prev.map(q => q.id === editingQuestionId ? result.question : q)
      );

      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Pergunta atualizada com sucesso!',
        type: 'success'
      });

      resetFormData();
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error);
      showToast.error(`Falha ao atualizar pergunta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;

    try {
      // Show loading toast
      const loadingToastId = showToast.loading('Excluindo pergunta...');

      const deleteQuestionUseCase = container.get<DeleteQuestionUseCase>(
        Register.content.useCase.DeleteQuestionUseCase
      );

      await deleteQuestionUseCase.execute({
        questionnaireId,
        questionId: deletingQuestionId
      });

      setQuestions(prev => prev.filter(q => q.id !== deletingQuestionId));

      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Pergunta excluída com sucesso!',
        type: 'success'
      });

      setDeletingQuestionId(null);
      setIsDeletingQuestion(false);
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      showToast.error(`Falha ao excluir pergunta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };


  const handleQuestionnaireChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestionnaireFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttempts' || name === 'passingScore' ? parseInt(value, 10) : value
    }));
  };

  const handleUpdateQuestionnaire = async () => {
    if (!questionnaire) return;

    try {
      setIsUpdatingQuestionnaire(true);

      // Show loading toast
      const loadingToastId = showToast.loading('Atualizando questionário...');

      questionnaire.updateTitle(questionnaireFormData.title);
      questionnaire.updateMaxAttempts(questionnaireFormData.maxAttempts);
      questionnaire.updatePassingScore(questionnaireFormData.passingScore);

      const questionnaireRepository = container.get<QuestionnaireRepository>(
        Register.content.repository.QuestionnaireRepository
      );

      const updatedQuestionnaire = await questionnaireRepository.save(questionnaire);


      setQuestionnaire(updatedQuestionnaire);
      setQuestionnaireTitle(updatedQuestionnaire.title);

      // Update loading toast to success
      showToast.update(loadingToastId, {
        render: 'Informações do questionário atualizadas com sucesso!',
        type: 'success'
      });

      setIsUpdatingQuestionnaire(false);
    } catch (error) {
      console.error('Erro ao atualizar questionário:', error);
      showToast.error(`Falha ao atualizar questionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsUpdatingQuestionnaire(false);
    }
  };

  const handleFinish = () => {
    router.push(`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`);
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
                <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Questinário: {questionnaireTitle}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Lição: <span className="font-medium">{lessonTitle}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Módulo: <span className="font-medium">{moduleName}</span>
                </p>
              </div>
              <Link href={`/admin/courses/edit/${courseId}/${moduleId}/lessons/${lessonId}`}>
                <Button variant='primary'>
                  Voltar
                </Button>
              </Link>
            </div>
          </div>

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
              <div className="flex justify-end mt-4">
                <Button
                  className='hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3'
                  onClick={handleUpdateQuestionnaire}
                  disabled={isUpdatingQuestionnaire}
                >
                  {isUpdatingQuestionnaire ? 'Salvando...' : 'Atualizar Informações'}
                </Button>
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
              <Button
                className='hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3'
                onClick={startAddQuestion}
                disabled={isAddingQuestion || isEditingQuestion}
              >
                Adicionar Pergunta
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este questionário ainda não possui perguntas. Adicione perguntas para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 flex-shrink-0 text-blue-500 text-xs font-medium">
                              {index + 1}
                            </div>
                            <div
                              className="ql-editor font-medium"
                              dangerouslySetInnerHTML={{ __html: question.questionText }}
                            />
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
                            className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3"
                            onClick={() => startEditQuestion(question)}
                            disabled={isAddingQuestion || isEditingQuestion || isDeletingQuestion}
                          >
                            Editar
                          </Button>
                          <Button
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                            onClick={() => startDeleteQuestion(question.id)}
                            disabled={isAddingQuestion || isEditingQuestion || isDeletingQuestion}
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
            <CardFooter className="flex justify-end">
              <Button
                className='hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3'
                onClick={handleFinish}
                disabled={isAddingQuestion || isEditingQuestion || isDeletingQuestion}
              >
                Salvar
              </Button>
            </CardFooter>
          </Card>

          {(isAddingQuestion || isEditingQuestion) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {isAddingQuestion ? 'Adicionar Nova Pergunta' : 'Editar Pergunta'}
                </CardTitle>
                <CardDescription>
                  {isAddingQuestion
                    ? 'Crie uma nova pergunta para o questionário'
                    : 'Atualize os detalhes da pergunta'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormSection onSubmit={isAddingQuestion ? handleAddQuestion : handleUpdateQuestion} error={null}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Texto da Pergunta
                      </label>

                      <Editor
                        value={questionFormData.questionText}
                        onTextChange={(e) =>
                          setQuestionFormData(prev => ({
                            ...prev,
                            questionText: e.htmlValue || ''
                          }))
                        }
                        style={{ height: '320px' }}
                      />

                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">
                          Opções de Resposta
                        </label>
                        <Button
                          type="button"
                          className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3"
                          onClick={handleAddOption}
                        >
                          Adicionar Opção
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {questionFormData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${index === questionFormData.correctAnswerIndex
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                              onClick={() => handleSetCorrectAnswer(index)}
                              title="Marcar como resposta correta"
                            >
                              {index === questionFormData.correctAnswerIndex && (
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
                              required
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-1"
                              onClick={() => handleRemoveOption(index)}
                              disabled={questionFormData.options.length <= 2}
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
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      className="border border-gray-300 bg-transparent dark:text-gray-100"
                      onClick={resetFormData}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                    >
                      {isAddingQuestion ? 'Adicionar Pergunta' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </FormSection>
              </CardContent>
            </Card>
          )}

          {/* Delete Question Confirmation */}
          {isDeletingQuestion && (
            <Card className="mb-6 border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-600">Confirmar Exclusão</CardTitle>
                <CardDescription>
                  Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end space-x-3">
                <Button
                  type="button"
                  className="border border-gray-300 bg-transparent hover:bg-gray-100"
                  onClick={cancelDeleteQuestion}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteQuestion}
                >
                  Sim, Excluir Pergunta
                </Button>
              </CardFooter>
            </Card>
          )}

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
