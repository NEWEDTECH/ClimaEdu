'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { SelectComponent } from '@/components/select'
import { X, User, Building2, BookOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export type UserOption = {
  id: string
  name: string
  email: string
}

export type InstitutionOption = {
  id: string
  name: string
}

export type CourseOption = {
  id: string
  title: string
}

type UserAssociationFormProps = {
  // Form data
  users: UserOption[]
  institutions: InstitutionOption[]
  courses: CourseOption[]
  
  // Selected values
  selectedUserId: string
  selectedInstitutionId: string
  selectedCourses: CourseOption[]
  
  // Change handlers
  onUserChange: (userId: string) => void
  onInstitutionChange: (institutionId: string) => void
  onCourseAdd: (courseId: string) => void
  onCourseRemove: (courseId: string) => void
  
  // Form state
  isSubmitting: boolean
  isEditMode?: boolean
  
  // Labels
  userLabel: string // "Tutor" ou "Gestor de Conteúdo"
  userPlaceholder: string
  title: string
  description: string
  backUrl: string
  
  // Submit handler
  onSubmit: (e: React.FormEvent) => void
  
  // Optional loading state
  loading?: boolean
}

export function UserAssociationForm({
  users,
  institutions,
  courses,
  selectedUserId,
  selectedInstitutionId,
  selectedCourses,
  onUserChange,
  onInstitutionChange,
  onCourseAdd,
  onCourseRemove,
  isSubmitting,
  isEditMode = false,
  userLabel,
  userPlaceholder,
  title,
  description,
  backUrl,
  onSubmit,
  loading = false
}: UserAssociationFormProps) {
  const selectedUser = users.find(u => u.id === selectedUserId)
  const selectedInstitution = institutions.find(i => i.id === selectedInstitutionId)
  
  // Filter courses that are not already selected
  const availableCourses = courses.filter(course => 
    !selectedCourses.some(sc => sc.id === course.id)
  )

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <Link href={backUrl}>
          <Button variant="secondary" className="w-full md:w-auto">
            Voltar
          </Button>
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Institution Card */}
        <Card className="border-2 transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Instituição</CardTitle>
                <CardDescription>Selecione a instituição dos cursos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SelectComponent
              value={selectedInstitutionId}
              onChange={onInstitutionChange}
              options={institutions.map(institution => ({
                value: institution.id,
                label: institution.name
              }))}
              placeholder="Selecione uma instituição"
              className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
              disabled={isEditMode}
            />
            {isEditMode && selectedInstitution && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Instituição definida automaticamente baseada nos cursos do {userLabel.toLowerCase()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Selection Card */}
        <Card className="border-2 transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{userLabel}</CardTitle>
                <CardDescription>Selecione o {userLabel.toLowerCase()} para associar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SelectComponent
              value={selectedUserId}
              onChange={onUserChange}
              options={users.map(user => ({
                value: user.id,
                label: `${user.name} (${user.email})`
              }))}
              placeholder={userPlaceholder}
              className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
              disabled={isEditMode}
            />
            {isEditMode && selectedUser && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {userLabel} não pode ser alterado no modo de edição
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card className="border-2 transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Cursos</CardTitle>
                <CardDescription>Selecione os cursos para associar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Selection */}
            {selectedInstitutionId ? (
              <div className="space-y-3">
                <label htmlFor="course" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adicionar Curso
                </label>
                <SelectComponent
                  value=""
                  onChange={(courseId) => {
                    if (courseId) {
                      onCourseAdd(courseId)
                    }
                  }}
                  options={availableCourses.map(course => ({
                    value: course.id,
                    label: course.title
                  }))}
                  placeholder="Selecione um curso para adicionar"
                  disabled={availableCourses.length === 0}
                />
                {availableCourses.length === 0 && selectedCourses.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Todos os cursos disponíveis já foram adicionados
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecione uma instituição para ver os cursos disponíveis
                </p>
              </div>
            )}

            {/* Selected Courses */}
            {selectedCourses.length > 0 && (
              <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cursos Selecionados
                </h4>
                <div className="grid gap-2 max-h-96 overflow-y-auto pr-2">
                  {selectedCourses.map(course => (
                    <div
                      key={course.id}
                      className="group flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors bg-white dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCourseRemove(course.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Remover curso"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCourses.length === 0 && selectedInstitutionId && (
              <div className="p-6 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Nenhum curso selecionado ainda
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Use o seletor acima para adicionar cursos
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end border-t dark:border-gray-700 pt-6">
            <Link href={backUrl} className="w-full sm:w-auto">
              <Button 
                type="button" 
                variant="secondary" 
                disabled={isSubmitting || loading}
                className="w-full"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || loading || selectedCourses.length === 0}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isSubmitting
                ? isEditMode ? 'Salvando...' : 'Associando...'
                : isEditMode ? 'Salvar Alterações' : `Associar ${userLabel}`
              }
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
