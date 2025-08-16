'use client'

import { Course } from '@/_core/modules/content'
import { ChevronDownIcon } from 'lucide-react'

interface CourseSelectProps {
  courses: Course[]
  selectedCourseId: string
  onCourseChange: (courseId: string) => void
  error?: string
}

export function CourseSelect({ courses, selectedCourseId, onCourseChange, error }: CourseSelectProps) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          value={selectedCourseId}
          onChange={(e) => onCourseChange(e.target.value)}
          className={`
            flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm 
            transition-colors focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none pr-8
            ${error ? 'border-red-500' : 'border-input'}
          `}
        >
          <option value="">Selecione um curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <ChevronDownIcon 
          size={16} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
