'use client'

import { useState, useEffect, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { SelectComponent } from '@/components/select'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { FormSection } from '@/components/form'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { GetPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast/get-podcast.use-case'
import { UpdatePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/update-podcast/update-podcast.use-case'
import { DeletePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/delete-podcast/delete-podcast.use-case'
import { PodcastMediaType } from '@/_core/modules/podcast/core/entities/PodcastMediaType'
import type { Podcast } from '@/_core/modules/podcast/core/entities/Podcast'

// Schema de validação com Zod
const podcastSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  coverImageUrl: z.string()
    .url('URL da imagem de capa deve ser válida')
    .min(1, 'URL da imagem de capa é obrigatória'),
  mediaUrl: z.string()
    .url('URL da mídia deve ser válida')
    .min(1, 'URL da mídia é obrigatória'),
  mediaType: z.enum(['AUDIO', 'VIDEO'], {
    required_error: 'Tipo de mídia é obrigatório',
    invalid_type_error: 'Tipo deve ser AUDIO ou VIDEO'
  }),
  tags: z.string().optional()
})

type PodcastFormData = z.infer<typeof podcastSchema>

interface EditPodcastPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPodcastPage({ params }: EditPodcastPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      title: '',
      description: '',
      coverImageUrl: '',
      mediaUrl: '',
      mediaType: 'AUDIO',
      tags: ''
    }
  })

  const selectedMediaType = watch('mediaType')

  // Carregar dados do podcast
  useEffect(() => {
    const loadPodcast = async () => {
      try {
        setIsLoading(true)
        const getPodcastUseCase = container.get<GetPodcastUseCase>(Register.podcast.useCase.GetPodcastUseCase)

        const result = await getPodcastUseCase.execute({
          podcastId: resolvedParams.id
        })

        if (result.podcast) {
          setPodcast(result.podcast)

          // Preencher o formulário com os dados existentes
          setValue('title', result.podcast.title)
          setValue('description', result.podcast.description)
          setValue('coverImageUrl', result.podcast.coverImageUrl)
          setValue('mediaUrl', result.podcast.mediaUrl)
          setValue('mediaType', result.podcast.mediaType)
          setValue('tags', result.podcast.tags ? result.podcast.tags.join(', ') : '')
        } else {
          alert('Podcast não encontrado.')
          router.push('/admin/podcast')
        }
      } catch (error) {
        console.error('Erro ao carregar podcast:', error)
        alert('Erro ao carregar podcast. Tente novamente.')
        router.push('/admin/podcast')
      } finally {
        setIsLoading(false)
      }
    }

    loadPodcast()
  }, [resolvedParams.id, setValue, router])

  const onSubmit = async (data: PodcastFormData) => {
    setIsSubmitting(true)

    try {
      const updatePodcastUseCase = container.get<UpdatePodcastUseCase>(Register.podcast.useCase.UpdatePodcastUseCase)

      // Processar tags
      const tags = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      await updatePodcastUseCase.execute({
        podcastId: resolvedParams.id,
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType as PodcastMediaType,
        tags
      })

      alert(`Podcast "${data.title}" atualizado com sucesso!`)
      router.push('/admin/podcast')
    } catch (error) {
      console.error('Erro ao atualizar podcast:', error)
      alert('Erro ao atualizar podcast. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!podcast) return

    try {
      const deletePodcastUseCase = container.get<DeletePodcastUseCase>(Register.podcast.useCase.DeletePodcastUseCase)

      const result = await deletePodcastUseCase.execute({ podcastId: resolvedParams.id })

      if (result.success) {
        alert(`Podcast "${podcast.title}" excluído com sucesso!`)
        router.push('/admin/podcast')
      } else {
        alert('Erro ao excluir podcast.')
      }
    } catch (error) {
      console.error('Erro ao excluir podcast:', error)
      alert('Erro ao excluir podcast. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando podcast...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (!podcast) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <p className="text-red-500">Podcast não encontrado.</p>
              <Link href="/admin/podcast">
                <Button variant='primary'>Voltar</Button>
              </Link>
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
            <h1 className="text-3xl font-bold">✏️ Editar Podcast</h1>
            <Link href="/admin/podcast">
              <Button variant='primary'>
                Voltar
              </Button>
            </Link>
          </div>

          {/* Informações do Podcast Atual */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">
                  {podcast.mediaType === 'AUDIO' ? '🎧' : '📹'}
                </span>
                {podcast.title}
              </CardTitle>
              <CardDescription>
                Criado em: {new Date(podcast.createdAt).toLocaleDateString('pt-BR')} •
                Última atualização: {new Date(podcast.updatedAt).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Formulário de Edição */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {selectedMediaType === 'AUDIO' ? '🎧 Editar Podcast' : '📹 Editar Vídeo Podcast'}
              </CardTitle>
              <CardDescription>
                Atualize as informações do {selectedMediaType === 'AUDIO' ? 'podcast de áudio' : 'vídeo podcast'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit(onSubmit)}>
                {/* Tipo de Mídia */}
                <div className="space-y-2">
                  <label htmlFor="mediaType" className="text-sm font-medium">
                    Tipo de Mídia *
                  </label>
                  <SelectComponent
                    value={watch('mediaType') || ''}
                    onChange={(value) => setValue('mediaType', value as 'AUDIO' | 'VIDEO')}
                    options={[
                      { value: "AUDIO", label: "🎧 Podcast de Áudio" },
                      { value: "VIDEO", label: "📹 Vídeo Podcast" }
                    ]}
                    placeholder="Selecione o tipo de mídia"
                    className="w-full"
                  />
                  {errors.mediaType && (
                    <p className="text-sm text-red-600">{errors.mediaType.message}</p>
                  )}
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título *
                  </label>
                  <InputText
                    {...register('title')}
                    id="title"
                    type="text"
                    placeholder="Digite o título do podcast"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descrição *
                  </label>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    placeholder="Descreva o conteúdo do podcast"
                    className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none ${errors.description ? 'border-red-500' : ''
                      }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* URL da Imagem de Capa */}
                <div className="space-y-2">
                  <label htmlFor="coverImageUrl" className="text-sm font-medium">
                    URL da Imagem de Capa *
                  </label>
                  <InputText
                    {...register('coverImageUrl')}
                    id="coverImageUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem-capa.jpg"
                    className={errors.coverImageUrl ? 'border-red-500' : ''}
                  />
                  {errors.coverImageUrl && (
                    <p className="text-sm text-red-600">{errors.coverImageUrl.message}</p>
                  )}
                </div>

                {/* URL da Mídia */}
                <div className="space-y-2">
                  <label htmlFor="mediaUrl" className="text-sm font-medium">
                    URL da {selectedMediaType === 'AUDIO' ? 'Mídia de Áudio' : 'Mídia de Vídeo'} *
                  </label>
                  <InputText
                    {...register('mediaUrl')}
                    id="mediaUrl"
                    type="url"
                    placeholder={
                      selectedMediaType === 'AUDIO'
                        ? 'https://exemplo.com/podcast.mp3'
                        : 'https://youtube.com/watch?v=...'
                    }
                    className={errors.mediaUrl ? 'border-red-500' : ''}
                  />
                  {errors.mediaUrl && (
                    <p className="text-sm text-red-600">{errors.mediaUrl.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags (opcional)
                  </label>
                  <InputText
                    {...register('tags')}
                    id="tags"
                    type="text"
                    placeholder="clima, meio ambiente, sustentabilidade (separadas por vírgula)"
                    className={errors.tags ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">Separe as tags por vírgula</p>
                  {errors.tags && (
                    <p className="text-sm text-red-600">{errors.tags.message}</p>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="pt-4 space-y-3 flex justify-between">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant='primary'
                  >
                    {isSubmitting
                      ? 'Salvando alterações...'
                      : 'Salvar Alterações'
                    }
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    variant='secondary'
                  >
                    Excluir Podcast
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          {/* Modal de Confirmação de Exclusão */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-red-600">⚠️ Confirmar Exclusão</CardTitle>
                  <CardDescription>
                    Esta ação não pode ser desfeita. O podcast será permanentemente excluído.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Tem certeza que deseja excluir o podcast <strong>{podcast.title}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Sim, Excluir
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border bg-background hover:bg-accent"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
