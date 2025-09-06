import { useState, useEffect, useCallback, useRef } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { StartLessonProgressUseCase } from '@/_core/modules/content/core/use-cases/start-lesson-progress/start-lesson-progress.use-case';
import { CompleteLessonProgressUseCase } from '@/_core/modules/content/core/use-cases/complete-lesson-progress/complete-lesson-progress.use-case';
import { UpdateContentProgressUseCase } from '@/_core/modules/content/core/use-cases/update-content-progress/update-content-progress.use-case';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';

interface UseCourseDataProps {
  courseId: string;
  userId?: string;
  institutionId?: string;
}

export const useCourseData = ({ courseId, userId, institutionId }: UseCourseDataProps) => {
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
  const [initialLessonLoaded, setInitialLessonLoaded] = useState<boolean>(false);
  
  // Refs for throttling progress updates
  const progressUpdateTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  const loadLessonQuestionnaire = useCallback(async (lessonId: string) => {
    try {
      const questionnaireRepository = container.get<QuestionnaireRepository>(
        Register.content.repository.QuestionnaireRepository
      );

      const questionnaire = await questionnaireRepository.findByLessonId(lessonId);
      setActiveQuestionnaire(questionnaire);

      if (questionnaire && userId && courseId) {
        const submissionRepository = container.get<QuestionnaireSubmissionRepository>(
          Register.content.repository.QuestionnaireSubmissionRepository
        );

        const attempts = await submissionRepository.countAttempts(
          questionnaire.id,
          userId
        );

        const hasPassed = await questionnaireRepository.hasStudentPassed(
          questionnaire.id,
          userId
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
  }, [userId, courseId]);

  const startLessonProgress = useCallback(async (lessonId: string) => {
    if (!userId || !institutionId) {
      console.warn('Cannot start lesson progress: missing userId or institutionId');
      return;
    }

    try {
      const startLessonUseCase = container.get<StartLessonProgressUseCase>(
        Register.content.useCase.StartLessonProgressUseCase
      );

      await startLessonUseCase.execute({
        userId,
        lessonId,
        institutionId
      });
    } catch (error) {
      console.error('Error starting lesson progress:', error);
    }
  }, [userId, institutionId]);

  const loadLessonContent = useCallback(async (lessonId: string) => {
    try {
      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      );

      const fullLesson = await lessonRepository.findById(lessonId);

      if (fullLesson) {
        setActiveLessonData(fullLesson);
        setActiveContent(null); // Keep null or remove this state
      } else {
        setActiveLessonData(null);
        setActiveContent(null);
      }

      // Load questionnaire and activity for this lesson
      await Promise.all([
        loadLessonQuestionnaire(lessonId),
        loadLessonActivity(lessonId)
      ]);

      // Auto-start lesson progress after loading content
      await startLessonProgress(lessonId);
    } catch (error) {
      console.error('Error loading lesson content:', error);
    }
  }, [loadLessonQuestionnaire, loadLessonActivity, startLessonProgress]);

  const handleLessonSelect = useCallback(async (lessonId: string) => {
    setActiveLesson(lessonId);
    await loadLessonContent(lessonId);
  }, [loadLessonContent]);

  const handleCompleteLesson = useCallback(async () => {
    if (!activeLesson || !userId) {
      console.warn('Cannot complete lesson: missing activeLesson or userId');
      return;
    }

    // Create content types map from current lesson data
    let contentTypesMap: Map<string, import('@/_core/modules/content/core/entities/ContentType').ContentType> | undefined;
    if (activeLessonData?.contents) {
      contentTypesMap = new Map();
      activeLessonData.contents.forEach(content => {
        contentTypesMap!.set(content.id, content.type);
      });
    }

    try {
      const completeLessonUseCase = container.get<CompleteLessonProgressUseCase>(
        Register.content.useCase.CompleteLessonProgressUseCase
      );

      const result = await completeLessonUseCase.execute({
        userId,
        lessonId: activeLesson,
        contentTypesMap
      });

      console.log('Lesson completed successfully:', result);
    } catch (error) {
      console.error('Error completing lesson:', error);
      // Lesson might not be started yet, try to start it first
      if (error instanceof Error && error.message.includes('not found')) {
        await startLessonProgress(activeLesson);
        // Retry completion after starting
        try {
          const completeLessonUseCase = container.get<CompleteLessonProgressUseCase>(
            Register.content.useCase.CompleteLessonProgressUseCase
          );
          
          const result = await completeLessonUseCase.execute({
            userId,
            lessonId: activeLesson,
            contentTypesMap
          });
          
          console.log('Lesson completed successfully after starting:', result);
        } catch (retryError) {
          console.error('Error completing lesson after starting:', retryError);
        }
      }
    }
  }, [activeLesson, userId, activeLessonData, startLessonProgress]);

  const updateContentProgress = useCallback(async (
    contentId: string, 
    progressPercentage: number, 
    timeSpent?: number, 
    lastPosition?: number
  ) => {
    if (!activeLesson || !userId) {
      console.warn('Cannot update content progress: missing activeLesson or userId');
      return;
    }

    try {
      const updateContentUseCase = container.get<UpdateContentProgressUseCase>(
        Register.content.useCase.UpdateContentProgressUseCase
      );

      await updateContentUseCase.execute({
        userId,
        lessonId: activeLesson,
        contentId,
        progressPercentage,
        timeSpent,
        lastPosition
      });

      console.log(`Content progress updated: ${contentId} - ${progressPercentage}%`);
    } catch (error) {
      console.error('Error updating content progress:', error);
    }
  }, [activeLesson, userId]);

  const handleVideoProgress = useCallback((data: { 
    played: number; 
    playedSeconds: number; 
    loadedSeconds: number;
    contentId?: string;
  }) => {
    if (!data.contentId) {
      console.warn('Content ID not provided for progress tracking');
      return;
    }

    const progressPercentage = Math.round(data.played * 100);
    const lastPosition = data.playedSeconds;
    
    // Throttle progress updates to avoid excessive API calls
    const timerId = progressUpdateTimers.current.get(data.contentId);
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      updateContentProgress(
        data.contentId!,
        progressPercentage,
        undefined, // timeSpent will be calculated by the use case
        lastPosition
      );
      progressUpdateTimers.current.delete(data.contentId!);
    }, 5000); // Throttle to 5 seconds

    progressUpdateTimers.current.set(data.contentId, newTimerId);

    // Immediately save if video ended (100% progress)
    if (progressPercentage >= 100) {
      clearTimeout(newTimerId);
      progressUpdateTimers.current.delete(data.contentId);
      updateContentProgress(
        data.contentId,
        100,
        undefined,
        lastPosition
      );
    }
  }, [updateContentProgress]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);
        setInitialLessonLoaded(false); // Reset flag when fetching new course

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
        modulesData.sort((a, b) => a.order - b.order);

        // For each module, fetch its lessons
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (moduleData) => {
            const lessonRepository = container.get<LessonRepository>(
              Register.content.repository.LessonRepository
            );

            const lessons = await lessonRepository.listByModule(moduleData.id);
            lessons.sort((a, b) => a.order - b.order);

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

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data');
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Effect to handle initial lesson selection after modules are loaded
  useEffect(() => {
    if (modules.length > 0 && modules[0].lessons.length > 0 && !activeLesson && !initialLessonLoaded) {
      const firstLesson = modules[0].lessons[0];
      setInitialLessonLoaded(true);
      handleLessonSelect(firstLesson.id);
    }
  }, [modules, activeLesson, handleLessonSelect, initialLessonLoaded]);

  return {
    // State
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
    
    // Actions
    setOpenModules,
    handleLessonSelect,
    handleCompleteLesson,
    handleVideoProgress,
    updateContentProgress,
    
    // Loading functions (exposed for potential external use)
    loadLessonContent,
    loadLessonQuestionnaire,
    loadLessonActivity
  };
};