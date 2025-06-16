'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CreateTrailUseCase } from '@/_core/modules/content/core/use-cases/create-trail/create-trail.use-case'
import { CreateTrailInput } from '@/_core/modules/content/core/use-cases/create-trail/create-trail.input'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'

type CourseInfo = {
  id: string
  title: string
  description: string
}

export default function CreateTrailPage() {
  const router = useRouter()
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [availableCourses, setAvailableCourses] = useState<CourseInfo[]>([])
  const [selectedCourses, setSelectedCourses] = useState<CourseInfo[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [institutionsLoading, setInstitutionsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setInstitutionsLoading(true)

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )

        const institutionsList = await institutionRepository.list()

        const institutionsForDropdown = institutionsList.map((institution: Institution) => ({
          id: institution.id,
          name: institution.name
        }))

        setInstitutions(institutionsForDropdown)

        if (institutionsForDropdown.length > 0) {
          setSelectedInstitutionId(institutionsForDropdown[0].id)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching institutions:', err)
        setError('Failed to load institutions. Please try again later.')
      } finally {
        setInstitutionsLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitutionId) return

      try {
        setSelectedCourses([])
        setSelectedCourseId('')

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const allCourses = await courseRepository.listByInstitution(selectedInstitutionId)

        const coursesInfo: CourseInfo[] = allCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description
        }))

        setAvailableCourses(coursesInfo)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again later.')
      }
    }

    fetchCourses()
  }, [selectedInstitutionId])

  const handleAddCourse = () => {
    if (!selectedCourseId) {
      setError('Selecione um curso para adicionar')
      return
    }

    const courseToAdd = availableCourses.find(course => course.id === selectedCourseId)
    if (courseToAdd) {
      setSelectedCourses(prev => [...prev, courseToAdd])
      setAvailableCourses(prev => prev.filter(course => course.id !== selectedCourseId))
      setSelectedCourseId('')
      setError(null)
    }
  }

  const handleRemoveCourse = (courseId: string) => {
    const courseToRemove = selectedCourses.find(course => course.id === courseId)
    if (courseToRemove) {
      setAvailableCourses(prev => [...prev, courseToRemove])
      setSelectedCourses(prev => prev.filter(course => course.id !== courseId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('O título é obrigatório')
      return
    }
    
    if (!description.trim()) {
      setError('A descrição é obrigatória')
      return
    }
    
    if (!selectedInstitutionId) {
      setError('Selecione uma instituição')
      return
    }

    if (selectedCourses.length === 0) {
      setError('A trilha deve ter pelo menos um curso')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const createTrailUseCase = container.get<CreateTrailUseCase>(
        Register.content.useCase.CreateTrailUseCase
      )
      
      const courseIds = selectedCourses.map(course => course.id)
      
      const input = new CreateTrailInput(
        selectedInstitutionId,
        title.trim(),
        description.trim(),
        courseIds
      )
      
      const output = await createTrailUseCase.execute(input)
      
      // Redirect to trails list
      router.push('/admin/trails')
    } catch (err) {
      console.error('Error creating trail:', err)
      setError('Failed to create trail. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/trails')
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Criar Nova Trilha</h1>
            <Button
              onClick={handleCancel}
              className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
            >
              Voltar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Trilha</CardTitle>
              <CardDescription>
                Preencha as informações básicas da trilha de aprendizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {institutionsLoading && (
                <LoadingSpinner />
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Erro!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              {!institutionsLoading && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium mb-2">
                      Instituição *
                    </label>
                    <select
                      id="institution"
                      value={selectedInstitutionId}
                      onChange={(e) => setSelectedInstitutionId(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                      required
                    >
                      <option value="">Selecione uma instituição</option>
                      {institutions.map(institution => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      Título *
                    </label>
                    <InputText
                      id="title"
                      type="text"
                      placeholder="Digite o título da trilha..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Descrição *
                    </label>
                    <textarea
                      id="description"
                      placeholder="Digite a descrição da trilha..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Adicionar Curso</h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                        >
                          <option value="">Selecione um curso para adicionar</option>
                          {availableCourses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddCourse}
                        disabled={!selectedCourseId}
                        className="bg-green-600 text-white shadow-xs hover:bg-green-700"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Cursos Selecionados ({selectedCourses.length})</h3>
                    {selectedCourses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum curso selecionado ainda
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedCourses.map((course, index) => (
                          <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                  {index + 1}
                                </span>
                                <div>
                                  <h4 className="font-medium">{course.title}</h4>
                                  <p className="text-sm text-gray-600 truncate max-w-md">{course.description}</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveCourse(course.id)}
                              className="border bg-red-50 text-red-600 shadow-xs hover:bg-red-100 hover:text-red-700 h-8 rounded-md gap-1.5 px-3"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      {loading ? 'Criando...' : 'Criar Trilha'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
