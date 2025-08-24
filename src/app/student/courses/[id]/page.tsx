'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { useProfile } from '@/context/zustand/useProfile';
import { CourseSidebar, CourseContent, ContentRenderer } from '@/components/courses/student';
import { ChatDropdown } from '@/components/courses/chat';


export default function CoursePage() {
    const params = useParams();
    const { infoUser } = useProfile();
    const courseId = params.id as string

    const [modules, setModules] = useState<Module[]>([]);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [activeLessonData, setActiveLessonData] = useState<Lesson | null>(null);
    const [activeContent, setActiveContent] = useState<Content | null>(null);
    const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
    const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
    const [attemptCount, setAttemptCount] = useState<number>(0);
    const [hasPassedQuestionnaire, setHasPassedQuestionnaire] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const [sidebarMode, setSidebarMode] = useState<'hidden' | 'chat' | 'modules'>('hidden');


    // Function to load lesson activity
    const loadLessonActivity = useCallback(async (lessonId: string) => {
        try {
            const activityRepository = container.get<ActivityRepository>(
                Register.content.repository.ActivityRepository
            );

            const activity = await activityRepository.findByLessonId(lessonId);
            setActiveActivity(activity);
        } catch (error) {
            console.error('Error loading lesson activity:', error);
            setActiveActivity(null);
        }
    }, []);

    // Function to load lesson questionnaire
    const loadLessonQuestionnaire = useCallback(async (lessonId: string) => {
        try {
            const questionnaireRepository = container.get<QuestionnaireRepository>(
                Register.content.repository.QuestionnaireRepository
            );

            const questionnaire = await questionnaireRepository.findByLessonId(lessonId);

            setActiveQuestionnaire(questionnaire);

            if (questionnaire && infoUser.id && courseId) {

                const submissionRepository = container.get<QuestionnaireSubmissionRepository>(
                    Register.content.repository.QuestionnaireSubmissionRepository
                );

                const attempts = await submissionRepository.countAttempts(
                    questionnaire.id,
                    infoUser.id
                );

                // Check if student has passed the questionnaire
                const hasPassed = await questionnaireRepository.hasStudentPassed(
                    questionnaire.id,
                    infoUser.id
                );

                setAttemptCount(attempts);
                setHasPassedQuestionnaire(hasPassed);
            } else {
                setAttemptCount(0);
                setHasPassedQuestionnaire(false);
            }
        } catch (error) {
            console.error('Error loading lesson questionnaire:', error);
            setActiveQuestionnaire(null);
            setAttemptCount(0);
            setHasPassedQuestionnaire(false);
        }
    }, [infoUser.id, courseId]);

    // Function to load lesson content
    const loadLessonContent = useCallback(async (lessonId: string) => {
        try {
            // Fetch content for this lesson
            const lessonRepository = container.get<LessonRepository>(
                Register.content.repository.LessonRepository
            );

            const fullLesson = await lessonRepository.findById(lessonId);

            if (fullLesson) {
                // Set the lesson data for the tabs
                setActiveLessonData(fullLesson);

                // A lógica de "conteúdo ativo" não é mais necessária,
                // pois vamos renderizar todos os conteúdos da lição.
                setActiveContent(null); // Manter nulo ou remover o estado
            } else {
                setActiveLessonData(null);
                setActiveContent(null);
            }

            // Load questionnaire for this lesson
            await loadLessonQuestionnaire(lessonId);

            // Load activity for this lesson
            await loadLessonActivity(lessonId);
        } catch (error) {
            console.error('Error loading lesson content:', error);
        }
    }, [loadLessonQuestionnaire, loadLessonActivity]);

    const handleLessonSelect = async (lessonId: string) => {
        setActiveLesson(lessonId);
        await loadLessonContent(lessonId);
    };

    // Function to find and navigate to the next video
    const handleNextVideo = () => {
        if (!activeLesson || modules.length === 0) return;

        // Find current module and lesson
        let currentModuleIndex = -1;
        let currentLessonIndex = -1;

        for (let i = 0; i < modules.length; i++) {
            const currentModuleData = modules[i];
            const lessonIndex = currentModuleData.lessons.findIndex(lesson => lesson.id === activeLesson);

            if (lessonIndex !== -1) {
                currentModuleIndex = i;
                currentLessonIndex = lessonIndex;
                break;
            }
        }

        if (currentModuleIndex === -1 || currentLessonIndex === -1) return;

        const currentModule = modules[currentModuleIndex];

        // Check if there's another lesson in the current module
        if (currentLessonIndex < currentModule.lessons.length - 1) {
            // Go to next lesson in current module
            const nextLesson = currentModule.lessons[currentLessonIndex + 1];
            handleLessonSelect(nextLesson.id);
        } else if (currentModuleIndex < modules.length - 1) {
            // Go to first lesson of next module
            const nextModule = modules[currentModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
                setOpenModules(prev => new Set([...prev, nextModule.id]));
                handleLessonSelect(nextModule.lessons[0].id);
            }
        }
    };

    // Function to find and navigate to the previous video
    const handlePreviousVideo = () => {
        if (!activeLesson || modules.length === 0) return;

        // Find current module and lesson
        let currentModuleIndex = -1;
        let currentLessonIndex = -1;

        for (let i = 0; i < modules.length; i++) {
            const currentModuleData = modules[i];
            const lessonIndex = currentModuleData.lessons.findIndex(lesson => lesson.id === activeLesson);

            if (lessonIndex !== -1) {
                currentModuleIndex = i;
                currentLessonIndex = lessonIndex;
                break;
            }
        }

        if (currentModuleIndex === -1 || currentLessonIndex === -1) return;

        const currentModule = modules[currentModuleIndex];

        // Check if there's a previous lesson in the current module
        if (currentLessonIndex > 0) {
            // Go to previous lesson in current module
            const previousLesson = currentModule.lessons[currentLessonIndex - 1];
            handleLessonSelect(previousLesson.id);
        } else if (currentModuleIndex > 0) {
            // Go to last lesson of previous module
            const previousModule = modules[currentModuleIndex - 1];
            if (previousModule.lessons.length > 0) {
                setOpenModules(prev => new Set([...prev, previousModule.id]));
                const lastLesson = previousModule.lessons[previousModule.lessons.length - 1];
                handleLessonSelect(lastLesson.id);
            }
        }
    };

    // Function to handle lesson completion (placeholder for now)
    const handleCompleteLesson = () => {
        // TODO: Implementar lógica de conclusão da lição
        console.log('Lesson completed:', activeLesson);
    };

    // Function to handle video progress and show next video overlay
    const handleVideoProgress = ({}: { played: number; playedSeconds: number; loadedSeconds: number }) => {
        // Lógica de overlay removida por enquanto para simplificar
    };

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;

            try {
                setIsLoading(true);

                // Fetch course details
                const courseRepository = container.get<CourseRepository>(
                    Register.content.repository.CourseRepository
                );

                const courseData = await courseRepository.findById(courseId);
                if (!courseData) {
                    setError('Course not found');
                    setIsLoading(false);
                    return;
                }

                // Fetch modules for this course
                const moduleRepository = container.get<ModuleRepository>(
                    Register.content.repository.ModuleRepository
                );

                const modulesData = await moduleRepository.listByCourse(courseId);

                // Sort modules by order
                modulesData.sort((a, b) => a.order - b.order);

                // For each module, fetch its lessons
                const modulesWithLessons = await Promise.all(
                    modulesData.map(async (moduleData) => {
                        const lessonRepository = container.get<LessonRepository>(
                            Register.content.repository.LessonRepository
                        );

                        const lessons = await lessonRepository.listByModule(moduleData.id);

                        // Sort lessons by order
                        lessons.sort((a, b) => a.order - b.order);

                        // Create a new module with the lessons
                        return Module.create({
                            id: moduleData.id,
                            courseId: moduleData.courseId,
                            title: moduleData.title,
                            coverImageUrl: moduleData.coverImageUrl || undefined,
                            order: moduleData.order,
                            lessons: lessons
                        });
                    })
                );

                setModules(modulesWithLessons);

                // Set the first lesson as active if available
                if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
                    const firstLesson = modulesWithLessons[0].lessons[0];
                    setActiveLesson(firstLesson.id);

                    // Fetch content for the first lesson
                    await loadLessonContent(firstLesson.id);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching course data:', error);
                setError('Failed to load course data');
                setIsLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, loadLessonContent]);

    return (
        <DashboardLayout>
            {/* New Sidebar Component */}
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
                onSidebarModeChange={setSidebarMode}
            />

            {/* Invisible div for spacing when sidebar is closed */}
            {sidebarMode === 'hidden' && (
                <div 
                    className="fixed top-0 right-0 h-full bg-transparent pointer-events-none z-10"
                    style={{ width: '120px' }}
                />
            )}

            <div
                className="h-[calc(100vh-4rem)] p-4 transition-all duration-300"
                style={{
                    marginRight: sidebarMode !== 'hidden'
                        ? sidebarMode === 'chat'
                            ? '500px'
                            : '500px'
                        : '0px',
                    width: sidebarMode === 'hidden' ? 'calc(100% - 120px)' : 'auto'
                }}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center p-8">{error}</div>
                ) : (
                    <div className="space-y-6">

                        <div className="w-full border-gray-300 pb-4 relative space-y-8">
                            {activeLessonData && activeLessonData.contents.length > 0 ? (
                                activeLessonData.contents.map(content => (
                                    <ContentRenderer
                                        key={content.id}
                                        content={content}
                                        onEnded={handleNextVideo}
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
                                        disabled={!activeLesson || modules.length === 0}
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
                                        disabled={!activeLesson || modules.length === 0}
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
                        />
                    </div>
                )}
            </div>

            {/* Chat Dropdown - Fixed position */}
            {courseId && infoUser.id && (
                <ChatDropdown
                    courseId={courseId}
                    classId={courseId} // Using courseId as classId for now
                    userId={infoUser.id}
                    userName={infoUser.name || 'Usuário'}
                />
            )}
        </DashboardLayout>
    );
}
