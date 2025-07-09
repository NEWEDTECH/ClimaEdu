'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { GetTrailUseCase } from '@/_core/modules/content/core/use-cases/get-trail/get-trail.use-case'
import { GetTrailInput } from '@/_core/modules/content/core/use-cases/get-trail/get-trail.input'
import { UpdateTrailUseCase } from '@/_core/modules/content/core/use-cases/update-trail/update-trail.use-case'
import { UpdateTrailInput } from '@/_core/modules/content/core/use-cases/update-trail/update-trail.input'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { Trail } from '@/_core/modules/content/core/entities/Trail'
import { EnrollInTrailUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-trail/enroll-in-trail.use-case'
import { EnrollInTrailInput } from '@/_core/modules/enrollment/core/use-cases/enroll-in-trail/enroll-in-trail.input'
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case'
import { ListEnrollmentsInput } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.input'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { User, UserRole } from '@/_core/modules/user/core/entities/User'
import { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository'
import { Tooltip } from '@/components/tooltip'
import { X } from 'lucide-react'

type CourseInfo = {
    id: string
    title: string
    description: string
}

export default function EditTrailPage() {
    const router = useRouter()
    const params = useParams()
    const trailId = params.id as string

    const [trail, setTrail] = useState<Trail | null>(null)
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [coverImageUrl, setCoverImageUrl] = useState<string>('')
    const [availableCourses, setAvailableCourses] = useState<CourseInfo[]>([])
    const [trailCourses, setTrailCourses] = useState<CourseInfo[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Student enrollment states
    const [students, setStudents] = useState<User[]>([])
    const [filteredStudents, setFilteredStudents] = useState<User[]>([])
    const [searchStudentTerm, setSearchStudentTerm] = useState<string>('')
    const [showStudentDropdown, setShowStudentDropdown] = useState<boolean>(false)
    const [trailStudents, setTrailStudents] = useState<Array<{ id: string, name: string, email: string, isEnrolled: boolean }>>([])

    // Load enrolled students for the trail
    const loadTrailStudents = useCallback(async () => {
        if (!trail || trailCourses.length === 0) {
            setTrailStudents([])
            return
        }

        try {
            const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
                Register.enrollment.useCase.ListEnrollmentsUseCase
            )

            const userRepository = container.get<UserRepository>(
                Register.user.repository.UserRepository
            )

            // Get enrollments for all courses in the trail
            const enrollmentPromises = trailCourses.map(async (course) => {
                const input: ListEnrollmentsInput = { courseId: course.id }
                const output = await listEnrollmentsUseCase.execute(input)
                return output.enrollments
            })

            const allEnrollments = (await Promise.all(enrollmentPromises)).flat()

            // Get unique user IDs from enrollments
            const uniqueUserIds = [...new Set(allEnrollments.map(enrollment => enrollment.userId))]

            // Fetch user details for each unique user ID
            const userPromises = uniqueUserIds.map(async (userId) => {
                const user = await userRepository.findById(userId)
                return user
            })

            const allUsers = await Promise.all(userPromises)

            // Filter out null users and only keep students, mark them as enrolled
            const enrolledStudentsList = allUsers
                .filter((user): user is User => user !== null && user.role === UserRole.STUDENT)
                .map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email.value,
                    isEnrolled: true
                }))

            setTrailStudents(enrolledStudentsList)
        } catch (err) {
            console.error('Error fetching enrolled students:', err)
        }
    }, [trail, trailCourses])

    // Load students for the institution
    useEffect(() => {
        const fetchStudents = async () => {
            if (!trail) return

            try {
                const enrollmentRepository = container.get<EnrollmentRepository>(
                    Register.enrollment.repository.EnrollmentRepository
                )

                const userRepository = container.get<UserRepository>(
                    Register.user.repository.UserRepository
                )

                // Get all enrollments for this institution
                const enrollments = await enrollmentRepository.listByInstitution(trail.institutionId)

                // Get unique user IDs from enrollments
                const uniqueUserIds = [...new Set(enrollments.map(enrollment => enrollment.userId))]

                // Fetch user details for each unique user ID
                const studentPromises = uniqueUserIds.map(async (userId) => {
                    const user = await userRepository.findById(userId)
                    return user
                })

                const allUsers = await Promise.all(studentPromises)

                // Filter out null users and only keep students
                const institutionStudents = allUsers.filter((user): user is User =>
                    user !== null && user.role === UserRole.STUDENT
                )

                setStudents(institutionStudents)
                setFilteredStudents(institutionStudents)
            } catch (err) {
                console.error('Error fetching students:', err)
            }
        }

        fetchStudents()
    }, [trail])

    // Load enrolled students when trail courses change
    useEffect(() => {
        loadTrailStudents()
    }, [trail, trailCourses, loadTrailStudents])

    // Filter students based on search term
    useEffect(() => {
        if (searchStudentTerm.trim() === '') {
            setFilteredStudents(students)
        } else {
            const filtered = students.filter(student =>
                student.email.value.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
                student.name.toLowerCase().includes(searchStudentTerm.toLowerCase())
            )
            setFilteredStudents(filtered)
        }
    }, [searchStudentTerm, students])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('#studentSearch') && !target.closest('.student-dropdown')) {
                setShowStudentDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        const fetchTrailData = async () => {
            try {
                setLoading(true)

                // Get trail data
                const getTrailUseCase = container.get<GetTrailUseCase>(
                    Register.content.useCase.GetTrailUseCase
                )

                const trailInput = new GetTrailInput(trailId)
                const trailOutput = await getTrailUseCase.execute(trailInput)

                if (!trailOutput.trail) {
                    setError('Trilha não encontrada')
                    return
                }

                setTrail(trailOutput.trail)
                setTitle(trailOutput.trail.title)
                setDescription(trailOutput.trail.description)
                setCoverImageUrl(trailOutput.trail.coverImageUrl || '')

                // Get all courses for this institution
                const courseRepository = container.get<CourseRepository>(
                    Register.content.repository.CourseRepository
                )

                const allCourses = await courseRepository.listByInstitution(trailOutput.trail.institutionId)

                // Separate courses into available and already in trail
                const trailCourseIds = trailOutput.trail.courseIds
                const coursesInTrail: CourseInfo[] = []
                const coursesAvailable: CourseInfo[] = []

                allCourses.forEach(course => {
                    const courseInfo = {
                        id: course.id,
                        title: course.title,
                        description: course.description
                    }

                    if (trailCourseIds.includes(course.id)) {
                        coursesInTrail.push(courseInfo)
                    } else {
                        coursesAvailable.push(courseInfo)
                    }
                })

                setTrailCourses(coursesInTrail)
                setAvailableCourses(coursesAvailable)
                setError(null)
            } catch (err) {
                console.error('Error fetching trail data:', err)
                setError('Failed to load trail data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        if (trailId) {
            fetchTrailData()
        }
    }, [trailId])

    const handleUpdateTrail = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            setError('O título é obrigatório')
            return
        }

        if (!description.trim()) {
            setError('A descrição é obrigatória')
            return
        }

        if (trailCourses.length === 0) {
            setError('A trilha deve ter pelo menos um curso')
            return
        }

        try {
            setSaving(true)
            setError(null)

            // Update trail information
            const updateTrailUseCase = container.get<UpdateTrailUseCase>(
                Register.content.useCase.UpdateTrailUseCase
            )

            const courseIds = trailCourses.map(course => course.id)

            const input = new UpdateTrailInput(
                trailId,
                title.trim(),
                description.trim(),
                courseIds,
                coverImageUrl.trim() || null
            )

            const output = await updateTrailUseCase.execute(input)
            setTrail(output.trail)

            // Handle student enrollments/removals
            const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
                Register.enrollment.useCase.ListEnrollmentsUseCase
            )

            const enrollmentRepository = container.get<EnrollmentRepository>(
                Register.enrollment.repository.EnrollmentRepository
            )

            const enrollInTrailUseCase = container.get<EnrollInTrailUseCase>(
                Register.enrollment.useCase.EnrollInTrailUseCase
            )

            // Process each student in trailStudents
            for (const student of trailStudents) {
                if (student.isEnrolled) {
                    // Student should be enrolled - check if they need to be enrolled
                    const enrollmentPromises = trailCourses.map(async (course) => {
                        const input: ListEnrollmentsInput = { courseId: course.id }
                        const output = await listEnrollmentsUseCase.execute(input)
                        const existingEnrollment = output.enrollments.find(e => e.userId === student.id)
                        
                        if (!existingEnrollment) {
                            // Need to enroll this student in this course
                            const enrollInput = new EnrollInTrailInput(
                                student.id,
                                trailId,
                                trail!.institutionId
                            )
                            await enrollInTrailUseCase.execute(enrollInput)
                        }
                    })
                    await Promise.all(enrollmentPromises)
                } else {
                    // Student should be removed - remove from all courses
                    const removalPromises = trailCourses.map(async (course) => {
                        const input: ListEnrollmentsInput = { courseId: course.id }
                        const output = await listEnrollmentsUseCase.execute(input)
                        const enrollment = output.enrollments.find(e => e.userId === student.id)
                        
                        if (enrollment) {
                            await enrollmentRepository.delete(enrollment.id)
                        }
                    })
                    await Promise.all(removalPromises)
                }
            }

            // Refresh trail students list
            await loadTrailStudents()

            // Show success message
            console.log('Trail updated successfully')
        } catch (err) {
            console.error('Error updating trail:', err)
            setError('Failed to update trail. Please try again later.')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveCourse = (courseId: string) => {
        // Move course from trail courses to available (local state only)
        const courseToMove = trailCourses.find(course => course.id === courseId)
        if (courseToMove) {
            setAvailableCourses(prev => [...prev, courseToMove])
            setTrailCourses(prev => prev.filter(course => course.id !== courseId))
        }
    }

    const handleRemoveTrailStudent = (studentId: string) => {
        setTrailStudents(prev => prev.filter(student => student.id !== studentId))
    }

    const handleCancel = () => {
        router.push('/admin/trails')
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

    if (error && !trail) {
        return (
            <ProtectedContent>
                <DashboardLayout>
                    <div className="container mx-auto p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Erro!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
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
                        <h1 className="text-3xl font-bold">Editar Trilha</h1>
                        <Button
                            onClick={handleCancel}
                            className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
                        >
                            Voltar
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Erro!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    {/* Trail Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Trilha</CardTitle>
                            <CardDescription>
                                Edite as informações básicas da trilha
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateTrail} className="space-y-6">
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
                                    <label htmlFor="coverImageUrl" className="block text-sm font-medium mb-2">
                                        URL da Imagem de Capa
                                    </label>
                                    <InputText
                                        id="coverImageUrl"
                                        type="url"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        value={coverImageUrl}
                                        onChange={(e) => setCoverImageUrl(e.target.value)}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Opcional. Insira a URL de uma imagem para usar como capa da trilha.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Gerenciar Cursos</h3>
                                    
                                    {/* Selected Courses */}
                                    {trailCourses.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium mb-3">Cursos na Trilha ({trailCourses.length})</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {trailCourses.map((course) => (
                                                    <div key={course.id} className="relative bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                                        <Tooltip label={course.title}  />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCourse(course.id)}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                                            aria-label="Remover curso"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="courseSelect" className="block text-sm font-medium mb-2">
                                            Adicionar Curso
                                        </label>
                                        <select
                                            id="courseSelect"
                                            value={selectedCourseId}
                                            onChange={(e) => {
                                                const courseId = e.target.value
                                                if (courseId) {
                                                    // Find and add the course immediately
                                                    const courseToMove = availableCourses.find(course => course.id === courseId)
                                                    if (courseToMove) {
                                                        setTrailCourses(prev => [...prev, courseToMove])
                                                        setAvailableCourses(prev => prev.filter(course => course.id !== courseId))
                                                        setSelectedCourseId('')
                                                        setError(null)
                                                    }
                                                }
                                            }}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                        >
                                            <option value="">Selecione um curso para adicionar</option>
                                            {availableCourses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Selecione um curso para adicionar à trilha
                                        </p>
                                    </div>
                                </div>

                                {/* Student Enrollment Section */}
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
                                                            onClick={() => handleRemoveTrailStudent(student.id)}
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
                                            onChange={(e) => {
                                                setSearchStudentTerm(e.target.value)
                                                setShowStudentDropdown(true)
                                            }}
                                            onFocus={() => setShowStudentDropdown(true)}
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
                                                                setTrailStudents(prev => [
                                                                    ...prev,
                                                                    {
                                                                        id: student.id,
                                                                        name: student.name,
                                                                        email: student.email.value,
                                                                        isEnrolled: true
                                                                    }
                                                                ])
                                                                setSearchStudentTerm('')
                                                                setShowStudentDropdown(false)
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

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
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
