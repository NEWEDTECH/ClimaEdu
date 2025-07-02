'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { VideoPlayer } from '@/components/video';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { Course } from '@/_core/modules/content/core/entities/Course';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { useProfile } from '@/context/zustand/useProfile';
import { CourseSidebar, CourseTabs } from '@/components/courses/student';
import { ChatDropdown } from '@/components/courses/chat';


export default function CoursePage() {
    const params = useParams();
    const { infoUser } = useProfile();
    const courseId = params.id as string

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [activeContent, setActiveContent] = useState<Content | null>(null);
    const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
    const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
    const [attemptCount, setAttemptCount] = useState<number>(0);
    const [hasPassedQuestionnaire, setHasPassedQuestionnaire] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('content');
    const [showingEndAlert, setShowingEndAlert] = useState<boolean>(false);
    const [showNextVideoOverlay, setShowNextVideoOverlay] = useState<boolean>(false);
    const [overlayTimer, setOverlayTimer] = useState<NodeJS.Timeout | null>(null);
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
            // Reset the end alert state for new video
            setShowingEndAlert(false);

            // Fetch content for this lesson
            const lessonRepository = container.get<LessonRepository>(
                Register.content.repository.LessonRepository
            );

            const fullLesson = await lessonRepository.findById(lessonId);

            if (fullLesson && fullLesson.contents.length > 0) {
                const videoContent = fullLesson.contents.find(c => c.type === ContentType.VIDEO);
                if (videoContent) {
                    // Reset the active content to ensure the video reloads
                    setActiveContent(null);

                    // Use setTimeout to ensure the state update happens before setting the new content
                    setTimeout(() => {
                        setActiveContent(videoContent);
                    }, 50);
                } else {
                    // If no video content, use the first content
                    setActiveContent(fullLesson.contents[0]);
                }
            } else {
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

                setCourse(courseData);

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

            <div 
                className="h-[calc(100vh-4rem)] overflow-y-auto p-4 transition-all duration-300"
                style={{
                    marginRight: sidebarMode !== 'hidden' 
                        ? sidebarMode === 'chat' 
                            ? '500px' 
                            : '580px' 
                        : '100px' 
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
                            <h1 className="text-2xl font-bold">{course?.title}</h1>


                            <div className="w-full border-gray-300 pb-4 relative">
                                {activeContent && activeContent.type === ContentType.VIDEO ? (
                                    <>
                                        <VideoPlayer
                                            url={activeContent.url}
                                            autoPlay={true}
                                            showControls={true}
                                            onEnded={handleNextVideo}
                                            handleProgress={({ played, playedSeconds, loadedSeconds }) => {
                                                const totalDuration = loadedSeconds / played;
                                                const remainingSeconds = totalDuration - playedSeconds;

                                                if (remainingSeconds <= 20 && remainingSeconds > 0 && !showingEndAlert && totalDuration > 0) {
                                                    setShowingEndAlert(true);
                                                    setShowNextVideoOverlay(true);

                                                    // Set timer to hide overlay after 10 seconds
                                                    const timer = setTimeout(() => {
                                                        setShowNextVideoOverlay(false);
                                                    }, 10000);

                                                    setOverlayTimer(timer);
                                                }
                                            }}
                                        />

                                        {/* Netflix-style Next Video Overlay */}
                                        {showNextVideoOverlay && (
                                            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Próximo vídeo em breve</p>
                                                        <p className="text-xs text-gray-300">Deseja continuar?</p>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2 mt-3">
                                                    <button
                                                        onClick={() => {
                                                            handleNextVideo();
                                                            setShowNextVideoOverlay(false);
                                                            if (overlayTimer) {
                                                                clearTimeout(overlayTimer);
                                                                setOverlayTimer(null);
                                                            }
                                                        }}
                                                        className="flex-1 bg-white text-black px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        Sim, continuar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowNextVideoOverlay(false);
                                                            if (overlayTimer) {
                                                                clearTimeout(overlayTimer);
                                                                setOverlayTimer(null);
                                                            }
                                                        }}
                                                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                                                    >
                                                        Não
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <p className="text-gray-500">Nenhum conteúdo de vídeo disponível</p>
                                    </div>
                                )}
                            </div>

                            {/* TABS AQUI*/}
                            <CourseTabs
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                activeContent={activeContent}
                                activeLesson={activeLesson}
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
