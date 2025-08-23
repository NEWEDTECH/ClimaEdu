'use client';

import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { useTheme } from '@/hooks/useTheme';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';

type CourseContentProps = {
  activeContent: Content | null;
  activeLesson: string | null;
  activeLessonData: Lesson | null;
  activeActivity: Activity | null;
  activeQuestionnaire: Questionnaire | null;
  attemptCount: number;
  hasPassedQuestionnaire: boolean;
  courseId: string;
};

export function CourseContent({
  activeContent,
  activeLesson,
  activeLessonData,
  activeActivity,
  activeQuestionnaire,
  attemptCount,
  hasPassedQuestionnaire,
  courseId
}: CourseContentProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`space-y-8 ${isDarkMode ? 'bg-black' : 'bg-white'} p-6 rounded-lg`}>
      
      {/* Conteúdo Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Conteúdo
          </h2>
        </div>

        {activeContent && activeContent.type === ContentType.SCORM ? (
          <ScormPlayer contentId={activeContent.id} />
        ) : activeLessonData && activeLessonData.description ? (
          <div className={`p-6 rounded-lg shadow border ${
            isDarkMode 
              ? 'bg-[#272727] border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {activeLessonData.title}
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Descrição da lição
                </p>
              </div>
            </div>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div 
                className={`leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                } [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:visited]:text-purple-600 dark:[&_a]:text-blue-400 dark:[&_a:hover]:text-blue-300 dark:[&_a:visited]:text-purple-400`}
                dangerouslySetInnerHTML={{ __html: activeLessonData.description }}
              />
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>Nenhum conteúdo disponível para esta lição.</p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>

      {/* Atividades Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Atividades
          </h2>
        </div>

        {activeLesson ? (
          <div>
            {activeActivity ? (
              <div className="space-y-6">
                {/* Activity Description */}
                <div className="space-y-4">
                  <div>
                    <h5 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Descrição
                    </h5>
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`leading-relaxed whitespace-pre-wrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {activeActivity.description}
                      </p>
                    </div>
                  </div>

                  {/* Activity Instructions */}
                  <div>
                    <h5 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Instruções
                    </h5>
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-blue-900/20 border-blue-800' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className={`leading-relaxed whitespace-pre-wrap ${
                            isDarkMode ? 'text-blue-200' : 'text-blue-800'
                          }`}>
                            {activeActivity.instructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource URL if available */}
                  {activeActivity.resourceUrl && (
                    <div>
                      <h5 className={`text-lg font-medium mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Recursos
                      </h5>
                      <div className={`p-4 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-green-900/20 border-green-800' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium mb-1 ${
                              isDarkMode ? 'text-green-200' : 'text-green-800'
                            }`}>
                              Material de apoio disponível
                            </p>
                            <a
                              href={activeActivity.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 transition-colors ${
                                isDarkMode 
                                  ? 'text-green-400 hover:text-green-300' 
                                  : 'text-green-600 hover:text-green-700'
                              }`}
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

                  {/* Activity Status */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-yellow-900/20 border-yellow-800' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-medium ${
                            isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
                          }`}>
                            Atividade Prática
                          </p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                          }`}>
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
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className={`text-lg font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Nenhuma atividade disponível
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Esta lição não possui atividades práticas.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Selecione uma lição para ver as atividades disponíveis.
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>

      {/* Questionário Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Questionário
          </h2>
        </div>

        {activeLesson ? (
          <div>
            {activeQuestionnaire ? (
              <div className="">
                {/* Questionnaire Info */}
                <div className="space-y-4">
                  <h4 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activeQuestionnaire.title}
                  </h4>

                  <div className="text-sm">
                    <div className={`flex py-2 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Tentativas máximas:
                      </span>
                      <span className={`font-medium ml-2 ml-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activeQuestionnaire.maxAttempts}
                      </span>
                    </div>

                    <div className={`flex py-2 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Tentativas realizadas:
                      </span>
                      <span className={`font-medium ml-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {attemptCount}
                      </span>
                    </div>

                    <div className={`flex py-2 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Nota de aprovação:
                      </span>
                      <span className={`font-medium ml-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activeQuestionnaire.passingScore}%
                      </span>
                    </div>

                    <div className={`flex py-2 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total de perguntas:
                      </span>
                      <span className={`font-medium ml-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activeQuestionnaire.questions.length}
                      </span>
                    </div>

                    <div className="flex py-2">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Status:
                      </span>
                      <span className={`font-medium ml-2 ${
                        hasPassedQuestionnaire
                          ? 'text-green-600 dark:text-green-400'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {hasPassedQuestionnaire ? 'Aprovado' : 'Não aprovado'}
                      </span>
                    </div>
                  </div>
                </div>
  
                {/* Warning if max attempts reached */}
                {attemptCount >= activeQuestionnaire.maxAttempts && !hasPassedQuestionnaire && (
                  <div className={`p-4 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        Você excedeu o número máximo de tentativas para este questionário.
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  <a
                    href={`/student/courses/${courseId}/questionnaire/${activeQuestionnaire.id}`}
                    rel="noopener noreferrer"
                    className={`block w-fit py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                      hasPassedQuestionnaire
                        ? isDarkMode 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : attemptCount >= activeQuestionnaire.maxAttempts
                          ? isDarkMode 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className={`text-lg font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Nenhum questionário disponível
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Esta lição não possui questionário.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Selecione uma lição para ver o questionário.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
