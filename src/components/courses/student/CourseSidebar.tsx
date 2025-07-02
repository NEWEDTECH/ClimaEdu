'use client';

import { useState, useEffect, useRef } from 'react';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { ChatDropdown } from '@/components/chat';

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
  onSidebarModeChange?: (mode: SidebarMode) => void;
};

type SidebarMode = 'hidden' | 'chat' | 'modules';

const ModuleDropdown = ({
  module,
  activeLesson,
  onLessonSelect,
  isFirstModule,
  forceOpen
}: {
  module: Module;
  activeLesson: string | null;
  onLessonSelect: (lessonId: string) => void;
  isFirstModule: boolean;
  forceOpen?: boolean;
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
          {module.lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => onLessonSelect(lesson.id)}
              className={`flex items-center w-full p-3 text-left text-sm rounded-lg transition-all duration-200 ${activeLesson === lesson.id
                ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]'
                : 'hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-700 dark:text-gray-300'
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${activeLesson === lesson.id
                ? 'bg-white text-blue-500'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium">{lesson.title}</div>
                {activeLesson === lesson.id && (
                  <div className="text-xs text-blue-100 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Em andamento
                  </div>
                )}
              </div>
              {activeLesson === lesson.id && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
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
  setOpenModules,
  onSidebarModeChange
}: CourseSidebarProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('hidden');
  const chatRef = useRef<{ initializeChatRoom: () => void } | null>(null);

  const handleSidebarModeChange = (newMode: SidebarMode) => {
    setSidebarMode(newMode);
    onSidebarModeChange?.(newMode);
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
    <>
      {/* Right Column with Icons */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-3">
        {/* Chat Icon */}
        <button
          onClick={handleChatClick}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            sidebarMode === 'chat'
              ? 'bg-blue-600 text-white transform scale-110'
              : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
          }`}
          aria-label="Toggle chat"
        >
          <svg
            className="w-6 h-6"
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
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            sidebarMode === 'modules'
              ? 'bg-indigo-600 text-white transform scale-110'
              : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
          }`}
          aria-label="Toggle modules"
        >
          <svg
            className="w-6 h-6"
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

      {/* Sidebar Panel */}
      {sidebarMode !== 'hidden' && (
        <div 
          className={`fixed top-20 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 rounded-lg ${
            sidebarMode === 'chat' ? 'w-80' : 'w-96'
          }`}
          style={{ 
            right: '100px', // Posiciona ao lado direito dos ícones (80px de largura + 20px de margem)
            height: 'calc(100vh - 6rem)' // Altura ajustada para não sobrepor o header
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSidebarMode('hidden')}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {sidebarMode === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Chat da Turma</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Converse com seus colegas</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative">
                <ChatDropdown
                  courseId={courseId}
                  classId={courseId}
                  userId={userId}
                  userName={userName}
                  isEmbedded={true}
                />
              </div>
            </div>
          )}

          {sidebarMode === 'modules' && (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Modules Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
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
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Conteúdo do Curso</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modules Content */}
              <div className="flex-1 overflow-y-auto p-4">
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </>
  );
}
