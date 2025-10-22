'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { TrailForm, CourseManager, InstitutionSelector } from '@/components/trails'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CreateTrailUseCase } from '@/_core/modules/content/core/use-cases/create-trail/create-trail.use-case'
import { CreateTrailInput } from '@/_core/modules/content/core/use-cases/create-trail/create-trail.input'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { ImageUpload } from '@/components/upload'

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
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
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
        courseIds,
        coverImageUrl.trim() || null
      )
      
      await createTrailUseCase.execute(input)
      
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
              variant='primary'
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
                  <InstitutionSelector
                    institutions={institutions}
                    selectedInstitutionId={selectedInstitutionId}
                    onInstitutionChange={setSelectedInstitutionId}
                  />

                  <TrailForm
                    title={title}
                    description={description}
                    coverImageUrl={coverImageUrl}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onCoverImageUrlChange={setCoverImageUrl}
                  />

                  {/* Upload de Imagem de Capa */}
                  {selectedInstitutionId && (
                    <>
                      <ImageUpload
                        imageType="trail"
                        institutionId={selectedInstitutionId}
                        onUploadSuccess={setCoverImageUrl}
                        currentImageUrl={coverImageUrl}
                        label="Imagem de Capa da Trilha"
                      />
                      {coverImageUrl && (
                        <p className="text-sm text-green-600">✓ Imagem de capa definida</p>
                      )}
                    </>
                  )}

                  <CourseManager
                    availableCourses={availableCourses}
                    selectedCourses={selectedCourses}
                    selectedCourseId={selectedCourseId}
                    onCourseSelect={setSelectedCourseId}
                    onAddCourse={handleAddCourse}
                    onRemoveCourse={handleRemoveCourse}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      variant='primary'
                    >
                      {loading ? 'Criando...' : 'Criar Trilha'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant='secondary'
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
