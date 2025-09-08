'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ListTrailsUseCase } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.use-case'
import { ListTrailsInput } from '@/_core/modules/content/core/use-cases/list-trails/list-trails.input'
import { DeleteTrailUseCase } from '@/_core/modules/content/core/use-cases/delete-trail/delete-trail.use-case'
import { DeleteTrailInput } from '@/_core/modules/content/core/use-cases/delete-trail/delete-trail.input'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'

type TrailWithUIProps = {
  id: string
  title: string
  description: string
  courseCount: number
  createdAt: Date
  updatedAt: Date
}

const NAME_COLUMNS = [
  'Nome',
  'Descrição',
  'Cursos',
  'Criado em',
  'Atualizado em',
  'Ação'
]

export default function TrailsPage() {
  const [trails, setTrails] = useState<TrailWithUIProps[]>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
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
    const fetchTrails = async () => {
      if (!selectedInstitutionId) return
      
      try {
        setLoading(true)

        const listTrailsUseCase = container.get<ListTrailsUseCase>(
          Register.content.useCase.ListTrailsUseCase
        )
        
        const input = new ListTrailsInput(selectedInstitutionId)
        const output = await listTrailsUseCase.execute(input)
        
        const trailsWithUIProps: TrailWithUIProps[] = output.trails.map(trail => ({
          id: trail.id,
          title: trail.title,
          description: trail.description,
          courseCount: trail.courseIds.length,
          createdAt: trail.createdAt,
          updatedAt: trail.updatedAt
        }))
        
        setTrails(trailsWithUIProps)
        setError(null)
      } catch (err) {
        console.error('Error fetching trails:', err)
        setError('Failed to load trails. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrails()
  }, [selectedInstitutionId])

  const handleDeleteTrail = async (trailId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta trilha?')) {
      return
    }

    try {
      const deleteTrailUseCase = container.get<DeleteTrailUseCase>(
        Register.content.useCase.DeleteTrailUseCase
      )
      
      const input = new DeleteTrailInput(trailId)
      await deleteTrailUseCase.execute(input)
      
      // Remove the trail from the local state
      setTrails(prevTrails => prevTrails.filter(trail => trail.id !== trailId))
    } catch (err) {
      console.error('Error deleting trail:', err)
      setError('Failed to delete trail. Please try again later.')
    }
  }
  
  const filteredTrails = trails.filter(trail => {
    const matchesSearch = 
      trail.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trail.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Trilhas Existentes</h1>
            <Link href="/admin/trails/create">
              <Button className="hover:bg-white ">Criar nova trilha</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trilhas</CardTitle>
              <CardDescription>
                Gerencie todas as trilhas de aprendizado em sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search"
                    type="text"
                    placeholder="Pesquise por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  >
                    <option value="">Selecione uma instituição</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
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
                      {filteredTrails.map((trail) => (
                        <tr key={trail.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4">{trail.title}</td>
                          <td className="py-3 px-4 max-w-xs truncate">{trail.description}</td>
                          <td className="py-3 px-4 text-center">{trail.courseCount}</td>
                          <td className="py-3 px-4">{formatDate(trail.createdAt)}</td>
                          <td className="py-3 px-4">{formatDate(trail.updatedAt)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2">
                              <Link href={`/admin/trails/edit/${trail.id}`}>
                                <Button className="hover:bg-white h-8 rounded-md gap-1.5 px-3">Editar</Button>
                              </Link>
                              <Button 
                                onClick={() => handleDeleteTrail(trail.id)}
                                className="hover:bg-white hover:text-red-700 h-8 rounded-md gap-1.5 px-3"
                              >
                                Excluir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredTrails.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma trilha encontrada 
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
