'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProfile } from '@/context/zustand/useProfile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { PodcastTable, PodcastFilters } from '@/components/podcast'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { ListPodcastsUseCase } from '@/_core/modules/podcast/core/use-cases/list-podcasts/list-podcasts.use-case'
import { DeletePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/delete-podcast/delete-podcast.use-case'

import type { Podcast } from '@/_core/modules/podcast/core/entities/Podcast'

export default function PodcastPage() {
  const { infoUser } = useProfile()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar podcasts e aplicar filtros
  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setLoading(true)
        const listPodcastsUseCase = container.get<ListPodcastsUseCase>(Register.podcast.useCase.ListPodcastsUseCase)
        
        const result = await listPodcastsUseCase.execute({
          institutionId: infoUser.currentIdInstitution,
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        setPodcasts(result.podcasts)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar podcasts:', err)
        setError('Falha ao carregar podcasts. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    loadPodcasts()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      let filtered = podcasts

      // Filtro por termo de busca
      if (searchTerm) {
        filtered = filtered.filter(podcast =>
          podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Filtro por tipo de mídia
      if (mediaTypeFilter !== 'all') {
        filtered = filtered.filter(podcast => podcast.mediaType === mediaTypeFilter)
      }

      // Filtro por tag
      if (tagFilter) {
        filtered = filtered.filter(podcast =>
          podcast.tags?.some(tag => 
            tag.toLowerCase().includes(tagFilter.toLowerCase())
          )
        )
      }

      setFilteredPodcasts(filtered)
    }

    applyFilters()
  }, [podcasts, searchTerm, mediaTypeFilter, tagFilter])

  const handleDelete = async (podcastId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o podcast "${title}"?`)) {
      return
    }

    try {
      const deletePodcastUseCase = container.get<DeletePodcastUseCase>(Register.podcast.useCase.DeletePodcastUseCase)
      
      const result = await deletePodcastUseCase.execute({ podcastId })
      
      if (result.success) {
        alert(`Podcast "${title}" excluído com sucesso!`)
        // Atualizar apenas o estado local removendo o podcast excluído
        setPodcasts(prevPodcasts => prevPodcasts.filter(podcast => podcast.id !== podcastId))
      } else {
        alert('Erro ao excluir podcast.')
      }
    } catch (error) {
      console.error('Erro ao excluir podcast:', error)
      alert('Erro ao excluir podcast. Tente novamente.')
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🎧 Podcasts Existentes</h1>
            <Link href="/admin/podcast/create">
              <Button className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                ➕ Criar novo podcast
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Podcasts</CardTitle>
              <CardDescription>
                Gerencie todos os podcasts em sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PodcastFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                mediaTypeFilter={mediaTypeFilter}
                onMediaTypeChange={setMediaTypeFilter}
                tagFilter={tagFilter}
                onTagChange={setTagFilter}
              />

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Erro!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              <PodcastTable
                podcasts={filteredPodcasts}
                loading={loading}
                onDelete={handleDelete}
              />

              {!loading && !error && filteredPodcasts.length === 0 && podcasts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum podcast encontrado com os filtros aplicados.
                  <Button 
                    onClick={() => {
                      setSearchTerm('')
                      setMediaTypeFilter('all')
                      setTagFilter('')
                    }}
                    className="ml-2 text-sm underline"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
