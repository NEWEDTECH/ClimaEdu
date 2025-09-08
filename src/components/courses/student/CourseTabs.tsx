'use client';

import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs/tabs';
import { TabsTrigger } from '@/components/tabs/TabsTrigger';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';

type CourseTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeContent: Content | null;
  activeLesson: string | null;
  activeLessonData: Lesson | null;
  activeActivity: Activity | null;
  activeQuestionnaire: Questionnaire | null;
  attemptCount: number;
  hasPassedQuestionnaire: boolean;
  courseId: string;
};

export function CourseTabs({
  activeTab,
  setActiveTab,
  activeLesson,
  activeLessonData,
  activeActivity,
  activeQuestionnaire,
  attemptCount,
  hasPassedQuestionnaire,
  courseId
}: CourseTabsProps) {
  return (
    <div>
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
          <TabsTrigger 
            value="content"
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Conteúdo
          </TabsTrigger>
          <TabsTrigger 
            value="activities"
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-orange-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Atividades
          </TabsTrigger>
          <TabsTrigger 
            value="questionnaire"
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-green-400 dark:data-[state=active]:border-green-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Questionário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <div className="space-y-6">
            {/* Lesson Description Section */}
            {activeLessonData && activeLessonData.description && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {activeLessonData.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Descrição da lição
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:visited]:text-purple-600 dark:[&_a]:text-blue-400 dark:[&_a:hover]:text-blue-300 dark:[&_a:visited]:text-purple-400"
                    dangerouslySetInnerHTML={{ __html: activeLessonData.description }}
                  />
                </div>
              </div>
            )}

          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Atividades</h3>

            {activeLesson ? (
              <div>
                {activeActivity ? (
                  <div className="space-y-6">
                    {/* Activity Header */}
                    <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Atividade da Lição
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Complete a atividade para consolidar seu aprendizado
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Description */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Descrição
                        </h5>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {activeActivity.description}
                          </p>
                        </div>
                      </div>

                      {/* Activity Instructions */}
                      <div>
                        <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Instruções
                        </h5>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
                                {activeActivity.instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resource URL if available */}
                      {activeActivity.resourceUrl && (
                        <div>
                          <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Recursos
                          </h5>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                                  Material de apoio disponível
                                </p>
                                <a
                                  href={activeActivity.resourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                >
                                  <span>Acessar recurso</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Activity Status/Action */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                Atividade Prática
                              </p>
                              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                Complete esta atividade seguindo as instruções acima
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                      Nenhuma atividade disponível
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      Esta lição não possui atividades práticas.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                  Selecione uma lição
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Escolha uma lição na barra lateral para ver as atividades disponíveis.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="questionnaire" className="mt-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Questionário</h3>

            {activeLesson ? (
              <div>
                {activeQuestionnaire ? (
                  <div className="space-y-6">
                    {/* Questionnaire Info */}
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {activeQuestionnaire.title}
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Tentativas máximas:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{activeQuestionnaire.maxAttempts}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Tentativas realizadas:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{attemptCount}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Nota de aprovação:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{activeQuestionnaire.passingScore}%</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">Total de perguntas:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{activeQuestionnaire.questions.length}</span>
                        </div>

                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`font-medium ${hasPassedQuestionnaire
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-900 dark:text-gray-100'
                            }`}>
                            {hasPassedQuestionnaire ? 'Aprovado' : 'Não aprovado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Success message if student passed */}
                    {hasPassedQuestionnaire && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-700 dark:text-green-300 font-medium">
                            Parabéns! Você foi aprovado neste questionário.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Warning if max attempts reached */}
                    {attemptCount >= activeQuestionnaire.maxAttempts && !hasPassedQuestionnaire && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-700 dark:text-red-300 font-medium">
                            Você excedeu o número máximo de tentativas para este questionário.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 border-t">
                      <a
                        href={`/student/courses/${courseId}/questionnaire/${activeQuestionnaire.id}`}
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${hasPassedQuestionnaire
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : attemptCount >= activeQuestionnaire.maxAttempts
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        onClick={(e) => {
                          if (
                            hasPassedQuestionnaire ||
                            (attemptCount >= activeQuestionnaire.maxAttempts && !hasPassedQuestionnaire)
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {hasPassedQuestionnaire
                          ? 'Finalizado'
                          : attemptCount >= activeQuestionnaire.maxAttempts
                            ? 'Tentativas Esgotadas'
                            : 'Responder Questionário'}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum questionário disponível para esta lição.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Selecione uma lição para ver o questionário.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
