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
import { CanAccessLessonUseCase } from '@/_core/modules/content/core/use-cases/can-access-lesson/can-access-lesson.use-case';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';
import { useCourseProgress } from '@/context/zustand/useCourseProgress';

interface UseCourseDataProps {
  courseId: string;
  userId?: string;
  institutionId?: string;
  initialLessonId?: string;
}

export const useCourseData = ({ courseId, userId, institutionId, initialLessonId }: UseCourseDataProps) => {
  const { setLastAccessedLesson, getLastAccessedLesson } = useCourseProgress();
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
  const currentProgressData = useRef<Map<string, { progressPercentage: number; lastPosition: number }>>(new Map());
  
  // Lesson accessibility tracking
  const [lessonAccess, setLessonAccess] = useState<Map<string, {
    canAccess: boolean;
    hasStarted: boolean;
    isCompleted: boolean;
    reason?: string;
    isSkippable?: boolean;
  }>>(new Map());

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

  const saveCurrentVideoProgress = useCallback(() => {
    // Force save any pending progress updates before navigation
    const timers = progressUpdateTimers.current;
    const progressData = currentProgressData.current;
    
    timers.forEach((timerId, contentId) => {
      clearTimeout(timerId);
      
      // Get the current progress data and save it immediately
      const data = progressData.get(contentId);
      if (data) {
        updateContentProgress(
          contentId,
          data.progressPercentage,
          undefined,
          data.lastPosition
        );
        progressData.delete(contentId);
      }
      
      timers.delete(contentId);
    });
  }, [updateContentProgress]);

  const checkLessonAccess = useCallback(async (lessonId: string): Promise<boolean> => {
    if (!userId || !institutionId || !courseId) {
      console.warn('Cannot check lesson access: missing required parameters');
      return false;
    }

    try {
      const canAccessUseCase = container.get<CanAccessLessonUseCase>(
        Register.content.useCase.CanAccessLessonUseCase
      );

      const result = await canAccessUseCase.execute({
        userId,
        lessonId,
        institutionId,
        courseId
      });

      // Update lesson access map
      setLessonAccess(prev => {
        const newMap = new Map(prev);
        newMap.set(lessonId, {
          canAccess: result.canAccess,
          hasStarted: result.hasStarted,
          isCompleted: result.isCompleted,
          reason: result.reason,
          isSkippable: result.isSkippable
        });
        return newMap;
      });

      return result.canAccess;
    } catch (error) {
      console.error('Error checking lesson access:', error);
      return false;
    }
  }, [userId, institutionId, courseId]);

  // Check access for all lessons when modules are loaded
  const checkAllLessonsAccess = useCallback(async () => {
    if (!userId || !institutionId || !courseId || modules.length === 0) return;

    console.log('Checking access for all lessons...');
    
    const accessPromises = modules.flatMap(module => 
      module.lessons.map(lesson => checkLessonAccess(lesson.id))
    );

    await Promise.all(accessPromises);
    console.log('All lesson access checks completed');
  }, [modules, userId, institutionId, courseId, checkLessonAccess]);

  const handleCompleteLesson = useCallback(async () => {
    if (!activeLesson || !userId) {
      console.warn('Cannot complete lesson: missing activeLesson or userId');
      return false;
    }

    // Check if lesson is already completed to avoid duplicate completion
    const currentAccess = lessonAccess.get(activeLesson);
    if (currentAccess?.isCompleted) {
      console.log('Lesson already completed, skipping completion');
      return true;
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

      console.log('🙋‍♂️ Attempting to complete lesson:', activeLesson);
      const result = await completeLessonUseCase.execute({
        userId,
        lessonId: activeLesson,
        contentTypesMap
      });

      console.log('Lesson completed successfully:', result);
      
      // Force invalidate cache for current lesson to reflect completion immediately
      setLessonAccess(prev => {
        const newMap = new Map(prev);
        const currentAccess = newMap.get(activeLesson);
        if (currentAccess) {
          newMap.set(activeLesson, {
            ...currentAccess,
            isCompleted: true
          });
        }
        return newMap;
      });
      
      // Synchronously revalidate lesson access after successful completion
      await checkAllLessonsAccess();
      
      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      // Lesson might not be started yet, try to start it first
      if (error instanceof Error && error.message.includes('not found')) {
        try {
          await startLessonProgress(activeLesson);
          
          // Retry completion after starting
          const completeLessonUseCase = container.get<CompleteLessonProgressUseCase>(
            Register.content.useCase.CompleteLessonProgressUseCase
          );
          
          const result = await completeLessonUseCase.execute({
            userId,
            lessonId: activeLesson,
            contentTypesMap
          });
          
          console.log('Lesson completed successfully after starting:', result);
          
          // Force invalidate cache for current lesson to reflect completion immediately
          setLessonAccess(prev => {
            const newMap = new Map(prev);
            const currentAccess = newMap.get(activeLesson);
            if (currentAccess) {
              newMap.set(activeLesson, {
                ...currentAccess,
                isCompleted: true
              });
            }
            return newMap;
          });
          
          // Synchronously revalidate lesson access after successful completion
          await checkAllLessonsAccess();
          
          return true;
        } catch (retryError) {
          console.error('Error completing lesson after starting:', retryError);
          return false;
        }
      }
      return false;
    }
  }, [activeLesson, userId, activeLessonData, startLessonProgress, checkAllLessonsAccess, lessonAccess]);

  const handleLessonSelect = useCallback(async (lessonId: string) => {
    console.log(`Attempting to navigate to lesson: ${lessonId}`);
    
    // Check if lesson is accessible before allowing navigation
    let canAccess = await checkLessonAccess(lessonId);
    
    // If access is denied, wait a bit and try once more (for race condition scenarios)
    if (!canAccess) {
      console.log(`Initial access denied to lesson ${lessonId}, retrying after brief delay...`);
      
      // Brief delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh access for this specific lesson
      canAccess = await checkLessonAccess(lessonId);
      
      if (!canAccess) {
        console.warn(`Access denied to lesson ${lessonId} after retry`);
        return; // Simply return without user interaction
      }
    }

    console.log(`Access granted to lesson: ${lessonId}, proceeding with navigation`);

    // Save current video progress before navigating away
    saveCurrentVideoProgress();

    // Find the module that contains this lesson
    let moduleId = '';
    for (const module of modules) {
      if (module.lessons.some(lesson => lesson.id === lessonId)) {
        moduleId = module.id;
        break;
      }
    }

    // Save last accessed lesson to localStorage
    if (moduleId) {
      setLastAccessedLesson(courseId, moduleId, lessonId);
      console.log(`Saved last accessed lesson: ${lessonId} in module: ${moduleId}`);
    }

    setActiveLesson(lessonId);
    await loadLessonContent(lessonId);
    
    console.log(`Navigation to lesson ${lessonId} completed`);
  }, [loadLessonContent, checkLessonAccess, saveCurrentVideoProgress, modules, courseId, setLastAccessedLesson]);


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
    
    // Store current progress data for potential forced saving
    currentProgressData.current.set(data.contentId, { progressPercentage, lastPosition });
    
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
      currentProgressData.current.delete(data.contentId!);
    }, 5000); // Throttle to 5 seconds

    progressUpdateTimers.current.set(data.contentId, newTimerId);

    // Immediately save if video ended (100% progress)
    if (progressPercentage >= 100) {
      clearTimeout(newTimerId);
      progressUpdateTimers.current.delete(data.contentId);
      currentProgressData.current.delete(data.contentId);
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

  // Effect to check lesson access when modules are loaded
  useEffect(() => {
    if (modules.length > 0) {
      checkAllLessonsAccess();
    }
  }, [modules, checkAllLessonsAccess]);

  // Effect to handle initial lesson selection after modules are loaded
  useEffect(() => {
    if (modules.length > 0 && !activeLesson && !initialLessonLoaded) {
      setInitialLessonLoaded(true);
      
      // Priority 1: If initialLessonId is provided via URL, use it
      if (initialLessonId) {
        console.log('Loading initial lesson from URL:', initialLessonId);
        handleLessonSelect(initialLessonId);
        
        // Find and open the module containing this lesson
        for (const module of modules) {
          if (module.lessons.some(lesson => lesson.id === initialLessonId)) {
            setOpenModules(prev => new Set(prev).add(module.id));
            break;
          }
        }
        return;
      }

      // Priority 2: Check for last accessed lesson in localStorage
      const lastAccessed = getLastAccessedLesson(courseId);
      if (lastAccessed) {
        console.log('Found last accessed lesson:', lastAccessed);
        
        // Verify the module and lesson still exist in the course
        const moduleExists = modules.some(m => m.id === lastAccessed.moduleId);
        const lessonExists = modules.some(m => 
          m.lessons.some(l => l.id === lastAccessed.lessonId)
        );
        
        if (moduleExists && lessonExists) {
          console.log('Restoring last accessed lesson:', lastAccessed.lessonId);
          handleLessonSelect(lastAccessed.lessonId);
          setOpenModules(prev => new Set(prev).add(lastAccessed.moduleId));
          return;
        } else {
          console.log('Last accessed lesson no longer exists in course, falling back to first lesson');
        }
      }

      // Priority 3: Fallback to first lesson
      if (modules[0].lessons.length > 0) {
        console.log('Loading first lesson as fallback');
        const firstLesson = modules[0].lessons[0];
        handleLessonSelect(firstLesson.id);
      }
    }
  }, [modules, activeLesson, handleLessonSelect, initialLessonLoaded, initialLessonId, setOpenModules, courseId, getLastAccessedLesson]);

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
    lessonAccess,
    
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
