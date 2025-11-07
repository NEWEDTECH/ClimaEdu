'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/card'
import { SelectComponent } from '@/components/select'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { EnrollInCourseUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-course/enroll-in-course.use-case'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { Course } from '@/_core/modules/content/core/entities/Course'
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository'
import { Institution } from '@/_core/modules/institution/core/entities/Institution'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { LoadingSpinner } from '@/components/loader'
import { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository'
import { Enrollment } from '@/_core/modules/enrollment/core/entities/Enrollment'

export default function StudentEnrollmentPage() {
  const router = useRouter()
  const params = useParams()

  // Extract the ID and action from params
  const id = params.id as string
  const action = params.action as string

  // Determine if we're editing a student or creating a new one
  const isEditingStudent = id
  const isCreatingStudent = action === 'create-edit' && !id

  // Student data for editing
  const [studentData, setStudentData] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null)

  const [students, setStudents] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string, title: string, institutionId: string }>>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])

  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')

  const [allSelectedCourses, setAllSelectedCourses] = useState<Array<{ id: string, title: string, institutionId: string }>>([])

  const [filteredCourses, setFilteredCourses] = useState<Array<{ id: string, title: string, institutionId: string }>>([])

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([])

  // Fetch students, courses, institutions, and student data (if editing) on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch students (only those with STUDENT role)
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const enrollmentRepository = container.get<EnrollmentRepository>(
          Register.enrollment.repository.EnrollmentRepository
        )

        // Fetch institutions
        const institutionsList = await institutionRepository.list()
        const institutionsForDropdown = institutionsList.map((institution: Institution) => ({
          id: institution.id,
          name: institution.name
        }))
        setInstitutions(institutionsForDropdown)

        // Fetch all courses
        let allCourses: Course[] = []
        for (const institution of institutionsForDropdown) {
          const institutionCourses = await courseRepository.listByInstitution(institution.id)
          allCourses = [...allCourses, ...institutionCourses]
        }

        const coursesForDropdown = allCourses.map((course: Course) => ({
          id: course.id,
          title: course.title,
          institutionId: course.institutionId
        }))
        setCourses(coursesForDropdown)

        // If we have an ID, fetch the student data and enrollments
        if (id) {
          // Check if it's a student ID
          const student = await userRepository.findById(id)

          if (student) {
            // It's a student ID, fetch student data and enrollments
            setStudentData({
              id: student.id,
              name: student.name,
              email: student.email.value,
              role: student.role
            })

            // Fetch student enrollments
            const enrollments = await enrollmentRepository.listByUser(student.id)
            setStudentEnrollments(enrollments)

            // Set selected student ID
            setSelectedStudentId(student.id)

            // Get courses for this student
            const studentCourses = []
            for (const enrollment of enrollments) {
              const course = coursesForDropdown.find(c => c.id === enrollment.courseId)
              if (course) {
                studentCourses.push(course)
              }
            }

            // Set selected courses
            setAllSelectedCourses(studentCourses)
            setSelectedCourseIds(studentCourses.map(c => c.id))

            // Set institution if student has enrollments
            if (studentCourses.length > 0) {
              const institutionId = studentCourses[0].institutionId
              setSelectedInstitutionId(institutionId)
            } else if (institutionsForDropdown.length > 0) {
              // Default to first institution if no enrollments
              setSelectedInstitutionId(institutionsForDropdown[0].id)
            }
          } else {
            // Not a student ID, check if it's an enrollment ID
            const enrollment = await enrollmentRepository.findById(id)

            if (enrollment) {
              // It's an enrollment ID
              setStudentEnrollments([enrollment])

              // Get student
              const student = await userRepository.findById(enrollment.userId)
              if (student) {
                setSelectedStudentId(student.id)
              }

              // Get course
              const course = coursesForDropdown.find(c => c.id === enrollment.courseId)
              if (course) {
                setAllSelectedCourses([course])
                setSelectedCourseIds([course.id])

                // Set institution
                setSelectedInstitutionId(course.institutionId)
              }
            } else {
              // ID not found
              setError('ID não encontrado')
            }
          }
        } else if (institutionsForDropdown.length > 0) {
          // No ID, set default institution
          setSelectedInstitutionId(institutionsForDropdown[0].id)
        }

        // Fetch all students
        const studentUsers = await userRepository.listByType(UserRole.STUDENT)
        const studentsForDropdown = studentUsers.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email.value
        }))
        setStudents(studentsForDropdown)

        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Falha ao carregar dados. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Filter courses, institutions, and students based on search terms

  // Update filtered courses when institution or courses change
  useEffect(() => {
    if (selectedInstitutionId) {
      const filtered = courses.filter(course => course.institutionId === selectedInstitutionId)
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses([])
    }
  }, [selectedInstitutionId, courses])

  // Update selected course IDs and all selected courses when filtered courses change
  // This is separate from the above effect to avoid circular dependencies
  useEffect(() => {
    if (selectedInstitutionId && !id) { // Only apply this logic when not editing
      // Keep only the course IDs that are still in the filtered list
      const validIds = selectedCourseIds.filter(id =>
        filteredCourses.some(course => course.id === id)
      )

      if (validIds.length !== selectedCourseIds.length) {
        setSelectedCourseIds(validIds)

        // Update all selected courses
        const updatedSelectedCourses = allSelectedCourses.filter(course =>
          course.institutionId !== selectedInstitutionId || validIds.includes(course.id)
        )

        setAllSelectedCourses(updatedSelectedCourses)
      }
    }
  }, [filteredCourses, selectedCourseIds, allSelectedCourses, selectedInstitutionId, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Different validation and submission logic based on the mode
    if ((isEditingStudent || isCreatingStudent) && studentData) {
      // Validate student data
      if (!studentData.name || !studentData.email) {
        setError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        // Update student data
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )

        if (isEditingStudent) {
          // Get the original user to preserve other properties
          const originalUser = await userRepository.findById(studentData.id)

          if (!originalUser) {
            throw new Error('Estudante não encontrado')
          }

          // Update the user's properties
          originalUser.updateName(studentData.name)

          // Create a new Email object with the updated value
          const Email = (await import('@/_core/modules/user/core/entities/Email')).Email
          const newEmail = Email.create(studentData.email)
          originalUser.updateEmail(newEmail)

          // Handle enrollments if courses have changed
          const enrollmentRepository = container.get<EnrollmentRepository>(
            Register.enrollment.repository.EnrollmentRepository
          )

          // Get the EnrollInCourseUseCase for adding new enrollments
          const enrollInCourseUseCase = container.get<EnrollInCourseUseCase>(
            Register.enrollment.useCase.EnrollInCourseUseCase
          )

          // If editing a student and all courses are removed, delete all enrollments
          if (isEditingStudent && selectedCourseIds.length === 0) {
            console.log("Removing all courses - completely removing student enrollments")
            
            // Completely remove all enrollments to ensure student is removed from courses
            for (const enrollment of studentEnrollments) {
              console.log(`Deleting enrollment ${enrollment.id} for course ${enrollment.courseId}`)
              // Completely delete the enrollment from the database
              await enrollmentRepository.delete(enrollment.id)
            }
          } 
          // If there are existing enrollments, handle both removals and additions
          else if (isEditingStudent) {
            // Get current course IDs from enrollments
            const currentEnrollmentIds = studentEnrollments.map(e => e.courseId)
            
            // Find courses that were removed (in enrollments but not in selected courses)
            const coursesToRemove = currentEnrollmentIds.filter(id => !selectedCourseIds.includes(id))
            
            // Find courses that were added (in selected courses but not in enrollments)
            const coursesToAdd = selectedCourseIds.filter(id => !currentEnrollmentIds.includes(id))
            
            console.log("Courses to remove:", coursesToRemove)
            console.log("Courses to add:", coursesToAdd)
            
            // Delete enrollments for removed courses
            for (const courseId of coursesToRemove) {
              const enrollment = studentEnrollments.find(e => e.courseId === courseId)
              if (enrollment) {
                console.log(`Deleting enrollment ${enrollment.id} for course ${courseId}`)
                // Completely delete the enrollment from the database
                await enrollmentRepository.delete(enrollment.id)
              }
            }
            
            // Add enrollments for new courses
            for (const courseId of coursesToAdd) {
              console.log(`Enrolling student in course ${courseId}`)
              // Use the EnrollInCourseUseCase to create a new enrollment
              await enrollInCourseUseCase.execute({
                userId: studentData.id,
                courseId: courseId,
                institutionId: selectedInstitutionId
              })
            }
          }

          // Save the updated user
          await userRepository.save(originalUser)

          setSuccessMessage('Dados do estudante atualizados com sucesso')
        } else {
          // Create a new student
          // This would need to be implemented based on your application's requirements
          // For now, we'll just show a success message
          setSuccessMessage('Estudante criado com sucesso')
        }

        // Wait a bit before redirecting
        setTimeout(() => {
          router.push('/admin/student')
        }, 2000)
      } catch (err) {
        console.error('Error updating student:', err)
        setError(err instanceof Error ? err.message : 'Falha ao atualizar estudante. Por favor, tente novamente.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Enrollment validation and submission
      if (!selectedStudentId) {
        setError('Por favor, selecione um estudante')
        return
      }

      if (!isEditingStudent && selectedCourseIds.length === 0) {
        setError('Por favor, selecione pelo menos um curso')
        return
      }

      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const enrollInCourseUseCase = container.get<EnrollInCourseUseCase>(
          Register.enrollment.useCase.EnrollInCourseUseCase
        )

        // Enroll student in all selected courses

        const enrollmentPromises = selectedCourseIds.map(courseId =>
          enrollInCourseUseCase.execute({
            userId: selectedStudentId,
            courseId: courseId,
            institutionId: selectedInstitutionId
          })
        )

        await Promise.all(enrollmentPromises)

        setSuccessMessage(`Estudante inscrito com sucesso em ${selectedCourseIds.length} curso(s)`)

        // Reset form
        setSelectedStudentId('')

        // Wait a bit before redirecting
        setTimeout(() => {
          router.push('/admin/student')
        }, 2000)
      } catch (err) {
        console.error('Error enrolling student:', err)
        setError(err instanceof Error ? err.message : 'Falha ao inscrever estudante. Por favor, tente novamente.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Function to add a course to the selected courses
  const addCourse = (course: { id: string, title: string, institutionId: string }) => {
    if (!selectedCourseIds.includes(course.id)) {
      setSelectedCourseIds(prev => [...prev, course.id])
      setAllSelectedCourses(prev => [...prev, course])
    }
  }

  // Function to remove a course from the selected courses
  const removeCourse = (courseId: string) => {
    setSelectedCourseIds(prev => prev.filter(id => id !== courseId))
    setAllSelectedCourses(prev => prev.filter(c => c.id !== courseId))
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
    );
  }

  if (error && id && !studentData && studentEnrollments.length === 0) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href="/admin/student">
                  <Button className='hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3'>Voltar para Lista de Estudantes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {id ? 'Editar Estudante' : 'Inscrever Estudante em Curso'}
            </h1>
            <Link href="/admin/student">
              <Button variant='primary'>Voltar</Button>
            </Link>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>
                  {id ? 'Informações do Estudante' : 'Informações de Inscrição'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
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

                <div className="space-y-4">
                  {/* Student selection/display */}
                  <div className="space-y-2">
                    <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-700 dark:text-white">
                      Estudante *
                    </label>
                    <div className="relative">
                      {id && studentData ? (
                        <InputText
                          id="studentEmail"
                          type="email"
                          placeholder="Email do estudante"
                          value={studentData.email}
                          onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                          className="mb-2"
                          required
                        />
                      ) : (
                        <SelectComponent
                          value={selectedStudentId}
                          onChange={(studentId) => {
                            setSelectedStudentId(studentId)
                          }}
                          options={students.map(student => ({
                            value: student.id,
                            label: `${student.name} (${student.email})`
                          }))}
                          placeholder="Selecione um estudante"
                          className="mb-2"
                        />
                      )}
                    </div>

                    {/* Student name field */}
                    {id && studentData ? (
                      <div className="mt-4">
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-white">
                          Nome do Estudante *
                        </label>
                        <InputText
                          id="studentName"
                          type="text"
                          value={studentData.name}
                          onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                          className="w-full mt-1"
                          required
                        />
                      </div>
                    ) : selectedStudentId && (
                      <div className="text-sm text-gray-600">
                        Estudante selecionado: {students.find(s => s.id === selectedStudentId)?.name}
                      </div>
                    )}
                  </div>

                  {/* Institution selection */}
                  <div className="space-y-2">
                    <label htmlFor="institutionSearch" className="block text-sm font-medium text-gray-700 dark:text-white">
                      Instituição *
                    </label>
                    <div className="relative">
                      <SelectComponent
                        value={selectedInstitutionId}
                        onChange={(institutionId) => {
                          setSelectedInstitutionId(institutionId)
                        }}
                        options={institutions.map(institution => ({
                          value: institution.id,
                          label: institution.name
                        }))}
                        placeholder="Selecione uma instituição"
                        className="mb-2"
                      />
                    </div>
                  </div>

                  {/* Course selection */}
                  <div className="space-y-2">
                    <label htmlFor="courseSearch" className="block text-sm font-medium text-gray-700 dark:text-white">
                      Cursos *
                    </label>

                    {/* Display selected courses */}
                    {allSelectedCourses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-3">Cursos Selecionados ({allSelectedCourses.length})</h4>
                        <div 
                          className={`space-y-2 ${
                            allSelectedCourses.length >= 5
                              ? 'max-h-96 overflow-y-scroll border border-gray-200 rounded-lg p-2 bg-gray-50' 
                              : ''
                          }`}
                          style={allSelectedCourses.length >= 5 ? { maxHeight: '400px' } : {}}
                        >
                          {allSelectedCourses.map((course) => (
                            <div key={course.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{course.title}</div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeCourse(course.id)}
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

                    <div className="relative">
                      <SelectComponent
                        value=""
                        onChange={(courseId) => {
                          const course = filteredCourses.find(c => c.id === courseId)
                          if (course && !selectedCourseIds.includes(course.id)) {
                            addCourse(course)
                          }
                        }}
                        options={filteredCourses
                          .filter(course => !selectedCourseIds.includes(course.id))
                          .map(course => ({
                            value: course.id,
                            label: course.title
                          }))}
                        placeholder={filteredCourses.length > 0 ? "Selecione um curso para adicionar" : "Selecione uma instituição primeiro"}
                        className="mb-2"
                        disabled={filteredCourses.length === 0}
                      />
                    </div>

                    <p className="text-gray-500 text-xs">
                      {id ? 'Cursos em que o estudante está inscrito' : 'Selecione um ou mais cursos para inscrever o estudante'}
                    </p>

                    {filteredCourses.length === 0 && selectedInstitutionId && (
                      <p className="text-sm text-red-500">Nenhum curso disponível para esta instituição</p>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/student">
                  <Button variant='secondary' type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant='primary'
                  //disabled={
                  //  isSubmitting ||
                  //  (!isEditingStudent
                  //    ? (!selectedStudentId || selectedCourseIds.length === 0)
                  //    : !selectedStudentId)
                  //}

                >
                  {isSubmitting
                    ? (id ? 'Salvando...' : 'Inscrevendo...')
                    : (id ? 'Salvar' : 'Inscrever Estudante')
                  }
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
