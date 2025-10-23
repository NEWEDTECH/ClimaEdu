'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { TrailForm, CourseManager, StudentManager } from '@/components/trails'
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
import { ImageUpload } from '@/components/upload'

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
                            variant='primary'
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
                                <TrailForm
                                    title={title}
                                    description={description}
                                    coverImageUrl={coverImageUrl}
                                    onTitleChange={setTitle}
                                    onDescriptionChange={setDescription}
                                    onCoverImageUrlChange={setCoverImageUrl}
                                />

                                {/* Upload de Imagem de Capa */}
                                {trail && (
                                    <>
                                        <ImageUpload
                                            imageType="trail"
                                            institutionId={trail.institutionId}
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
                                    selectedCourses={trailCourses}
                                    selectedCourseId={selectedCourseId}
                                    onCourseSelect={(courseId) => {
                                        if (courseId) {
                                            const courseToMove = availableCourses.find(course => course.id === courseId)
                                            if (courseToMove) {
                                                setTrailCourses(prev => [...prev, courseToMove])
                                                setAvailableCourses(prev => prev.filter(course => course.id !== courseId))
                                                setSelectedCourseId('')
                                                setError(null)
                                            }
                                        }
                                    }}
                                    onAddCourse={() => {}}
                                    onRemoveCourse={handleRemoveCourse}
                                    isEditMode={true}
                                />

                                <StudentManager
                                    trailStudents={trailStudents}
                                    filteredStudents={filteredStudents}
                                    searchStudentTerm={searchStudentTerm}
                                    showStudentDropdown={showStudentDropdown}
                                    onSearchChange={(value) => {
                                        setSearchStudentTerm(value)
                                        setShowStudentDropdown(true)
                                    }}
                                    onSearchFocus={() => setShowStudentDropdown(true)}
                                    onRemoveStudent={handleRemoveTrailStudent}
                                    onAddStudent={(student) => {
                                        setTrailStudents(prev => [
                                            ...prev,
                                            {
                                                id: student.id,
                                                name: student.name,
                                                email: student.email.value,
                                                isEnrolled: true
                                            }
                                        ])
                                    }}
                                    onClearSearch={() => setSearchStudentTerm('')}
                                    onHideDropdown={() => setShowStudentDropdown(false)}
                                />

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        variant='primary'
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
