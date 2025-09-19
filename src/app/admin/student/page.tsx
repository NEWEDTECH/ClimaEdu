'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs/tabs'
import { TabsTrigger } from '@/components/tabs/TabsTrigger'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { LoadingSpinner } from '@/components/loader'
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository'
import { X } from 'lucide-react'

type StudentWithCourses = {
  id: string;
  name: string;
  email: string;
  courses: Array<{
    id: string;
    title: string;
  }>;
  enrollmentDate: Date;
  status: string;
};

type Intitutions = {
  id: string;
  name: string;
}

export default function StudentPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Search filters
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [courseSearchTerm, setCourseSearchTerm] = useState('')
  const [institutionSearchTerm, setInstitutionSearchTerm] = useState('')
  
  // Dropdown states
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false)
  
  // Filter options
  const [courseOptions, setCourseOptions] = useState<Array<{id: string, title: string, institutionId: string}>>([])
  const [institutionOptions, setInstitutionOptions] = useState<Array<{id: string, name: string}>>([])
  
  // Selected filters
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [students, setStudents] = useState<StudentWithCourses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch all enrollments and group by student
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const enrollmentRepository = container.get<EnrollmentRepository>(
          Register.enrollment.repository.EnrollmentRepository
        )
        
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        // Get all students directly
        const studentUsers = await userRepository.listByType(UserRole.STUDENT)
        
        // For each student, get their enrollments
        const studentsWithCourses: StudentWithCourses[] = []
        
        for (const student of studentUsers) {
          const enrollments = await enrollmentRepository.listByUser(student.id)
          
          if (enrollments.length > 0) {
            const coursesPromises = enrollments.map(async (enrollment) => {
              const course = await courseRepository.findById(enrollment.courseId)
              return course ? { id: course.id, title: course.title } : null
            })
            
            const courses = (await Promise.all(coursesPromises)).filter(Boolean) as Array<{id: string, title: string}>
            
            // Get the earliest enrollment date for this student
            const earliestEnrollment = enrollments.reduce((earliest, current) => {
              return current.enrolledAt < earliest.enrolledAt ? current : earliest
            }, enrollments[0])
            
            studentsWithCourses.push({
              id: student.id,
              name: student.name,
              email: student.email.value,
              courses,
              enrollmentDate: earliestEnrollment.enrolledAt,
              status: enrollments.some(e => e.status === EnrollmentStatus.ENROLLED) ? 'active' : 'inactive'
            })
          } else {
            // Student with no enrollments
            studentsWithCourses.push({
              id: student.id,
              name: student.name,
              email: student.email.value,
              courses: [],
              enrollmentDate: new Date(),
              status: 'inactive'
            })
          }
        }
        
        
        setStudents(studentsWithCourses)
        setError(null)
      } catch (err) {
        console.error('Error fetching enrollments:', err)
        setError('Falha ao carregar dados dos estudantes. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Load course options
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )
        
        // Load institutions
        const institutions = await institutionRepository.list()
        setInstitutionOptions(institutions.map((institution: Intitutions) => ({
          id: institution.id,
          name: institution.name
        })))
        
        // Load courses from all institutions
        const allCourses: Array<{id: string, title: string, institutionId: string}> = []
        for (const institution of institutions) {
          const courses = await courseRepository.listByInstitution(institution.id)
          allCourses.push(...courses.map(course => ({
            id: course.id,
            title: course.title,
            institutionId: institution.id
          })))
        }
        setCourseOptions(allCourses)
        
      } catch (err) {
        console.error('Error loading filter options:', err)
      }
    }
    
    loadFilterOptions()
  }, [])
  
  // Filter students based on all filters
  const filteredStudents = students.filter(student => {
    // Filter by student email
    const matchesStudentEmail = !selectedStudentEmail || 
      student.email.toLowerCase() === selectedStudentEmail.toLowerCase()
    
    // Filter by course
    const matchesCourse = !selectedCourseId || 
      student.courses.some(course => course.id === selectedCourseId)
    
    // Filter by institution (we would need to add institution info to the student object)
    const matchesInstitution = !selectedInstitutionId || 
      student.courses.some(course => {
        const courseOption = courseOptions.find(c => c.id === course.id)
        return courseOption && courseOption.institutionId === selectedInstitutionId
      })
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    
    return matchesStudentEmail && matchesCourse && matchesInstitution && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Configuração de estudantes</h1>
            <Link href="/admin/student/create-edit">
              <Button variant='primary'>Inscrever estudante em um curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estudantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div> 
                )}
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label htmlFor="studentFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Estudante
                          </label>
                          <div className="relative">
                            <InputText
                              id="studentFilter"
                              type="text"
                              placeholder="Buscar por email do estudante..."
                              value={studentSearchTerm}
                              onChange={(e) => {
                                setStudentSearchTerm(e.target.value);
                                setShowStudentDropdown(true);
                              }}
                              onFocus={() => setShowStudentDropdown(true)}
                              className="w-full"
                            />
                            
                            {showStudentDropdown && studentSearchTerm.trim() !== '' && (
                              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {students
                                  .filter(student => 
                                    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
                                  )
                                  .map((student) => (
                                    <div
                                      key={student.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        setSelectedStudentEmail(student.email);
                                        setStudentSearchTerm(student.email);
                                        setShowStudentDropdown(false);
                                      }}
                                    >
                                      <div className="font-medium">{student.name}</div>
                                      <div className="text-sm text-gray-500">{student.email}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {selectedStudentEmail && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                {selectedStudentEmail}
                                <Button 
                                  onClick={() => {
                                    setSelectedStudentEmail('');
                                    setStudentSearchTerm('');
                                  }}
                                  className="ml-1 text-blue-800 hover:text-blue-900"
                                >
                                  <X size={12} />
                                </Button>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Curso
                          </label>
                          <div className="relative">
                            <InputText
                              id="courseFilter"
                              type="text"
                              placeholder="Buscar por nome do curso..."
                              value={courseSearchTerm}
                              onChange={(e) => {
                                setCourseSearchTerm(e.target.value);
                                setShowCourseDropdown(true);
                              }}
                              onFocus={() => setShowCourseDropdown(true)}
                              className="w-full"
                            />
                            
                            {showCourseDropdown && courseSearchTerm.trim() !== '' && (
                              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {courseOptions
                                  .filter(course => 
                                    course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
                                  )
                                  .map((course) => (
                                    <div
                                      key={course.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        setSelectedCourseId(course.id);
                                        setCourseSearchTerm(course.title);
                                        setShowCourseDropdown(false);
                                      }}
                                    >
                                      <div className="font-medium">{course.title}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {selectedCourseId && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                {courseOptions.find(c => c.id === selectedCourseId)?.title}
                                <Button 
                                  onClick={() => {
                                    setSelectedCourseId('');
                                    setCourseSearchTerm('');
                                  }}
                                  className="ml-1 text-blue-800 hover:text-blue-900"
                                >
                                  <X size={12} />
                                </Button>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label htmlFor="institutionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Instituição
                          </label>
                          <div className="relative">
                            <InputText
                              id="institutionFilter"
                              type="text"
                              placeholder="Buscar por nome da instituição..."
                              value={institutionSearchTerm}
                              onChange={(e) => {
                                setInstitutionSearchTerm(e.target.value);
                                setShowInstitutionDropdown(true);
                              }}
                              onFocus={() => setShowInstitutionDropdown(true)}
                              className="w-full"
                            />
                            
                            {showInstitutionDropdown && institutionSearchTerm.trim() !== '' && (
                              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {institutionOptions
                                  .filter(institution => 
                                    institution.name.toLowerCase().includes(institutionSearchTerm.toLowerCase())
                                  )
                                  .map((institution) => (
                                    <div
                                      key={institution.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        setSelectedInstitutionId(institution.id);
                                        setInstitutionSearchTerm(institution.name);
                                        setShowInstitutionDropdown(false);
                                      }}
                                    >
                                      <div className="font-medium">{institution.name}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          {selectedInstitutionId && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                {institutionOptions.find(i => i.id === selectedInstitutionId)?.name}
                                <Button 
                                  onClick={() => {
                                    setSelectedInstitutionId('');
                                    setInstitutionSearchTerm('');
                                  }}
                                  className="ml-1 text-blue-800 hover:text-blue-900"
                                >
                                  <X size={12} />
                                </Button>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex items-end">
                          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                            <TabsList className="w-full">
                              <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                              <TabsTrigger value="active" className="flex-1">Ativos</TabsTrigger>
                              <TabsTrigger value="inactive" className="flex-1">Inativos</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                      
                      {(selectedStudentEmail || selectedCourseId || selectedInstitutionId) && (
                        <div className="flex justify-end">
                          <Button
                            className="text-sm"
                            onClick={() => {
                              setSelectedStudentEmail('');
                              setStudentSearchTerm('');
                              setSelectedCourseId('');
                              setCourseSearchTerm('');
                              setSelectedInstitutionId('');
                              setInstitutionSearchTerm('');
                            }}
                          >
                            Limpar Filtros
                          </Button>
                        </div>
                      )}
                    </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Nome</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Cursos</th>
                        <th className="text-left py-3 px-4">Data de Inscrição</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4">{student.name}</td>
                          <td className="py-3 px-4">{student.email}</td>
                          <td className="py-3 px-4">
                            {student.courses.length > 1 
                              ? `${student.courses.length} cursos` 
                              : student.courses.length === 1 
                                ? student.courses[0].title 
                                : 'Nenhum curso'}
                          </td>
                          <td className="py-3 px-4">{student.enrollmentDate.toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              student.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {student.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/student/create-edit/${student.id}`}>
                                <Button variant='primary'>Editar</Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum estudante encontrado com os critérios de busca.
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
