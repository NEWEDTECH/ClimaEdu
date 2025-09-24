'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SelectComponent } from '@/components/select'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { GetClassUseCase } from '@/_core/modules/enrollment/core/use-cases/get-class/get-class.use-case'
import { GetClassInput } from '@/_core/modules/enrollment/core/use-cases/get-class/get-class.input'
import { UpdateClassUseCase } from '@/_core/modules/enrollment/core/use-cases/update-class/update-class.use-case'
import { UpdateClassInput } from '@/_core/modules/enrollment/core/use-cases/update-class/update-class.input'
import { AddEnrollmentToClassUseCase } from '@/_core/modules/enrollment/core/use-cases/add-enrollment-to-class/add-enrollment-to-class.use-case'
import { AddEnrollmentToClassInput } from '@/_core/modules/enrollment/core/use-cases/add-enrollment-to-class/add-enrollment-to-class.input'
import { RemoveEnrollmentFromClassUseCase } from '@/_core/modules/enrollment/core/use-cases/remove-enrollment-from-class/remove-enrollment-from-class.use-case'
import { RemoveEnrollmentFromClassInput } from '@/_core/modules/enrollment/core/use-cases/remove-enrollment-from-class/remove-enrollment-from-class.input'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { User, UserRole } from '@/_core/modules/user/core/entities/User'
import { Class } from '@/_core/modules/enrollment/core/entities/Class'

export default function EditTurmaPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [newEnrollmentId, setNewEnrollmentId] = useState<string>('')
  const [availableStudents, setAvailableStudents] = useState<Array<{ id: string, email: string }>>([])
  const [currentEnrollments, setCurrentEnrollments] = useState<Array<{ id: string, userEmail: string }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [addingEnrollment, setAddingEnrollment] = useState<boolean>(false)
  const [removingEnrollmentId, setRemovingEnrollmentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return
      
      try {
        setLoading(true)

        const getClassUseCase = container.get<GetClassUseCase>(
          Register.enrollment.useCase.GetClassUseCase
        )
        
        const input = new GetClassInput(classId)
        const output = await getClassUseCase.execute(input)
        
        if (!output.klass) {
          throw new Error('Class not found')
        }
        
        setClassData(output.klass)
        setFormData({
          name: output.klass.name
        })
        
        setError(null)
      } catch (err) {
        console.error('Error fetching class:', err)
        setError('Failed to load class data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchClass()
  }, [classId])

  useEffect(() => {
    const fetchAvailableStudents = async () => {
      if (!classData?.institutionId) return
      
      try {
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        // List all users with STUDENT role
        const students = await userRepository.listByType(UserRole.STUDENT)
        
        const studentsForSelect = students.map((student: User) => ({
          id: student.id,
          email: student.email.value
        }))
        
        setAvailableStudents(studentsForSelect)
      } catch (err) {
        console.error('Error fetching available students:', err)
      }
    }
    
    fetchAvailableStudents()
  }, [classData])

  useEffect(() => {
    const fetchCurrentEnrollments = async () => {
      if (!classData?.enrollmentIds.length) {
        setCurrentEnrollments([])
        return
      }
      
      try {
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        // For each enrollment ID, we need to find the corresponding user
        // Since enrollment IDs are user IDs in this case, we can fetch users directly
        const enrollmentsWithEmails = await Promise.all(
          classData.enrollmentIds.map(async (enrollmentId) => {
            try {
              const user = await userRepository.findById(enrollmentId)
              return {
                id: enrollmentId,
                userEmail: user?.email.value || 'Email não encontrado'
              }
            } catch (err) {
              console.error(`Error fetching user for enrollment ${enrollmentId}:`, err)
              return {
                id: enrollmentId,
                userEmail: 'Erro ao carregar email'
              }
            }
          })
        )
        
        setCurrentEnrollments(enrollmentsWithEmails)
      } catch (err) {
        console.error('Error fetching current enrollments:', err)
      }
    }
    
    fetchCurrentEnrollments()
  }, [classData?.enrollmentIds])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nome da turma é obrigatório')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      const updateClassUseCase = container.get<UpdateClassUseCase>(
        Register.enrollment.useCase.UpdateClassUseCase
      )
      
      const input = new UpdateClassInput(
        classId,
        formData.name.trim()
      )
      
      await updateClassUseCase.execute(input)
      
      // Redirect to turmas list
      router.push('/admin/turmas')
      
    } catch (err) {
      console.error('Error updating class:', err)
      setError('Erro ao atualizar turma. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEnrollment = async () => {
    if (!newEnrollmentId.trim()) {
      setError('ID da matrícula é obrigatório')
      return
    }

    try {
      setAddingEnrollment(true)
      setError(null)
      
      const addEnrollmentUseCase = container.get<AddEnrollmentToClassUseCase>(
        Register.enrollment.useCase.AddEnrollmentToClassUseCase
      )
      
      const input = new AddEnrollmentToClassInput(
        classId,
        newEnrollmentId.trim()
      )
      
      await addEnrollmentUseCase.execute(input)
      
      // Refresh class data
      const getClassUseCase = container.get<GetClassUseCase>(
        Register.enrollment.useCase.GetClassUseCase
      )
      
      const getInput = new GetClassInput(classId)
      const output = await getClassUseCase.execute(getInput)
      if (output.klass) {
        setClassData(output.klass)
      }
      
      setNewEnrollmentId('')
      
    } catch (err) {
      console.error('Error adding enrollment:', err)
      setError('Erro ao adicionar matrícula. Tente novamente.')
    } finally {
      setAddingEnrollment(false)
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm('Tem certeza que deseja remover esta matrícula da turma?')) {
      return
    }

    try {
      setRemovingEnrollmentId(enrollmentId)
      setError(null)
      
      const removeEnrollmentUseCase = container.get<RemoveEnrollmentFromClassUseCase>(
        Register.enrollment.useCase.RemoveEnrollmentFromClassUseCase
      )
      
      const input = new RemoveEnrollmentFromClassInput(
        classId,
        enrollmentId
      )
      
      await removeEnrollmentUseCase.execute(input)
      
      // Refresh class data
      const getClassUseCase = container.get<GetClassUseCase>(
        Register.enrollment.useCase.GetClassUseCase
      )
      
      const getInput = new GetClassInput(classId)
      const output = await getClassUseCase.execute(getInput)
      if (output.klass) {
        setClassData(output.klass)
      }
      
    } catch (err) {
      console.error('Error removing enrollment:', err)
      setError('Erro ao remover matrícula. Tente novamente.')
    } finally {
      setRemovingEnrollmentId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getClassType = (courseId: string | null, trailId: string | null) => {
    if (courseId) return 'Curso'
    if (trailId) return 'Trilha'
    return 'Indefinido'
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

  if (!classData) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> Turma não encontrada.</span>
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
            <h1 className="text-3xl font-bold">Editar Turma</h1>
            <Button 
              onClick={() => router.push('/admin/turmas')}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Edite as informações da turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="text-sm font-medium">Tipo</label>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        classData.courseId 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {getClassType(classData.courseId, classData.trailId)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Criado em</label>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                      {formatDate(classData.createdAt)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Atualizado em</label>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
                      {formatDate(classData.updatedAt)}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant='primary'
                    >
                      {submitting ? 'Salvando...' : 'Salvar Alterações'}
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

            {/* Enrollment Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Matrículas</CardTitle>
                <CardDescription>
                  Adicione ou remova matrículas desta turma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Total de Matrículas: {classData.enrollmentIds.length}
                  </label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newEnrollment" className="text-sm font-medium">
                    Adicionar Estudante à Turma
                  </label>
                  <div className="flex gap-2">
                    <SelectComponent
                      value={newEnrollmentId}
                      onChange={(studentId) => setNewEnrollmentId(studentId)}
                      options={availableStudents.map(student => ({
                        value: student.id,
                        label: student.email
                      }))}
                      placeholder="Selecione um estudante"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddEnrollment}
                      disabled={addingEnrollment || !newEnrollmentId.trim()}
                      className="bg-green-600 text-white shadow-xs hover:bg-green-700"
                    >
                      {addingEnrollment ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                  </div>
                  {availableStudents.length === 0 && (
                    <p className="text-xs text-gray-500">
                      Nenhum estudante disponível para adicionar
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Matrículas Atuais</label>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {currentEnrollments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Nenhuma matrícula encontrada
                      </div>
                    ) : (
                      <div className="divide-y">
                        {currentEnrollments.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-3">
                            <span className="text-sm">{enrollment.userEmail}</span>
                            <Button
                              onClick={() => handleRemoveEnrollment(enrollment.id)}
                              disabled={removingEnrollmentId === enrollment.id}
                              className="bg-red-50 text-red-600 shadow-xs hover:bg-red-100 hover:text-red-700 h-8 rounded-md gap-1.5 px-3 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              {removingEnrollmentId === enrollment.id ? 'Removendo...' : 'Remover'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
