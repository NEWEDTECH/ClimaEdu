import { useCallback } from 'react';
import { Module } from '@/_core/modules/content/core/entities/Module';

interface UseCourseNavigationProps {
  modules: Module[];
  activeLesson: string | null;
  setOpenModules: (modules: Set<string>) => void;
  onLessonSelect: (lessonId: string) => Promise<void>;
}

export const useCourseNavigation = ({
  modules,
  activeLesson,
  setOpenModules,
  onLessonSelect
}: UseCourseNavigationProps) => {
  const findCurrentLessonPosition = useCallback(() => {
    if (!activeLesson || modules.length === 0) {
      return { moduleIndex: -1, lessonIndex: -1, module: null };
    }

    for (let i = 0; i < modules.length; i++) {
      const currentModule = modules[i];
      const lessonIndex = currentModule.lessons.findIndex(lesson => lesson.id === activeLesson);

      if (lessonIndex !== -1) {
        return {
          moduleIndex: i,
          lessonIndex,
          module: currentModule
        };
      }
    }

    return { moduleIndex: -1, lessonIndex: -1, module: null };
  }, [activeLesson, modules]);

  const handleNextVideo = useCallback(async () => {
    const { moduleIndex, lessonIndex, module } = findCurrentLessonPosition();
    
    if (moduleIndex === -1 || lessonIndex === -1 || !module) {
      console.warn('Navigation: Unable to find current lesson position');
      return;
    }

    console.log(`Navigation: Current position - Module ${moduleIndex}, Lesson ${lessonIndex}`);

    // Check if there's another lesson in the current module
    if (lessonIndex < module.lessons.length - 1) {
      // Go to next lesson in current module
      const nextLesson = module.lessons[lessonIndex + 1];
      console.log(`Navigation: Going to next lesson in same module: ${nextLesson.id}`);
      await onLessonSelect(nextLesson.id);
    } else if (moduleIndex < modules.length - 1) {
      // Go to first lesson of next module
      const nextModule = modules[moduleIndex + 1];
      if (nextModule.lessons.length > 0) {
        console.log(`Navigation: Going to first lesson of next module: ${nextModule.lessons[0].id}`);
        setOpenModules(prev => new Set([...prev, nextModule.id]));
        await onLessonSelect(nextModule.lessons[0].id);
      }
    } else {
      console.log('Navigation: Reached end of course, no next lesson available');
    }
  }, [findCurrentLessonPosition, modules, onLessonSelect, setOpenModules]);


  const handlePreviousVideo = useCallback(async () => {
    const { moduleIndex, lessonIndex, module } = findCurrentLessonPosition();
    
    if (moduleIndex === -1 || lessonIndex === -1 || !module) return;

    // Check if there's a previous lesson in the current module
    if (lessonIndex > 0) {
      // Go to previous lesson in current module
      const previousLesson = module.lessons[lessonIndex - 1];
      await onLessonSelect(previousLesson.id);
    } else if (moduleIndex > 0) {
      // Go to last lesson of previous module
      const previousModule = modules[moduleIndex - 1];
      if (previousModule.lessons.length > 0) {
        setOpenModules(prev => new Set([...prev, previousModule.id]));
        const lastLesson = previousModule.lessons[previousModule.lessons.length - 1];
        await onLessonSelect(lastLesson.id);
      }
    }
  }, [findCurrentLessonPosition, modules, onLessonSelect, setOpenModules]);

  const canNavigatePrevious = useCallback(() => {
    const { moduleIndex, lessonIndex } = findCurrentLessonPosition();
    return moduleIndex > 0 || lessonIndex > 0;
  }, [findCurrentLessonPosition]);

  const canNavigateNext = useCallback(() => {
    const { moduleIndex, lessonIndex, module } = findCurrentLessonPosition();
    
    if (moduleIndex === -1 || lessonIndex === -1 || !module) return false;
    
    // Can navigate if there's another lesson in current module or another module
    return lessonIndex < module.lessons.length - 1 || moduleIndex < modules.length - 1;
  }, [findCurrentLessonPosition, modules]);

  return {
    handleNextVideo,
    handlePreviousVideo,
    canNavigatePrevious,
    canNavigateNext,
    findCurrentLessonPosition
  };
};