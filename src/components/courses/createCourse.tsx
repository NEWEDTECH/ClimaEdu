'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CreateCourseUseCase } from '@/_core/modules/content/core/use-cases/create-course/create-course.use-case'
import { InstitutionRepository } from '@/_core/modules/institution'

type FormData = {
  title: string;
  description: string;
  institutionId: string;
  instructor: string;
  duration: string;
  category: string;
  level: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    institutionId: '',
    instructor: '',
    duration: '',
    category: '',
    level: 'beginner',
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true)

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )

        const institutionsList = await institutionRepository.list()

        const institutionsForDropdown = institutionsList.map(institution => ({
          id: institution.id,
          name: institution.name
        }))

        setInstitutions(institutionsForDropdown)

        if (institutionsForDropdown.length > 0) {
          setFormData(prev => ({ ...prev, institutionId: institutionsForDropdown[0].id }))
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching institutions:', err)
        setError('Failed to load institutions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {

      const createCourseUseCase = container.get<CreateCourseUseCase>(
        Register.content.useCase.CreateCourseUseCase
      )

      await createCourseUseCase.execute({
        institutionId: formData.institutionId,
        title: formData.title,
        description: formData.description
      })


      router.push('/admin/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      alert(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Criar novo curso</h1>
        <Link href="/admin/courses">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Enter the details of the new course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex justify-center items-center h-20">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-200"></div>
                  <div className="mt-2 text-gray-500 text-sm">Loading institutions...</div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="institutionId" className="text-sm font-medium">
                      Institution
                    </label>
                    <select
                      id="institutionId"
                      name="institutionId"
                      value={formData.institutionId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                      required
                    >
                      <option value="">Select an institution</option>
                      {institutions.map(institution => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Course Title
                    </label>
                    <InputText
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter course description"
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    required
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Additional Information (UI Only)</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    These fields are for UI display only and are not stored in the core course entity.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="instructor" className="text-sm font-medium">
                        Instructor
                      </label>
                      <InputText
                        id="instructor"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleChange}
                        placeholder="Enter instructor name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <InputText
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Enter course category"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="level" className="text-sm font-medium">
                        Level
                      </label>
                      <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="duration" className="text-sm font-medium">
                        Duration
                      </label>
                      <InputText
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 12 weeks"
                      />
                    </div>

                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 mt-4">
            <Link href="/admin/courses">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
