'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useProfile } from '@/context/zustand/useProfile';
import { CourseSidebar, CourseContent, ContentRenderer, AutoNavigationModal } from '@/components/courses/student';
import { useCourseData } from '@/hooks/content/useCourseData';
import { useCourseNavigation } from '@/hooks/content/useCourseNavigation';
import { useAutoNavigation } from '@/hooks/content/useAutoNavigation';


export default function CoursePage() {
    const params = useParams();
    const { infoUser } = useProfile();
    const courseId = params.id as string;

    // Use custom hooks for data management and navigation
    const {
        modules,
        activeLesson,
        activeLessonData,
        activeContent,
        activeQuestionnaire,
        activeActivity,
        attemptCount,
        hasPassedQuestionnaire,
        isLoading,
        error,
        openModules,
        lessonAccess,
        setOpenModules,
        handleLessonSelect,
        handleCompleteLesson,
        handleVideoProgress
    } = useCourseData({ 
        courseId, 
        userId: infoUser.id,
        institutionId: infoUser.currentIdInstitution || ''
    });

    const {
        handleNextVideo,
        handlePreviousVideo,
        canNavigatePrevious,
        canNavigateNext
    } = useCourseNavigation({
        modules,
        activeLesson,
        setOpenModules,
        onLessonSelect: handleLessonSelect,
    });

    // Auto-navigation hook for video completion
    const {
        isActive: showAutoNav,
        countdown,
        isNavigating,
        startAutoNavigation,
        cancelAutoNavigation,
    } = useAutoNavigation({
        onNavigate: handleNextVideo,
        countdownSeconds: 5
    });

    // Handle video ended with auto-navigation
    const handleVideoEnded = async () => {
        try {
            const completed = await handleCompleteLesson();
            console.log('🙋‍♂️ Video ended, lesson completion status:', completed);
            if (completed) {
                startAutoNavigation();
            } else {
                console.warn('Failed to complete lesson, auto-navigation cancelled');
            }
        } catch (error) {
            console.error('Error during video end handling:', error);
        }
    };



    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Main Content Column */}
                <div className="flex-1 p-4 transition-all duration-300 overflow-auto scrollbar-thin">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center p-8">{error}</div>
                ) : (
                    <div className="space-y-6">

                        <div className="w-full border-gray-300 pb-4 relative space-y-4">
                            {activeLessonData && activeLessonData.contents.length > 0 ? (
                                activeLessonData.contents.map(content => (
                                    <ContentRenderer
                                        key={content.id}
                                        content={content}
                                        onEnded={handleVideoEnded}
                                        handleProgress={handleVideoProgress}
                                    />
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <p className="text-gray-500">Nenhum conteúdo disponível para esta lição.</p>
                                </div>
                            )}

                            {/* Navigation Buttons - Bottom Right */}
                            <div className="flex justify-end mt-4">
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePreviousVideo}
                                        className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!canNavigatePrevious()}
                                        title="Lição anterior"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Complete Button */}
                                    <button
                                        onClick={handleCompleteLesson}
                                        className="flex items-center cursor-pointer justify-center px-4 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!activeLesson}
                                        title="Concluir lição"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium">Concluir</span>
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={handleNextVideo}
                                        className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!canNavigateNext()}
                                        title="Próxima lição"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CONTEÚDO VERTICAL */}
                        <CourseContent
                            activeContent={activeContent}
                            activeLesson={activeLesson}
                            activeLessonData={activeLessonData}
                            activeActivity={activeActivity}
                            activeQuestionnaire={activeQuestionnaire}
                            attemptCount={attemptCount}
                            hasPassedQuestionnaire={hasPassedQuestionnaire}
                            courseId={courseId}
                            institutionId={infoUser.currentIdInstitution || ''}
                        />
                    </div>
                )}
                </div>

                {/* Sidebar Column */}
                <CourseSidebar
                    modules={modules}
                    activeLesson={activeLesson}
                    onLessonSelect={handleLessonSelect}
                    courseId={courseId}
                    userId={infoUser.id}
                    userName={infoUser.name || 'Usuário'}
                    isLoading={isLoading}
                    error={error}
                    openModules={openModules}
                    setOpenModules={setOpenModules}
                    lessonAccess={lessonAccess}
                />

                {/* Auto-navigation modal */}
                <AutoNavigationModal
                    isOpen={showAutoNav}
                    countdown={countdown}
                    isNavigating={isNavigating}
                    onCancel={cancelAutoNavigation}
                    onProceed={handleNextVideo}
                />
            </div>
        </DashboardLayout>
    );
}
