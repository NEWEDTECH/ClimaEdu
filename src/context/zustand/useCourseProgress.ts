import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LastAccessedLesson {
  courseId: string
  moduleId: string
  lessonId: string
}

interface CourseProgressState {
  lastAccessedLessons: Record<string, LastAccessedLesson>
  setLastAccessedLesson: (courseId: string, moduleId: string, lessonId: string) => void
  getLastAccessedLesson: (courseId: string) => LastAccessedLesson | null
  clearLastAccessedLesson: (courseId: string) => void
}

export const useCourseProgress = create<CourseProgressState>()(
  persist(
    (set, get) => ({
      lastAccessedLessons: {},
      
      setLastAccessedLesson: (courseId: string, moduleId: string, lessonId: string) => {
        set((state) => ({
          lastAccessedLessons: {
            ...state.lastAccessedLessons,
            [courseId]: { courseId, moduleId, lessonId }
          }
        }))
      },
      
      getLastAccessedLesson: (courseId: string) => {
        const state = get()
        return state.lastAccessedLessons[courseId] || null
      },
      
      clearLastAccessedLesson: (courseId: string) => {
        set((state) => {
          const newLessons = { ...state.lastAccessedLessons }
          delete newLessons[courseId]
          return { lastAccessedLessons: newLessons }
        })
      }
    }),
    {
      name: 'course-progress-storage'
    }
  )
)
