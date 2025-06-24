'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { FormSection } from '@/components/form'
import { ContentType } from '@/_core/modules/content/core/entities/ContentType'

// Schema de validação com Zod
const uploadContentSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  coverImage: z.string()
    .url('URL da imagem de capa deve ser válida')
    .min(1, 'URL da imagem de capa é obrigatória'),
  videoUrl: z.string()
    .url('URL do vídeo deve ser válida')
    .min(1, 'URL do vídeo é obrigatória'),
  category: z.enum(['VIDEO', 'PODCAST'], {
    required_error: 'Categoria é obrigatória',
    invalid_type_error: 'Categoria deve ser VIDEO ou PODCAST'
  })
})

type UploadContentFormData = z.infer<typeof uploadContentSchema>

export default function UploadContentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<UploadContentFormData>({
    resolver: zodResolver(uploadContentSchema),
    defaultValues: {
      title: '',
      description: '',
      coverImage: '',
      videoUrl: '',
      category: 'VIDEO'
    }
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: UploadContentFormData) => {
    setIsSubmitting(true)
    
    try {
      // Objeto formatado pronto para uso futuro
      const contentData = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lessonId: '', // Será preenchido quando integrar com lições
        type: data.category as ContentType,
        title: data.title,
        url: data.videoUrl,
        description: data.description,
        coverImage: data.coverImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('📹 Dados do conteúdo formatados:', contentData)
      console.log('🎯 Tipo de conteúdo:', data.category)
      console.log('📝 Formulário original:', data)

      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert(`${data.category === 'VIDEO' ? 'Vídeo' : 'Podcast'} "${data.title}" foi preparado com sucesso! Verifique o console para ver os dados formatados.`)
      
      // Reset do formulário após sucesso
      reset()
    } catch (error) {
      console.error('Erro ao processar upload:', error)
      alert('Erro ao processar o upload. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Upload de Conteúdo</h1>
            <Link href="/">
              <Button className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 rounded-md gap-1.5 px-3">
                ← Voltar
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {selectedCategory === 'VIDEO' ? '📹 Novo Vídeo' : '🎧 Novo Podcast'}
              </CardTitle>
              <CardDescription>
                Faça upload de um {selectedCategory === 'VIDEO' ? 'vídeo' : 'podcast'} para sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormSection onSubmit={handleSubmit(onSubmit)}>
                {/* Categoria */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Categoria *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  >
                    <option value="VIDEO">Clima</option>
                    <option value="PODCAST">Meio Ambiente</option>
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
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
                    placeholder={`Digite o título do ${selectedCategory === 'VIDEO' ? 'vídeo' : 'podcast'}`}
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
                    placeholder={`Descreva o conteúdo do ${selectedCategory === 'VIDEO' ? 'vídeo' : 'podcast'}`}
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
                  <label htmlFor="coverImage" className="text-sm font-medium">
                    URL da Imagem de Capa *
                  </label>
                  <InputText
                    {...register('coverImage')}
                    id="coverImage"
                    type="url"
                    placeholder="https://exemplo.com/imagem-capa.jpg"
                    className={errors.coverImage ? 'border-red-500' : ''}
                  />
                  {errors.coverImage && (
                    <p className="text-sm text-red-600">{errors.coverImage.message}</p>
                  )}
                </div>

                {/* URL do Vídeo/Podcast */}
                <div className="space-y-2">
                  <label htmlFor="videoUrl" className="text-sm font-medium">
                    URL do {selectedCategory === 'VIDEO' ? 'Vídeo' : 'Podcast'} *
                  </label>
                  <InputText
                    {...register('videoUrl')}
                    id="videoUrl"
                    type="url"
                    placeholder={
                      selectedCategory === 'VIDEO' 
                        ? 'https://youtube.com/watch?v=...' 
                        : 'https://exemplo.com/podcast.mp3'
                    }
                    className={errors.videoUrl ? 'border-red-500' : ''}
                  />
                  {errors.videoUrl && (
                    <p className="text-sm text-red-600">{errors.videoUrl.message}</p>
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
                      ? `Processando ${selectedCategory === 'VIDEO' ? 'vídeo' : 'podcast'}...` 
                      : `Fazer Upload do ${selectedCategory === 'VIDEO' ? 'Vídeo' : 'Podcast'}`
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
                  <li><strong>Vídeos:</strong> YouTube, Vimeo, MP4, WebM</li>
                  <li><strong>Podcasts:</strong> MP3, WAV, OGG</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-medium mb-2">Dicas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use URLs públicas e acessíveis</li>
                  <li>Imagens de capa em formato JPG ou PNG</li>
                  <li>Títulos descritivos ajudam na busca</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
