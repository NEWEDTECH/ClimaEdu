'use client'

import { useState, useEffect } from 'react'
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
    const [selectedStudents, setSelectedStudents] = useState<Array<{ id: string, name: string, email: string }>>([])

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
                courseIds
            )

            const output = await updateTrailUseCase.execute(input)
            setTrail(output.trail)

            // Enroll selected students if any
            if (selectedStudents.length > 0) {
                const enrollInTrailUseCase = container.get<EnrollInTrailUseCase>(
                    Register.enrollment.useCase.EnrollInTrailUseCase
                )

                // Enroll each selected student
                const enrollmentPromises = selectedStudents.map(async (student) => {
                    const enrollInput = new EnrollInTrailInput(
                        student.id,
                        trailId,
                        trail!.institutionId
                    )
                    return await enrollInTrailUseCase.execute(enrollInput)
                })

                await Promise.all(enrollmentPromises)

                // Clear selected students after successful enrollment
                setSelectedStudents([])
                
                console.log(`Successfully enrolled ${selectedStudents.length} students in trail`)
            }

            // Show success message (you could add a toast notification here)
            console.log('Trail updated successfully')
        } catch (err) {
            console.error('Error updating trail:', err)
            setError('Failed to update trail. Please try again later.')
        } finally {
            setSaving(false)
        }
    }

    const handleAddCourse = () => {
        if (!selectedCourseId) {
            setError('Selecione um curso para adicionar')
            return
        }

        // Move course from available to trail courses (local state only)
        const courseToMove = availableCourses.find(course => course.id === selectedCourseId)
        if (courseToMove) {
            setTrailCourses(prev => [...prev, courseToMove])
            setAvailableCourses(prev => prev.filter(course => course.id !== selectedCourseId))
            setSelectedCourseId('')
            setError(null)
        }
    }

    const handleRemoveCourse = (courseId: string) => {
        if (!confirm('Tem certeza que deseja remover este curso da trilha?')) {
            return
        }

        // Move course from trail courses to available (local state only)
        const courseToMove = trailCourses.find(course => course.id === courseId)
        if (courseToMove) {
            setAvailableCourses(prev => [...prev, courseToMove])
            setTrailCourses(prev => prev.filter(course => course.id !== courseId))
        }
    }


    const handleRemoveStudent = (studentId: string) => {
        setSelectedStudents(prev => prev.filter(student => student.id !== studentId))
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
                                            onClick={handleAddCourse}
                                            disabled={!selectedCourseId}
                                            className="bg-green-600 text-white shadow-xs hover:bg-green-700"
                                        >
                                            Adicionar
                                        </Button>
                                    </div>
                                </div>

                                {/* Current Courses */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Cursos na Trilha ({trailCourses.length})</h3>
                                    {trailCourses.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Nenhum curso adicionado à trilha ainda
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {trailCourses.map((course, index) => (
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


                                {/* Student Enrollment Section */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Matricular Estudantes</h3>
                                    
                                    {/* Selected Students */}
                                    {selectedStudents.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium mb-3">Estudantes Selecionados ({selectedStudents.length})</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudents.map((student) => (
                                                    <div key={student.id} className="relative bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                                        <Tooltip label={`${student.name} - ${student.email}`} />
                                                        <span className="text-sm font-medium text-blue-800 pr-6">{student.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveStudent(student.id)}
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
                                            Buscar Estudante
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
                                                    .filter(student => !selectedStudents.some(selected => selected.id === student.id))
                                                    .map((student) => (
                                                        <div
                                                            key={student.id}
                                                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => {
                                                                setSelectedStudents(prev => [
                                                                    ...prev,
                                                                    {
                                                                        id: student.id,
                                                                        name: student.name,
                                                                        email: student.email.value
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
