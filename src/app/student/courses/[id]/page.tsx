'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedContent } from '@/components/auth';
import { DashboardLayout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { Course } from '@/_core/modules/content/core/entities/Course';

// Module dropdown component
const ModuleDropdown = ({
    module,
    activeLesson,
    onLessonSelect,
    isFirstModule
}: {
    module: Module;
    activeLesson: string | null;
    onLessonSelect: (lessonId: string) => void;
    isFirstModule: boolean;
}) => {

    const [isOpen, setIsOpen] = useState<boolean>(isFirstModule);

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-3 text-left bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <span className="font-medium">{module.title}</span>
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="mt-1 ml-4 space-y-1">
                    {module.lessons.map((lesson) => (
                        <button
                            key={lesson.id}
                            onClick={() => onLessonSelect(lesson.id)}
                            className={`block w-full p-2 text-left text-sm rounded-md ${activeLesson === lesson.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {lesson.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Video player component
const VideoPlayer = ({ url }: { url: string }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error("Video error:", e);
        setError("Erro ao carregar o vídeo. Verifique a URL ou o formato.");
        setIsLoading(false);
    };
    
    const handleVideoLoaded = () => {
        console.log("Video loaded successfully");
        setIsLoading(false);
    };
    
    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
        
        // Force reload the video
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch((err: Error) => {
                console.error("Error playing video:", err);
            });
        }
    };
    
    // Get file extension from URL
    const getFileExtension = (url: string) => {
        const urlParts = url.split('?')[0]; // Remove query parameters
        const extension = urlParts.split('.').pop()?.toLowerCase();
        return extension || '';
    };
    
    // Get MIME type based on file extension
    const getMimeType = (extension: string) => {
        switch (extension) {
            case 'mp4':
                return 'video/mp4';
            case 'webm':
                return 'video/webm';
            case 'ogg':
                return 'video/ogg';
            case 'mov':
                return 'video/quicktime';
            case 'm3u8':
                return 'application/x-mpegURL';
            case 'mpd':
                return 'application/dash+xml';
            default:
                return 'video/mp4'; // Default to mp4
        }
    };
    
    // Log the URL for debugging
    console.log("Video URL:", url);
    const extension = getFileExtension(url);
    const mimeType = getMimeType(extension);
    console.log("Video type:", mimeType);
    
    return (
        <div className="w-1/2 h-[400px] mx-auto bg-black rounded-lg overflow-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            )}
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
                    <div className="text-white text-center p-4">
                        <p className="mb-2">{error}</p>
                        <p className="text-sm opacity-75 mb-4">URL: {url}</p>
                        <button 
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}
            
            <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full"
                controlsList="nodownload"
                onError={handleVideoError}
                onLoadedData={handleVideoLoaded}
                onCanPlay={handleVideoLoaded}
                playsInline
                preload="auto"
                crossOrigin="anonymous"
            >
                <source src={url} type={mimeType} />
                {/* Fallback for different formats */}
                {extension !== 'mp4' && (
                    <source src={url.replace(`.${extension}`, '.mp4')} type="video/mp4" />
                )}
                {extension !== 'webm' && (
                    <source src={url.replace(`.${extension}`, '.webm')} type="video/webm" />
                )}
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default function CoursePage() {
    const params = useParams();
    const courseId = typeof params?.id === 'string' ? params.id : '';

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [activeContent, setActiveContent] = useState<Content | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('content');

    // Function to load lesson content
    const loadLessonContent = async (lessonId: string) => {
        try {

            // Otherwise, fetch content for this lesson
            const lessonRepository = container.get<LessonRepository>(
                Register.content.repository.LessonRepository
            );

            const fullLesson = await lessonRepository.findById(lessonId);

            if (fullLesson && fullLesson.contents.length > 0) {
                const videoContent = fullLesson.contents.find(c => c.type === ContentType.VIDEO);
                if (videoContent) {
                    setActiveContent(videoContent);
                } else {
                    // If no video content, use the first content
                    setActiveContent(fullLesson.contents[0]);
                }
            } else {
                setActiveContent(null);
            }
        } catch (error) {
            console.error('Error loading lesson content:', error);
        }
    };

    const handleLessonSelect = async (lessonId: string) => {
        setActiveLesson(lessonId);
        await loadLessonContent(lessonId);
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
                    modulesData.map(async (module) => {
                        const lessonRepository = container.get<LessonRepository>(
                            Register.content.repository.LessonRepository
                        );

                        const lessons = await lessonRepository.listByModule(module.id);

                        // Sort lessons by order
                        lessons.sort((a, b) => a.order - b.order);

                        // Create a new module with the lessons
                        return Module.create({
                            id: module.id,
                            courseId: module.courseId,
                            title: module.title,
                            coverImageUrl: module.coverImageUrl || undefined,
                            order: module.order,
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
    }, [courseId]);

    return (
        <ProtectedContent>
            <DashboardLayout>
                <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-4">
                    {/* Sidebar with modules */}
                    <div className="w-full md:w-64 flex-shrink-0 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-r border-gray-300">

                        <h2 className="text-xl font-bold mb-4">Módulos</h2>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center">{error}</div>
                        ) : (
                            <div className="space-y-2">
                                {modules.map((module, index) => (
                                    <ModuleDropdown
                                        key={module.id}
                                        module={module}
                                        activeLesson={activeLesson}
                                        onLessonSelect={handleLessonSelect}
                                        isFirstModule={index === 0}
                                    />
                                ))}
                            </div>
                        )}
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

                                {/* Video player */}
                                <div className="w-full border-gray-300 pb-4">
                                    {activeContent && activeContent.type === ContentType.VIDEO ? (
                                        <>
                                            <VideoPlayer url={activeContent.url} />
                                            
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
                                                        {/* Activity content would go here */}
                                                        <p className="text-gray-500">Nenhuma atividade disponível para esta lição.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">Selecione uma lição para ver as atividades.</p>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="questionnaire" className="mt-4">
                                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                                <h3 className="text-lg font-medium mb-4">Questionário</h3>

                                                {activeLesson ? (
                                                    <div>
                                                        {/* Questionnaire content would go here */}
                                                        <p className="text-gray-500">Nenhum questionário disponível para esta lição.</p>
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
            </DashboardLayout>
        </ProtectedContent>
    );
}
