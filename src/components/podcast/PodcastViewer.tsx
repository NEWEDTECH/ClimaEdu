'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@/context/zustand/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { PodcastAudioPlayer } from './PodcastAudioPlayer'
import VideoPlayer from '@/components/video/VideoPlayer'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { GetPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast/get-podcast.use-case'
import { AddViewToPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/add-view-to-podcast/add-view-to-podcast.use-case'
import { ToggleLikePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/toggle-like-podcast/toggle-like-podcast.use-case'
import { GetPodcastAnalyticsUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast-analytics/get-podcast-analytics.use-case'
import type { Podcast } from '@/_core/modules/podcast/core/entities/Podcast'

interface PodcastViewerProps {
  podcastId: string
}

export function PodcastViewer({ podcastId }: PodcastViewerProps) {
  const { infoUser } = useProfile()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [viewsCount, setViewsCount] = useState(0)
  const [hasAddedView, setHasAddedView] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    try {
      const getAnalyticsUseCase = container.get<GetPodcastAnalyticsUseCase>(Register.podcast.useCase.GetPodcastAnalyticsUseCase)
      
      const result = await getAnalyticsUseCase.execute({ 
        podcastId,
        timeRange: 'all'
      })
      
      setLikesCount(result.totalLikes)
      setViewsCount(result.totalViews)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    }
  }, [podcastId])

  const loadPodcast = useCallback(async () => {
    try {
      setIsLoading(true)
      const getPodcastUseCase = container.get<GetPodcastUseCase>(Register.podcast.useCase.GetPodcastUseCase)
      
      const result = await getPodcastUseCase.execute({ podcastId })
      
      if (result.podcast) {
        setPodcast(result.podcast)
        await loadAnalytics()
      } else {
        setError('Podcast não encontrado.')
      }
    } catch (error) {
      console.error('Erro ao carregar podcast:', error)
      setError('Erro ao carregar podcast. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [podcastId, loadAnalytics])

  const addView = useCallback(async () => {
    if (!infoUser.id || hasAddedView) return

    try {
      const addViewUseCase = container.get<AddViewToPodcastUseCase>(Register.podcast.useCase.AddViewToPodcastUseCase)
      
      await addViewUseCase.execute({
        podcastId,
        userId: infoUser.id
      })
      
      setHasAddedView(true)
      setViewsCount(prev => prev + 1)
    } catch (error) {
      console.error('Erro ao adicionar visualização:', error)
    }
  }, [podcastId, infoUser.id, hasAddedView])

  useEffect(() => {
    loadPodcast()
  }, [podcastId, loadPodcast])

  useEffect(() => {
    if (podcast && infoUser.id && !hasAddedView) {
      addView()
    }
  }, [podcast, infoUser.id, hasAddedView, addView])

  const toggleLike = async () => {
    if (!infoUser.id) return

    try {
      const toggleLikeUseCase = container.get<ToggleLikePodcastUseCase>(Register.podcast.useCase.ToggleLikePodcastUseCase)
      
      const result = await toggleLikeUseCase.execute({
        podcastId,
        userId: infoUser.id
      })
      
      setIsLiked(result.isLiked)
      setLikesCount(prev => result.isLiked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Erro ao curtir podcast:', error)
    }
  }

  const handlePlay = () => {
    // Adicionar view quando começar a reproduzir (se ainda não foi adicionada)
    if (!hasAddedView) {
      addView()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando podcast...</p>
        </div>
      </div>
    )
  }

  if (error || !podcast) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Podcast não encontrado.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com informações do podcast */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Imagem de capa */}
            <div className="flex-shrink-0">
              <img
                src={podcast.coverImageUrl || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop'}
                alt={podcast.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
            </div>
            
            {/* Informações */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {podcast.mediaType === 'AUDIO' ? '🎧' : '📹'}
                </span>
                <CardTitle className="text-2xl">{podcast.title}</CardTitle>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {podcast.description}
              </p>
              
              {/* Tags */}
              {podcast.tags && podcast.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {podcast.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Estatísticas e ações */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>👁️</span>
                  <span>{viewsCount} visualizações</span>
                </div>
                
                <Button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{likesCount}</span>
                </Button>
                
                <div className="text-sm text-gray-500">
                  Publicado em: {new Date(podcast.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Player */}
      <Card>
        <CardContent className="p-6">
          {podcast.mediaType === 'AUDIO' ? (
            <PodcastAudioPlayer
              url={podcast.mediaUrl}
              title={podcast.title}
              onPlay={handlePlay}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{podcast.title}</h3>
              <VideoPlayer
                url={podcast.mediaUrl}
                autoPlay={false}
                showControls={true}
                onReady={handlePlay}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Sobre este {podcast.mediaType === 'AUDIO' ? 'Podcast' : 'Vídeo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tipo:</strong> {podcast.mediaType === 'AUDIO' ? 'Podcast de Áudio' : 'Vídeo Podcast'}
            </div>
            <div>
              <strong>Publicado:</strong> {new Date(podcast.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <strong>Última atualização:</strong> {new Date(podcast.updatedAt).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <strong>Visualizações:</strong> {viewsCount}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
