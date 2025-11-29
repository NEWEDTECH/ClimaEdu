'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { useProfile } from '@/context/zustand/useProfile';
import { CourseSidebar, CourseContent } from '@/components/courses/student';
import { useCourseData } from '@/hooks/content/useCourseData';
import { useCourseNavigation } from '@/hooks/content/useCourseNavigation';
import { useAutoNavigation } from '@/hooks/content/useAutoNavigation';
import { useCallback } from 'react';


export default function CoursePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { infoUser } = useProfile();
    const courseId = params.id as string;
    const initialLessonId = searchParams.get('lesson');

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
        handleLessonSelect: originalHandleLessonSelect,
        handleCompleteLesson,
        handleVideoProgress
    } = useCourseData({
        courseId,
        userId: infoUser.id,
        institutionId: infoUser.currentIdInstitution || '',
        initialLessonId: initialLessonId || undefined
    });

    // Wrap handleLessonSelect to update URL when lesson is selected
    const handleLessonSelect = useCallback(async (lessonId: string) => {
        // Update URL with lesson parameter
        router.push(`/student/courses/${courseId}?lesson=${lessonId}`, { scroll: false });

        // Call original handler
        await originalHandleLessonSelect(lessonId);
    }, [courseId, router, originalHandleLessonSelect]);

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
        startAutoNavigation,
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
        <ProtectedContent>
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
                                {/* CONTEÚDO UNIFICADO */}
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
                                    contentSectionsOrder={activeLessonData?.contentSectionsOrder || []}
                                    onVideoEnded={handleVideoEnded}
                                    handleVideoProgress={handleVideoProgress}
                                    handleNextVideo={handleNextVideo}
                                    handlePreviousVideo={handlePreviousVideo}
                                    handleCompleteLesson={handleCompleteLesson}
                                    canNavigatePrevious={canNavigatePrevious}
                                    canNavigateNext={canNavigateNext}
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

                </div>
            </DashboardLayout>
        </ProtectedContent>
    );
}
