'use client'

import { Button } from '@/components/button'
import { SelectComponent } from '@/components/select'
import { X } from 'lucide-react'

type CourseInfo = {
  id: string
  title: string
  description: string
}

interface CourseManagerProps {
  availableCourses: CourseInfo[]
  selectedCourses: CourseInfo[]
  selectedCourseId: string
  onCourseSelect: (courseId: string) => void
  onAddCourse: () => void
  onRemoveCourse: (courseId: string) => void
  isEditMode?: boolean
}

export function CourseManager({
  availableCourses,
  selectedCourses,
  selectedCourseId,
  onCourseSelect,
  onAddCourse,
  onRemoveCourse,
  isEditMode = false
}: CourseManagerProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        {isEditMode ? 'Gerenciar Cursos' : 'Adicionar Curso'}
      </h3>

      {isEditMode && selectedCourses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Cursos na Trilha ({selectedCourses.length})</h4>
          <div 
            className={`space-y-3 ${
              selectedCourses.length >= 5 
                ? 'max-h-96 overflow-y-scroll border border-gray-200 rounded-lg p-2 bg-gray-50' 
                : ''
            }`}
            style={selectedCourses.length >= 5 ? { maxHeight: '400px' } : {}}
          >
            {selectedCourses.map((course, index) => (
               <div key={course.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{course.title}</div>
                </div>
                <Button
                  onClick={() => onRemoveCourse(course.id)}
                  className="bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 flex items-center gap-1 whitespace-nowrap min-w-fit"
                  aria-label="Remover curso"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEditMode && (
        <div>
          <h3 className="text-lg font-medium mb-4">Cursos Selecionados ({selectedCourses.length})</h3>
          {selectedCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum curso selecionado ainda
            </div>
          ) : (
            <div 
              className={`space-y-3 mb-6 ${
                selectedCourses.length > 5 
                  ? 'max-h-96 overflow-y-scroll border border-gray-200 rounded-lg p-2 ' 
                  : ''
              }`}
              style={selectedCourses.length > 5 ? { maxHeight: '400px' } : {}}
            >
              {selectedCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => onRemoveCourse(course.id)}
                    className="border bg-red-50 text-red-600 shadow-xs hover:bg-red-100 hover:text-red-700 h-8 rounded-md gap-1.5 px-3"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="courseSelect"
            className="block text-sm font-medium mb-2"
          >
            {isEditMode ? "Adicionar Curso" : "Selecionar Curso"}
          </label>
          <SelectComponent
            value={selectedCourseId}
            onChange={onCourseSelect}
            options={availableCourses.map(course => ({
              value: course.id,
              label: course.title
            }))}
            placeholder="Selecione um curso para adicionar"
          />
          {isEditMode && (
            <p className="text-gray-500 text-xs mt-1">
              Selecione um curso para adicionar à trilha
            </p>
          )}
        </div>

        {!isEditMode && (
          <Button
            type="button"
            onClick={onAddCourse}
            disabled={!selectedCourseId}
            className="bg-green-600 text-white shadow-xs hover:bg-green-700 h-[42px]"
          >
            Adicionar
          </Button>
        )}
      </div>


    </div>
  )
}
