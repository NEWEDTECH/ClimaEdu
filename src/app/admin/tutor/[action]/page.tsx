'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { FormSection } from '@/components/form/form'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case'
import { Tooltip } from '@/components/tooltip/Tooltip'
import { X } from 'lucide-react'

export default function AssociateTutorToCoursePage() {
  const router = useRouter()
  const params = useParams()
  const tutorId = params.action as string
  const isEditMode = tutorId !== 'create'
  
  const [tutors, setTutors] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string, title: string }>>([])
  
  // Autocomplete states
  const [tutorSearchTerm, setTutorSearchTerm] = useState<string>('')
  const [institutionSearchTerm, setInstitutionSearchTerm] = useState<string>('')
  const [courseSearchTerm, setCourseSearchTerm] = useState<string>('')
  const [showTutorDropdown, setShowTutorDropdown] = useState<boolean>(false)
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState<boolean>(false)
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false)
  
  const [selectedTutorId, setSelectedTutorId] = useState<string>('')
  const [selectedTutorDisplay, setSelectedTutorDisplay] = useState<string>('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [selectedInstitutionDisplay, setSelectedInstitutionDisplay] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<Array<{ id: string, title: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Refs for handling clicks outside dropdowns
  const tutorDropdownRef = useRef<HTMLDivElement>(null)
  const institutionDropdownRef = useRef<HTMLDivElement>(null)
  const courseDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch tutors and institutions on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
        // Fetch tutors
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        const tutorsList = await userRepository.listByType(UserRole.TUTOR)
        
        const tutorsForDropdown = tutorsList.map(tutor => ({
          id: tutor.id,
          name: tutor.name,
          email: tutor.email.value
        }))
        
        setTutors(tutorsForDropdown)
        
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
        
        // If in edit mode, fetch tutor data and courses
        if (isEditMode && tutorId) {
          // Get tutor data
          const tutor = await userRepository.findById(tutorId)
          
          if (tutor) {
            setSelectedTutorId(tutor.id)
            setSelectedTutorDisplay(`${tutor.name} (${tutor.email.value})`)
            
            // Get tutor's courses
            const courseTutorRepository = container.get<CourseTutorRepository>(
              Register.content.repository.CourseTutorRepository
            )
            
            const courseRepository = container.get<CourseRepository>(
              Register.content.repository.CourseRepository
            )
            
            const courseTutors = await courseTutorRepository.findByUserId(tutor.id)
            
            if (courseTutors.length > 0) {
              // Get course details for each association
              const courseDetailsPromises = courseTutors.map(async (courseTutor) => {
                const course = await courseRepository.findById(courseTutor.courseId)
                if (course) {
                  // If this is the first course, set the institution
                  if (!selectedInstitutionId) {
                    setSelectedInstitutionId(course.institutionId)
                    
                    // Find institution name
                    const institution = institutionsForDropdown.find(
                      inst => inst.id === course.institutionId
                    )
                    
                    if (institution) {
                      setSelectedInstitutionDisplay(institution.name)
                    }
                    
                    // Fetch all courses for this institution
                    const institutionCourses = await courseRepository.listByInstitution(course.institutionId)
                    
                    setCourses(institutionCourses.map(c => ({
                      id: c.id,
                      title: c.title
                    })))
                  }
                  
                  return {
                    id: course.id,
                    title: course.title
                  }
                }
                return null
              })
              
              const courseDetails = (await Promise.all(courseDetailsPromises)).filter(
                (course): course is { id: string; title: string } => 
                  course !== null
              )
              
              setSelectedCourses(courseDetails)
            }
          } else {
            setError('Tutor não encontrado')
          }
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Falha ao carregar dados. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInitialData()
    
    // Add click event listener to handle clicks outside dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (tutorDropdownRef.current && !tutorDropdownRef.current.contains(event.target as Node)) {
        setShowTutorDropdown(false)
      }
      if (institutionDropdownRef.current && !institutionDropdownRef.current.contains(event.target as Node)) {
        setShowInstitutionDropdown(false)
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setShowCourseDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditMode, tutorId, selectedInstitutionId])
  
  // Fetch courses when institution changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitutionId) return
      
      try {
        setLoading(true)
        
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        const coursesList = await courseRepository.listByInstitution(selectedInstitutionId)
        
        const coursesForDropdown = coursesList.map(course => ({
          id: course.id,
          title: course.title
        }))
        
        setCourses(coursesForDropdown)
        
        // Only reset selected courses if not in edit mode
        if (!isEditMode) {
          setSelectedCourses([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Falha ao carregar cursos. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourses()
  }, [selectedInstitutionId, isEditMode])
  
  // Filter tutors based on search term
  const filteredTutors = tutors.filter(tutor => {
    const searchTermLower = tutorSearchTerm.toLowerCase()
    return (
      tutor.name.toLowerCase().includes(searchTermLower) ||
      tutor.email.toLowerCase().includes(searchTermLower)
    )
  })
  
  // Filter institutions based on search term
  const filteredInstitutions = institutions.filter(institution => {
    return institution.name.toLowerCase().includes(institutionSearchTerm.toLowerCase())
  })
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(course => {
    return course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
  })
  
  const handleTutorSelect = (tutor: { id: string, name: string, email: string }) => {
    setSelectedTutorId(tutor.id)
    setSelectedTutorDisplay(`${tutor.name} (${tutor.email})`)
    setTutorSearchTerm('')
    setShowTutorDropdown(false)
  }
  
  const handleInstitutionSelect = (institution: { id: string, name: string }) => {
    setSelectedInstitutionId(institution.id)
    setSelectedInstitutionDisplay(institution.name)
    setInstitutionSearchTerm('')
    setShowInstitutionDropdown(false)
  }
  
  const handleCourseSelect = (course: { id: string, title: string }) => {
    if (!selectedCourses.some(c => c.id === course.id)) {
      setSelectedCourses(prev => [...prev, course])
    }
    setCourseSearchTerm('')
    setShowCourseDropdown(false)
  }
  
  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.id !== courseId))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTutorId) {
      setError('Por favor, selecione um tutor')
      return
    }
    
    if (!selectedInstitutionId) {
      setError('Por favor, selecione uma instituição')
      return
    }
    
    if (selectedCourses.length === 0) {
      setError('Por favor, selecione pelo menos um curso')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const associateTutorToCourseUseCase = container.get<AssociateTutorToCourseUseCase>(
        Register.content.useCase.AssociateTutorToCourseUseCase
      )
      
      const courseTutorRepository = container.get<CourseTutorRepository>(
        Register.content.repository.CourseTutorRepository
      )
      
      // Get current course-tutor associations
      const currentCourseTutors = await courseTutorRepository.findByUserId(selectedTutorId)
      
      // Identify courses to add and remove
      const selectedCourseIds = selectedCourses.map(course => course.id)
      const currentCourseIds = currentCourseTutors.map(ct => ct.courseId)
      
      // Courses to add: in selectedCourseIds but not in currentCourseIds
      const coursesToAdd = selectedCourseIds.filter(id => !currentCourseIds.includes(id))
      
      // Courses to remove: in currentCourseIds but not in selectedCourseIds
      const coursesToRemove = currentCourseTutors.filter(ct => !selectedCourseIds.includes(ct.courseId))
      
      // Add new associations
      const addPromises = coursesToAdd.map(courseId => 
        associateTutorToCourseUseCase.execute({
          userId: selectedTutorId,
          courseId
        })
      )
      
      // Remove old associations
      const removePromises = coursesToRemove.map(ct => 
        courseTutorRepository.delete(ct.id)
      )
      
      // Execute all operations
      await Promise.all([...addPromises, ...removePromises])
      
      setSuccessMessage('Associações do tutor atualizadas com sucesso')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/tutor')
      }, 2000)
    } catch (err) {
      console.error('Error updating tutor associations:', err)
      setError('Falha ao atualizar associações do tutor. Por favor, tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Editar Associações do Tutor' : 'Associar Tutor a Cursos'}
            </h1>
            <Link href="/admin/tutor">
              <Button className="border bg-white hover:bg-gray-100">Cancelar</Button>
            </Link>
          </div>

          {loading && <LoadingSpinner />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sucesso!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}

          <Card>
            <FormSection onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>
                  {isEditMode ? 'Editar Associações do Tutor' : 'Associar Tutor a Cursos'}
                </CardTitle>
                <CardDescription>
                  {isEditMode 
                    ? 'Edite as associações de cursos para este tutor'
                    : 'Selecione um tutor e um ou mais cursos para associá-lo'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tutor Autocomplete */}
                <div className="space-y-2" ref={tutorDropdownRef}>
                  <label htmlFor="tutor" className="text-sm font-medium">
                    Selecionar Tutor
                  </label>
                  <div className="relative">
                    <InputText
                      id="tutor"
                      value={tutorSearchTerm || selectedTutorDisplay}
                      onChange={(e) => {
                        setTutorSearchTerm(e.target.value)
                        setShowTutorDropdown(true)
                        if (selectedTutorDisplay && e.target.value !== selectedTutorDisplay) {
                          setSelectedTutorId('')
                          setSelectedTutorDisplay('')
                        }
                      }}
                      placeholder="Buscar tutor por nome ou email"
                      className="w-full"
                      required
                      disabled={isEditMode} // Disable in edit mode
                    />
                    {showTutorDropdown && filteredTutors.length > 0 && !isEditMode && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredTutors.map(tutor => (
                          <div
                            key={tutor.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleTutorSelect(tutor)}
                          >
                            <div className="font-medium">{tutor.name}</div>
                            <div className="text-sm text-gray-500">{tutor.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Institution Autocomplete */}
                <div className="space-y-2" ref={institutionDropdownRef}>
                  <label htmlFor="institution" className="text-sm font-medium">
                    Selecionar Instituição
                  </label>
                  <div className="relative">
                    <InputText
                      id="institution"
                      value={institutionSearchTerm || selectedInstitutionDisplay}
                      onChange={(e) => {
                        setInstitutionSearchTerm(e.target.value)
                        setShowInstitutionDropdown(true)
                        if (selectedInstitutionDisplay && e.target.value !== selectedInstitutionDisplay) {
                          setSelectedInstitutionId('')
                          setSelectedInstitutionDisplay('')
                        }
                      }}
                      placeholder="Buscar instituição por nome"
                      className="w-full"
                      required
                    />
                    {showInstitutionDropdown && filteredInstitutions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredInstitutions.map(institution => (
                          <div
                            key={institution.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleInstitutionSelect(institution)}
                          >
                            {institution.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Course Autocomplete with Tooltips */}
                <div className="space-y-2" ref={courseDropdownRef}>
                  <label htmlFor="course" className="text-sm font-medium">
                    Selecionar Cursos
                  </label>
                  
                  {/* Selected Courses as Tooltips */}
                  <div className="flex flex-wrap mb-2">
                    {selectedCourses.map((course) => (
                      <div key={course.id} className="relative">
                        <Tooltip label={course.title} />
                        <button
                          type="button"
                          onClick={() => handleCourseRemove(course.id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          aria-label="Remover curso"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <InputText
                      id="course"
                      value={courseSearchTerm}
                      onChange={(e) => {
                        setCourseSearchTerm(e.target.value)
                        setShowCourseDropdown(true)
                      }}
                      placeholder={selectedInstitutionId ? "Buscar curso por título" : "Selecione uma instituição primeiro"}
                      className="w-full"
                      disabled={!selectedInstitutionId}
                    />
                    {showCourseDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses
                            .filter(course => !selectedCourses.some(selected => selected.id === course.id))
                            .map(course => (
                              <div
                                key={course.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleCourseSelect(course)}
                              >
                                {course.title}
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">
                            {!selectedInstitutionId 
                              ? 'Por favor, selecione uma instituição primeiro' 
                              : 'Nenhum curso encontrado para sua busca'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {courses.length === 0 && selectedInstitutionId && (
                    <p className="text-sm text-gray-500">
                      Nenhum curso disponível para a instituição selecionada
                    </p>
                  )}
                  
                  {!selectedInstitutionId && (
                    <p className="text-sm text-gray-500">
                      Por favor, selecione uma instituição para ver os cursos
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/tutor">
                  <Button className="border bg-white hover:bg-gray-100" type="button">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting 
                    ? (isEditMode ? 'Atualizando...' : 'Associando...') 
                    : (isEditMode ? 'Atualizar Associações' : 'Associar Tutor a Cursos')
                  }
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
