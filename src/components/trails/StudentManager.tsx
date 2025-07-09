'use client'

import { InputText } from '@/components/input'
import { Tooltip } from '@/components/tooltip'
import { X } from 'lucide-react'

type StudentInfo = {
  id: string
  name: string
  email: string
  isEnrolled: boolean
}

type UserInfo = {
  id: string
  name: string
  email: { value: string }
}

interface StudentManagerProps {
  trailStudents: StudentInfo[]
  filteredStudents: UserInfo[]
  searchStudentTerm: string
  showStudentDropdown: boolean
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onRemoveStudent: (studentId: string) => void
  onAddStudent: (student: UserInfo) => void
  onClearSearch: () => void
  onHideDropdown: () => void
}

export function StudentManager({
  trailStudents,
  filteredStudents,
  searchStudentTerm,
  showStudentDropdown,
  onSearchChange,
  onSearchFocus,
  onRemoveStudent,
  onAddStudent,
  onClearSearch,
  onHideDropdown
}: StudentManagerProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Gerenciar Estudantes</h3>
      
      {/* Trail Students List */}
      {trailStudents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Estudantes na Trilha ({trailStudents.length})</h4>
          <div className="flex flex-wrap gap-2">
            {trailStudents.map((student) => (
              <div key={student.id} className="relative bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Tooltip label={student.email} />
                <button
                  type="button"
                  onClick={() => onRemoveStudent(student.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  aria-label="Remover estudante"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <label htmlFor="studentSearch" className="block text-sm font-medium mb-2">
          Adicionar Estudante
        </label>
        <InputText
          id="studentSearch"
          type="text"
          placeholder="Buscar estudante por nome ou email..."
          value={searchStudentTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onSearchFocus}
          className="w-full"
        />

        {showStudentDropdown && searchStudentTerm.trim() !== '' && filteredStudents.length > 0 && (
          <div className="student-dropdown absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
            {filteredStudents
              .filter(student => !trailStudents.some(trailStudent => trailStudent.id === student.id))
              .map((student) => (
                <div
                  key={student.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    onAddStudent(student)
                    onClearSearch()
                    onHideDropdown()
                  }}
                >
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email.value}</div>
                </div>
              ))}
          </div>
        )}

        {showStudentDropdown && searchStudentTerm.trim() !== '' && filteredStudents.length === 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
            <div className="px-4 py-3 text-gray-500 text-center">
              Nenhum estudante encontrado
            </div>
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs mt-1">
        Digite para buscar estudantes da instituição
      </p>
    </div>
  )
}
