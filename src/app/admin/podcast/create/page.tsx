'use client'

import { useState } from 'react'
import { useProfile } from '@/context/zustand/useProfile';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { FormSection } from '@/components/form'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container/symbols'
import { CreatePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/create-podcast/create-podcast.use-case'
import { PodcastMediaType } from '@/_core/modules/podcast/core/entities/PodcastMediaType'

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

export default function CreatePodcastPage() {
  const router = useRouter()
  const { infoUser } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
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

  const onSubmit = async (data: PodcastFormData) => {
    setIsSubmitting(true)

    try {
      const createPodcastUseCase = container.get<CreatePodcastUseCase>(Register.podcast.useCase.CreatePodcastUseCase)
      
      // Processar tags
      const tags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      await createPodcastUseCase.execute({
        institutionId: "ins_hOc5LsHn4q",
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType as PodcastMediaType,
        tags
      })

      alert(`Podcast "${data.title}" criado com sucesso!`)
      router.push('/admin/podcast') // Redirecionar para a listagem
    } catch (error) {
      console.error('Erro ao criar podcast:', error)
      alert('Erro ao criar podcast. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🎧 Criar Novo Podcast</h1>
            <Link href="/admin/podcast">
              <Button className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 rounded-md gap-1.5 px-3">
                ← Voltar para Podcasts
              </Button>
            </Link>
          </div>

          {/* Formulário de Criação */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {selectedMediaType === 'AUDIO' ? '🎧 Novo Podcast' : '📹 Novo Vídeo Podcast'}
              </CardTitle>
              <CardDescription>
                Crie um novo {selectedMediaType === 'AUDIO' ? 'podcast de áudio' : 'vídeo podcast'} para sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit(onSubmit)}>
                {/* Tipo de Mídia */}
                <div className="space-y-2">
                  <label htmlFor="mediaType" className="text-sm font-medium">
                    Tipo de Mídia *
                  </label>
                  <select
                    {...register('mediaType')}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  >
                    <option value="AUDIO">🎧 Podcast de Áudio</option>
                    <option value="VIDEO">📹 Vídeo Podcast</option>
                  </select>
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
                    className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none ${
                      errors.description ? 'border-red-500' : ''
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

                {/* Botão de Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? 'Criando podcast...' 
                      : 'Criar Podcast'
                    }
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-medium mb-2">Formatos Suportados:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Áudio:</strong> MP3, WAV, OGG</li>
                  <li><strong>Vídeo:</strong> YouTube, Vimeo, MP4, WebM</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-medium mb-2">Dicas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use URLs públicas e acessíveis</li>
                  <li>Imagens de capa em formato JPG ou PNG</li>
                  <li>Títulos descritivos ajudam na busca</li>
                  <li>Tags facilitam a organização e descoberta</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
