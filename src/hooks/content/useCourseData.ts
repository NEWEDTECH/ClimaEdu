import { useState, useEffect, useCallback } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
import { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
import { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { Module } from '@/_core/modules/content/core/entities/Module';
import { Lesson } from '@/_core/modules/content/core/entities/Lesson';
import { Content } from '@/_core/modules/content/core/entities/Content';
import { Questionnaire } from '@/_core/modules/content/core/entities/Questionnaire';
import { Activity } from '@/_core/modules/content/core/entities/Activity';

interface UseCourseDataProps {
  courseId: string;
  userId?: string;
}

export const useCourseData = ({ courseId, userId }: UseCourseDataProps) => {
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
    } catch (error) {
      console.error('Error loading lesson content:', error);
    }
  }, [loadLessonQuestionnaire, loadLessonActivity]);

  const handleLessonSelect = useCallback(async (lessonId: string) => {
    setActiveLesson(lessonId);
    await loadLessonContent(lessonId);
  }, [loadLessonContent]);

  const handleCompleteLesson = useCallback(() => {
    // TODO: Implement lesson completion logic
    console.log('Lesson completed:', activeLesson);
  }, [activeLesson]);

  const handleVideoProgress = useCallback(({}: { played: number; playedSeconds: number; loadedSeconds: number }) => {
    // Video progress logic can be implemented here if needed
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);

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

        // Set the first lesson as active if available
        if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
          const firstLesson = modulesWithLessons[0].lessons[0];
          setActiveLesson(firstLesson.id);
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
    
    // Loading functions (exposed for potential external use)
    loadLessonContent,
    loadLessonQuestionnaire,
    loadLessonActivity
  };
};