'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
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
import { ChatDropdown } from '@/components/chat';

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

    // Update isOpen when forceOpen changes
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
            <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-4">
                {/* Sidebar with modules */}
                <div className="w-full md:w-80 flex-shrink-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">

                    {/* Sidebar Header */}
                    <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
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
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Conteúdo do Curso</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-32 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                                        onLessonSelect={handleLessonSelect}
                                        isFirstModule={index === 0}
                                        forceOpen={openModules.has(module.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 overflow-y-auto p-4">
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


                            <div>
                                <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="w-full justify-start">
                                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                                        <TabsTrigger value="activities">Atividades</TabsTrigger>
                                        <TabsTrigger value="questionnaire">Questionário</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="content" className="mt-4">
                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                            <h3 className="text-lg font-medium mb-2">
                                                {activeContent?.title || 'Selecione uma lição para ver o conteúdo'}
                                            </h3>

                                            {activeContent && activeContent.type === ContentType.PDF && (
                                                <div className="mt-4">
                                                    <a
                                                        href={activeContent.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        Abrir PDF
                                                    </a>
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
                                                                    target="_blank"
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
                        </div>
                    )}
                </div>

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
