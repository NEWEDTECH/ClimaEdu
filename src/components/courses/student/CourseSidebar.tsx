'use client';

import { useState, useEffect } from 'react';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { ChatDropdown } from '@/components/courses/chat';
import { HeaderSideBar } from '@/components/courses/header'

type CourseSidebarProps = {
  modules: Module[];
  activeLesson: string | null;
  onLessonSelect: (lessonId: string) => void;
  courseId: string;
  userId: string;
  userName: string;
  isLoading: boolean;
  error: string | null;
  openModules: Set<string>;
  setOpenModules: (modules: Set<string>) => void;
  lessonAccess?: Map<string, {
    canAccess: boolean;
    hasStarted: boolean;
    isCompleted: boolean;
    reason?: string;
    isSkippable?: boolean;
  }>;
};

type SidebarMode = 'hidden' | 'chat' | 'modules';

const ModuleDropdown = ({
  module,
  activeLesson,
  onLessonSelect,
  isFirstModule,
  forceOpen,
  lessonAccess
}: {
  module: Module;
  activeLesson: string | null;
  onLessonSelect: (lessonId: string) => void;
  isFirstModule: boolean;
  forceOpen?: boolean;
  lessonAccess?: Map<string, {
    canAccess: boolean;
    hasStarted: boolean;
    isCompleted: boolean;
    reason?: string;
    isSkippable?: boolean;
  }>;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(isFirstModule);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 dark:border-gray-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <span className="font-semibold w-auto text-gray-800 dark:text-gray-200">{module.title}</span>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {module.lessons.length} {module.lessons.length === 1 ? 'lição' : 'lições'}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-blue-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-200 dark:border-gray-600 pl-4">
          {module.lessons.map((lesson, index) => {
            const accessInfo = lessonAccess?.get(lesson.id);
            const canAccess = accessInfo?.canAccess ?? true;
            const isCompleted = accessInfo?.isCompleted ?? false;
            // const hasStarted = accessInfo?.hasStarted ?? false;
            // const isSkippable = accessInfo?.isSkippable ?? false;
            
            const handleLessonClick = () => {
              if (canAccess) {
                onLessonSelect(lesson.id);
              }
            };

            return (
              <button
                key={lesson.id}
                onClick={handleLessonClick}
                disabled={!canAccess}
                className={`flex items-center w-full p-3 text-left text-sm rounded-lg transition-all duration-200 ${
                  !canAccess
                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : activeLesson === lesson.id
                    ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]'
                    : 'hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                  !canAccess
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : activeLesson === lesson.id
                    ? 'bg-white text-blue-500'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{lesson.title}</div>
                  {isCompleted && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Concluída
                    </div>
                  )}
                  {!isCompleted && activeLesson === lesson.id && (
                    <div className="text-xs text-blue-100 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Em andamento
                    </div>
                  )}
                </div>
                {!canAccess ? (
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ) : activeLesson === lesson.id ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function CourseSidebar({
  modules,
  activeLesson,
  onLessonSelect,
  courseId,
  userId,
  userName,
  isLoading,
  error,
  openModules,
  lessonAccess
}: CourseSidebarProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('hidden');

  const handleSidebarModeChange = (newMode: SidebarMode) => {
    setSidebarMode(newMode);
  };

  const handleChatClick = () => {
    if (sidebarMode === 'chat') {
      handleSidebarModeChange('hidden');
    } else {
      handleSidebarModeChange('chat');
    }
  };

  const handleModulesClick = () => {
    if (sidebarMode === 'modules') {
      handleSidebarModeChange('hidden');
    } else {
      handleSidebarModeChange('modules');
    }
  };

  return (
    <div 
      className={`flex transition-all duration-300 ${
        sidebarMode === 'hidden' 
          ? 'w-20' 
          : sidebarMode === 'chat' 
            ? 'w-96' 
            : 'w-96'
      }`}
    >
      {/* Sidebar Panel - Left side */}
      {sidebarMode !== 'hidden' && (
        <div className="flex-1 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 rounded-lg overflow-hidden">
          {sidebarMode === 'chat' && (
            <>
              <HeaderSideBar
                title='Chat da Turma'
                subTitle='Converse com seus colegas'
                onClose={() => setSidebarMode('hidden')}
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                }
              />
              <div className="flex-1 overflow-hidden">
                <ChatDropdown
                  courseId={courseId}
                  classId={courseId}
                  userId={userId}
                  userName={userName}
                  isEmbedded={true}
                />
              </div>
            </>
          )}

          {sidebarMode === 'modules' && (
            <div className="h-full flex flex-col overflow-hidden">
              <HeaderSideBar
                title='Conteúdo do Curso'
                subTitle={`${modules.length} ${modules.length === 1 ? 'módulo' : 'módulos'}`}
                onClose={() => setSidebarMode('hidden')}
                icon={
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                }
              />

              {/* Modules Content */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-32 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Carregando módulos...</p>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modules.map((module, index) => (
                      <ModuleDropdown
                        key={module.id}
                        module={module}
                        activeLesson={activeLesson}
                        onLessonSelect={onLessonSelect}
                        isFirstModule={index === 0}
                        forceOpen={openModules.has(module.id)}
                        lessonAccess={lessonAccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Icons - Right side */}
      <div className="flex flex-col gap-3 p-4 border-l border-gray-200 dark:border-gray-700 items-center">
        {/* Chat Icon */}
        <button
          onClick={handleChatClick}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${sidebarMode === 'chat'
            ? 'bg-blue-600 text-white transform scale-110'
            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          aria-label="Toggle chat"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        {/* Modules Icon */}
        <button
          onClick={handleModulesClick}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${sidebarMode === 'modules'
            ? 'bg-indigo-600 text-white transform scale-110'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
            }`}
          aria-label="Toggle modules"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
