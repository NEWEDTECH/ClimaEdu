'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SelectComponent } from '@/components/select'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ListClassesUseCase } from '@/_core/modules/enrollment/core/use-cases/list-classes/list-classes.use-case'
import { ListClassesInput } from '@/_core/modules/enrollment/core/use-cases/list-classes/list-classes.input'
import { DeleteClassUseCase } from '@/_core/modules/enrollment/core/use-cases/delete-class/delete-class.use-case'
import { DeleteClassInput } from '@/_core/modules/enrollment/core/use-cases/delete-class/delete-class.input'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { Class } from '@/_core/modules/enrollment/core/entities/Class'

type ClassWithUIProps = {
  id: string
  name: string
  courseId: string | null
  trailId: string | null
  enrollmentCount: number
  createdAt: Date
  updatedAt: Date
}

const NAME_COLUMNS = [
  'Nome',
  'Tipo',
  'Matrículas',
  'Criado em',
  'Atualizado em',
  'Ações'
]

export default function TurmasPage() {
  const [classes, setClasses] = useState<ClassWithUIProps[]>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true)

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
        setLoading(false)
      }
    }
    
    fetchInstitutions()
  }, [])

  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedInstitutionId) return
      
      try {
        setLoading(true)

        const listClassesUseCase = container.get<ListClassesUseCase>(
          Register.enrollment.useCase.ListClassesUseCase
        )
        
        const input = new ListClassesInput(selectedInstitutionId)
        const output = await listClassesUseCase.execute(input)
        
        const classesWithUIProps = output.classes.map((classEntity: Class) => ({
          id: classEntity.id,
          name: classEntity.name,
          courseId: classEntity.courseId,
          trailId: classEntity.trailId,
          enrollmentCount: classEntity.enrollmentIds.length,
          createdAt: classEntity.createdAt,
          updatedAt: classEntity.updatedAt
        }))
        
        setClasses(classesWithUIProps)
        setError(null)
      } catch (err) {
        console.error('Error fetching classes:', err)
        setError('Failed to load classes. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchClasses()
  }, [selectedInstitutionId])

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setDeleting(classId)
      
      const deleteClassUseCase = container.get<DeleteClassUseCase>(
        Register.enrollment.useCase.DeleteClassUseCase
      )
      
      const input = new DeleteClassInput(classId)
      await deleteClassUseCase.execute(input)
      
      // Remove the deleted class from the state
      setClasses(prevClasses => prevClasses.filter(c => c.id !== classId))
      
    } catch (err) {
      console.error('Error deleting class:', err)
      alert('Erro ao excluir turma. Tente novamente.')
    } finally {
      setDeleting(null)
    }
  }
  
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = 
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

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

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Turmas</h1>
            <Link href="/admin/turmas/create">
              <Button variant='primary'>
                Criar nova turma
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Turmas Existentes</CardTitle>
              <CardDescription>
                Gerencie todas as turmas em sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search"
                    type="text"
                    placeholder="Pesquise por nome da turma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                <SelectComponent
                  value={selectedInstitutionId}
                  onChange={(institutionId) => setSelectedInstitutionId(institutionId)}
                  options={institutions.map(institution => ({
                    value: institution.id,
                    label: institution.name
                  }))}
                  placeholder="Selecione uma instituição"
                  className="w-full"
                />
                </div>
              </div>

              {loading && (
                <LoadingSpinner />
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Erro!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {NAME_COLUMNS.map(item => (
                          <th className="text-left py-3 px-4" key={item}>{item}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClasses.map((classItem) => (
                        <tr key={classItem.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4 font-medium">{classItem.name}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              classItem.courseId 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {getClassType(classItem.courseId, classItem.trailId)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">{classItem.enrollmentCount}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(classItem.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(classItem.updatedAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2">
                              <Link href={`/admin/turmas/edit/${classItem.id}`}>
                                <Button variant='primary'>
                                  Editar
                                </Button>
                              </Link>
                              <Button 
                                onClick={() => handleDeleteClass(classItem.id)}
                                disabled={deleting === classItem.id}
                                variant='secondary'
                              >
                                {deleting === classItem.id ? 'Excluindo...' : 'Excluir'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredClasses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma turma encontrada
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
