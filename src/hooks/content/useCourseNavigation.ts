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

  const handleNextVideo = useCallback(() => {
    const { moduleIndex, lessonIndex, module } = findCurrentLessonPosition();
    
    if (moduleIndex === -1 || lessonIndex === -1 || !module) return;

    // Check if there's another lesson in the current module
    if (lessonIndex < module.lessons.length - 1) {
      // Go to next lesson in current module
      const nextLesson = module.lessons[lessonIndex + 1];
      onLessonSelect(nextLesson.id);
    } else if (moduleIndex < modules.length - 1) {
      // Go to first lesson of next module
      const nextModule = modules[moduleIndex + 1];
      if (nextModule.lessons.length > 0) {
        setOpenModules(prev => new Set([...prev, nextModule.id]));
        onLessonSelect(nextModule.lessons[0].id);
      }
    }
  }, [findCurrentLessonPosition, modules, onLessonSelect, setOpenModules]);

  const handlePreviousVideo = useCallback(() => {
    const { moduleIndex, lessonIndex, module } = findCurrentLessonPosition();
    
    if (moduleIndex === -1 || lessonIndex === -1 || !module) return;

    // Check if there's a previous lesson in the current module
    if (lessonIndex > 0) {
      // Go to previous lesson in current module
      const previousLesson = module.lessons[lessonIndex - 1];
      onLessonSelect(previousLesson.id);
    } else if (moduleIndex > 0) {
      // Go to last lesson of previous module
      const previousModule = modules[moduleIndex - 1];
      if (previousModule.lessons.length > 0) {
        setOpenModules(prev => new Set([...prev, previousModule.id]));
        const lastLesson = previousModule.lessons[previousModule.lessons.length - 1];
        onLessonSelect(lastLesson.id);
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