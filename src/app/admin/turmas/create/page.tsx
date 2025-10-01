'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { SelectComponent } from '@/components/select'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CreateClassUseCase } from '@/_core/modules/enrollment/core/use-cases/create-class/create-class.use-case'
import { CreateClassInput } from '@/_core/modules/enrollment/core/use-cases/create-class/create-class.input'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { ListTrailsUseCase } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.use-case'

export default function CreateTurmaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    institutionId: '',
    courseId: '',
    trailId: '',
    type: 'course' as 'course' | 'trail'
  })
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string, title: string }>>([])
  const [trails, setTrails] = useState<Array<{ id: string, title: string }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch institutions
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
          setFormData(prev => ({ ...prev, institutionId: institutionsForDropdown[0].id }))
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.institutionId || formData.type !== 'course') return

      try {
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const coursesList = await courseRepository.listByInstitution(formData.institutionId)

        const coursesForDropdown = coursesList.map((course) => ({
          id: course.id,
          title: course.title
        }))

        setCourses(coursesForDropdown)
      } catch (err) {
        console.error('Error fetching courses:', err)
      }
    }

    fetchCourses()
  }, [formData.institutionId, formData.type])

  useEffect(() => {
    const fetchTrails = async () => {
      if (!formData.institutionId || formData.type !== 'trail') return

      try {
        const listTrailsUseCase = container.get<ListTrailsUseCase>(
          Register.content.useCase.ListTrailsUseCase
        )

        const trailsResult = await listTrailsUseCase.execute({
          institutionId: formData.institutionId
        })

        const trailsForDropdown = trailsResult.trails.map((trail) => ({
          id: trail.id,
          title: trail.title
        }))

        setTrails(trailsForDropdown)
      } catch (err) {
        console.error('Error fetching trails:', err)
      }
    }

    fetchTrails()
  }, [formData.institutionId, formData.type])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTypeChange = (type: 'course' | 'trail') => {
    setFormData(prev => ({
      ...prev,
      type,
      courseId: type === 'course' ? prev.courseId : '',
      trailId: type === 'trail' ? prev.trailId : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Nome da turma é obrigatório')
      return
    }

    if (!formData.institutionId) {
      setError('Instituição é obrigatória')
      return
    }

    if (formData.type === 'course' && !formData.courseId) {
      setError('Curso é obrigatório quando o tipo é curso')
      return
    }

    if (formData.type === 'trail' && !formData.trailId) {
      setError('Trilha é obrigatória quando o tipo é trilha')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const createClassUseCase = container.get<CreateClassUseCase>(
        Register.enrollment.useCase.CreateClassUseCase
      )

      const input = new CreateClassInput(
        formData.institutionId,
        formData.name.trim(),
        formData.type === 'course' ? formData.courseId : undefined,
        formData.type === 'trail' ? formData.trailId : undefined
      )

      await createClassUseCase.execute(input)

      // Redirect to turmas list
      router.push('/admin/turmas')

    } catch (err) {
      console.error('Error creating class:', err)
      setError('Erro ao criar turma. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Criar Nova Turma</h1>
            <Button
              onClick={() => router.push('/admin/turmas')}
              variant='primary'
            >
              Voltar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Turma</CardTitle>
              <CardDescription>
                Preencha os dados para criar uma nova turma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nome da Turma *
                    </label>
                    <InputText
                      id="name"
                      type="text"
                      placeholder="Digite o nome da turma"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="institution" className="text-sm font-medium">
                      Instituição *
                    </label>
                    <SelectComponent
                      value={formData.institutionId}
                      onChange={(institutionId) => handleInputChange('institutionId', institutionId)}
                      options={institutions.map(institution => ({
                        value: institution.id,
                        label: institution.name
                      }))}
                      placeholder="Selecione uma instituição"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Turma *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="type"
                          value="course"
                          checked={formData.type === 'course'}
                          onChange={() => handleTypeChange('course')}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Curso</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="type"
                          value="trail"
                          checked={formData.type === 'trail'}
                          onChange={() => handleTypeChange('trail')}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Trilha</span>
                      </label>
                    </div>
                  </div>

                  {formData.type === 'course' && (
                    <div className="space-y-2">
                      <label htmlFor="course" className="text-sm font-medium">
                        Curso *
                      </label>
                      <SelectComponent
                        value={formData.courseId}
                        onChange={(courseId) => handleInputChange('courseId', courseId)}
                        options={courses.map(course => ({
                          value: course.id,
                          label: course.title
                        }))}
                        placeholder="Selecione um curso"
                        className="w-full"
                      />
                    </div>
                  )}

                  {formData.type === 'trail' && (
                    <div className="space-y-2">
                      <label htmlFor="trail" className="text-sm font-medium">
                        Trilha *
                      </label>
                      <SelectComponent
                        value={formData.trailId}
                        onChange={(trailId) => handleInputChange('trailId', trailId)}
                        options={trails.map(trail => ({
                          value: trail.id,
                          label: trail.title
                        }))}
                        placeholder="Selecione uma trilha"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    variant='primary'
                  >
                    {submitting ? 'Criando...' : 'Criar Turma'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/admin/turmas')}
                    variant='secondary'
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
