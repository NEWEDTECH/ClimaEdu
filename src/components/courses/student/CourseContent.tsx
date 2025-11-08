'use client';

import React from 'react';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { useTheme } from '@/hooks/useTheme';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { ScormPlayer } from '@/components/scorm/ScormPlayer';
import { ActivityFileUpload } from './ActivityFileUpload';
import { ContentRenderer } from './ContentRenderer';
import { Button } from '@/components/button';
import { useProfile } from '@/context/zustand/useProfile';
import { useState, useEffect } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import type { ActivitySubmissionRepository } from '@/_core/modules/content';
import type { ActivitySubmission } from '@/_core/modules/content';
import { ActivitySubmissionStatus } from '@/_core/modules/content';

type CourseContentProps = {
  activeContent: Content | null;
  activeLesson: string | null;
  activeLessonData: Lesson | null;
  activeActivity: Activity | null;
  activeQuestionnaire: Questionnaire | null;
  attemptCount: number;
  hasPassedQuestionnaire: boolean;
  courseId: string;
  institutionId: string;
  contentSectionsOrder: string[];
  onVideoEnded?: () => void;
  handleVideoProgress?: (progress: { played: number; playedSeconds: number; loadedSeconds: number; contentId?: string }) => void;
  handleNextVideo?: () => void;
  handlePreviousVideo?: () => void;
  handleCompleteLesson?: () => void;
  canNavigatePrevious?: () => boolean;
  canNavigateNext?: () => boolean;
};

export function CourseContent({
  activeContent,
  activeLesson,
  activeLessonData,
  activeActivity,
  activeQuestionnaire,
  attemptCount,
  hasPassedQuestionnaire,
  courseId,
  institutionId,
  contentSectionsOrder,
  onVideoEnded,
  handleVideoProgress,
  handleNextVideo,
  handlePreviousVideo,
  handleCompleteLesson,
  canNavigatePrevious,
  canNavigateNext
}: CourseContentProps) {
  const { isDarkMode } = useTheme();
  const { infoUser } = useProfile();
  const [activitySubmission, setActivitySubmission] = useState<ActivitySubmission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  // Helper function to sort contents
  const getSortedContents = (contents: Content[], sectionsOrder: string[]) => {
    if (!contents || !sectionsOrder) return contents;

    return [...contents].sort((a, b) => {
      const indexA = sectionsOrder.indexOf(a.type.toLowerCase());
      const indexB = sectionsOrder.indexOf(b.type.toLowerCase());

      const orderA = indexA === -1 ? sectionsOrder.length : indexA;
      const orderB = indexB === -1 ? sectionsOrder.length : indexB;

      return orderA - orderB;
    });
  };

  // Check if lesson has video content
  const hasVideoContent = activeLessonData?.contents.some(c => c.type === 'VIDEO') || false;

  // Load activity submission status
  useEffect(() => {
    const loadSubmission = async () => {
      if (!activeActivity || !infoUser.id || !institutionId) {
        setActivitySubmission(null);
        return;
      }

      setLoadingSubmission(true);
      try {
        const submissionRepository = container.get<ActivitySubmissionRepository>(
          Register.content.repository.ActivitySubmissionRepository
        );

        const submissions = await submissionRepository.findByActivityAndStudent(
          activeActivity.id,
          infoUser.id
        );

        if (submissions && submissions.length > 0) {
          setActivitySubmission(submissions[0]);
        } else {
          setActivitySubmission(null);
        }
      } catch (error) {
        console.error('Error loading activity submission:', error);
        setActivitySubmission(null);
      } finally {
        setLoadingSubmission(false);
      }
    };

    loadSubmission();
  }, [activeActivity, infoUser.id, institutionId]);

  // Render function for videos only
  const renderVideo = () => {
    if (!activeLessonData || !activeLessonData.contents) return null;

    const videoContents = activeLessonData.contents.filter(content => content.type === 'VIDEO');

    if (videoContents.length === 0) return null;

    return (
      <>
        {videoContents.map((content) => (
          <div key={content.id}>
            <ContentRenderer
              content={content}
              onEnded={onVideoEnded}
              handleProgress={handleVideoProgress}
            />

            {/* Navigation Buttons - Only after video content */}
            {hasVideoContent && handleNextVideo && handlePreviousVideo && handleCompleteLesson && canNavigatePrevious && canNavigateNext && (
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                  {/* Previous Button */}
                  <Button
                    onClick={handlePreviousVideo}
                    className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canNavigatePrevious()}
                    title="Lição anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>

                  {/* Complete Button */}
                  <Button
                    onClick={handleCompleteLesson}
                    className="flex items-center cursor-pointer justify-center px-4 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!activeLesson}
                    title="Concluir lição"
                  >
                    <span className="text-sm font-medium">Concluir</span>
                  </Button>

                  {/* Next Button */}
                  <Button
                    onClick={handleNextVideo}
                    className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canNavigateNext()}
                    title="Próxima lição"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mt-6`}></div>
          </div>
        ))}
      </>
    );
  };

  // Render function for PDFs only
  const renderPDF = () => {
    if (!activeLessonData || !activeLessonData.contents) return null;

    const pdfContents = activeLessonData.contents.filter(content => content.type === 'PDF');

    if (pdfContents.length === 0) return null;

    return (
      <>
        {pdfContents.map((content) => (
          <div key={content.id}>
            <ContentRenderer
              content={content}
              onEnded={onVideoEnded}
              handleProgress={handleVideoProgress}
            />
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mt-6`}></div>
          </div>
        ))}
      </>
    );
  };

  // Render function for SCORM only
  const renderScorm = () => {
    if (!activeLessonData || !activeLessonData.contents) return null;

    const scormContents = activeLessonData.contents.filter(content => content.type === 'SCORM');

    if (scormContents.length === 0) return null;

    return (
      <>
        {scormContents.map((content) => (
          <div key={content.id}>
            {/* Para SCORM, o ID está armazenado na URL do Content */}
            <ScormPlayer contentId={content.url} />
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mt-6`}></div>
          </div>
        ))}
      </>
    );
  };

  // Render function for support materials
  const renderSupportMaterial = () => {
    if (!activeLessonData || !activeLessonData.contents) return null;

    const supportMaterials = getSortedContents(
      activeLessonData.contents.filter(c => c.type === 'SUPPORT_MATERIAL'),
      activeLessonData.contentSectionsOrder
    );

    if (supportMaterials.length === 0) return null;

    return (
      <>
        <section key="supportmaterial" className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📂</span>
              Materiais de Apoio
            </h3>
            <div className="space-y-3">
              {supportMaterials.map(material => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">📄</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {material.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Material complementar
                      </p>
                    </div>
                  </div>
                  <a
                    href={material.url.split('#storagePath=')[0]}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mt-6`}></div>
      </>
    );
  };

  // Render functions for each section type
  const renderDescription = () => {
    // Só renderiza se tiver descrição
    if (!activeLessonData || !activeLessonData.description) return null;

    return (
        (activeLessonData.description && (
        <>
          <section key="description" className="space-y-4">
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

            <div className={`p-6 rounded-lg shadow border ${isDarkMode
                ? 'bg-[#272727] border-gray-700'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {activeLessonData.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Descrição da lição
                  </p>
                </div>
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div
                  className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    } [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:visited]:text-purple-600 dark:[&_a]:text-blue-400 dark:[&_a:hover]:text-blue-300 dark:[&_a:visited]:text-purple-400`}
                  dangerouslySetInnerHTML={{ __html: activeLessonData.description }}
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </>
        ))
    );
  };

  const renderActivity = () => {
    // Só renderiza se tiver atividade
    if (!activeActivity) return null;

    return (
      <>
        {/* Atividades Section */}
        <section key="activity" className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold dark:text-white text-gray-800">
              Atividades
            </h2>
          </div>

          {activeLesson ? (
            <div>
              {activeActivity ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Descrição
                      </h5>
                      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {activeActivity.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Instruções
                      </h5>
                      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className={`leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                              {activeActivity.instructions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeActivity.resourceUrl && (
                      <div>
                        <h5 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Recursos
                        </h5>
                        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium mb-1 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                                Material de apoio disponível
                              </p>
                              <a
                                href={activeActivity.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 transition-colors ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
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

                    {!loadingSubmission && activitySubmission && (
                      <div className={`p-4 rounded-lg border-2 ${activitySubmission.status === ActivitySubmissionStatus.APPROVED
                          ? isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                          : activitySubmission.status === ActivitySubmissionStatus.REJECTED
                            ? isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
                            : isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'
                        }`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {activitySubmission.status === ActivitySubmissionStatus.APPROVED ? (
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : activitySubmission.status === ActivitySubmissionStatus.REJECTED ? (
                                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className={`font-semibold text-lg ${activitySubmission.status === ActivitySubmissionStatus.APPROVED
                                    ? isDarkMode ? 'text-green-200' : 'text-green-800'
                                    : activitySubmission.status === ActivitySubmissionStatus.REJECTED
                                      ? isDarkMode ? 'text-red-200' : 'text-red-800'
                                      : isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
                                  }`}>
                                  Status: {
                                    activitySubmission.status === ActivitySubmissionStatus.APPROVED
                                      ? '✅ Aprovada'
                                      : activitySubmission.status === ActivitySubmissionStatus.REJECTED
                                        ? '❌ Reprovada'
                                        : '⏳ Aguardando Avaliação'
                                  }
                                </p>
                                <p className={`text-sm ${activitySubmission.status === ActivitySubmissionStatus.APPROVED
                                    ? isDarkMode ? 'text-green-300' : 'text-green-700'
                                    : activitySubmission.status === ActivitySubmissionStatus.REJECTED
                                      ? isDarkMode ? 'text-red-300' : 'text-red-700'
                                      : isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                                  }`}>
                                  {activitySubmission.reviewedAt
                                    ? `Avaliada em ${new Date(activitySubmission.reviewedAt).toLocaleString('pt-BR')}`
                                    : `Enviada em ${new Date(activitySubmission.submittedAt).toLocaleString('pt-BR')}`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${activitySubmission.status === ActivitySubmissionStatus.APPROVED
                                  ? 'bg-green-500'
                                  : activitySubmission.status === ActivitySubmissionStatus.REJECTED
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500 animate-pulse'
                                }`}></div>
                            </div>
                          </div>

                          {activitySubmission.feedback && (
                            <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-start gap-2 mb-2">
                                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <div className="flex-1">
                                  <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Feedback do Professor:
                                  </p>
                                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {activitySubmission.feedback}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {loadingSubmission && (
                      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Carregando status da atividade...
                          </p>
                        </div>
                      </div>
                    )}

                    {!loadingSubmission && !activitySubmission && (
                      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                              Atividade Prática
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                              Envie seus arquivos abaixo para que o professor possa avaliar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeActivity && activeLesson && (
                      <div>
                        <h5 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Envio de Arquivos
                        </h5>
                        <ActivityFileUpload
                          activityId={activeActivity.id}
                          studentId={infoUser.id}
                          institutionId={institutionId}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma atividade disponível
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
      </>
    );
  };

  const renderQuestionnaire = () => {
    // Só renderiza se tiver questionário
    if (!activeQuestionnaire) return null;

    return (
      <>
        {/* Questionário Section */}
        <section key="questionnaire" className="space-y-4">
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
                  <div className="space-y-4">
                    <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activeQuestionnaire.title}
                    </h4>

                    <div className="text-sm">
                      <div className={`flex py-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Tentativas máximas:
                        </span>
                        <span className={`font-medium ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activeQuestionnaire.maxAttempts}
                        </span>
                      </div>

                      <div className={`flex py-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Tentativas realizadas:
                        </span>
                        <span className={`font-medium ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {attemptCount}
                        </span>
                      </div>

                      <div className={`flex py-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Nota de aprovação:
                        </span>
                        <span className={`font-medium ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activeQuestionnaire.passingScore}%
                        </span>
                      </div>

                      <div className={`flex py-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Total de perguntas:
                        </span>
                        <span className={`font-medium ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activeQuestionnaire.questions.length}
                        </span>
                      </div>

                      <div className="flex py-2">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Status:
                        </span>
                        <span className={`font-medium ml-2 ${hasPassedQuestionnaire
                            ? 'text-green-600 dark:text-green-400'
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          {hasPassedQuestionnaire ? 'Aprovado' : 'Não aprovado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {attemptCount >= activeQuestionnaire.maxAttempts && !hasPassedQuestionnaire && (
                    <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                          Você excedeu o número máximo de tentativas para este questionário.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <a
                      href={`/student/courses/${courseId}/questionnaire/${activeQuestionnaire.id}`}
                      rel="noopener noreferrer"
                      className={`block w-fit py-3 px-4 rounded-lg font-medium transition-colors text-center ${hasPassedQuestionnaire
                          ? isDarkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : attemptCount >= activeQuestionnaire.maxAttempts
                            ? isDarkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum questionário disponível
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
      </>
    );
  };

  // Map section types to render functions
  const sectionMap: Record<string, () => React.ReactElement | null> = {
    video: renderVideo,
    pdf: renderPDF,
    scorm: renderScorm,
    supportmaterial: renderSupportMaterial,
    description: renderDescription,
    activity: renderActivity,
    questionnaire: renderQuestionnaire
  };

  // Render sections based on contentSectionsOrder
  const renderSections = () => {
    if (!contentSectionsOrder || contentSectionsOrder.length === 0) {
      // Default order if no order is specified
      return (
        <>
          {renderVideo()}
          {renderPDF()}
          {renderScorm()}
          {renderSupportMaterial()}
          {renderDescription()}
          {renderActivity()}
          {renderQuestionnaire()}
        </>
      );
    }

    return contentSectionsOrder.map((sectionType, index) => {
      const type = sectionType.toLowerCase();
      const renderFunction = sectionMap[type];
      console.log(type)
      return renderFunction ? <React.Fragment key={`section-${type}-${index}`}>{renderFunction()}</React.Fragment> : null;
    });
  };

  return (
    <div className="space-y-8 dark:bg-black bg-white rounded-lg">
      {renderSections()}
    </div>
  );
}
