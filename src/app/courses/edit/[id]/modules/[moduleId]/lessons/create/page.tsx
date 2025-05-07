'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { Lesson } from '@/_core/modules/content/core/entities/Lesson'

interface LessonFormData {
  title: string;
  order?: number;
}

export default function CreateLessonPage({ params }: { params: Promise<{ id: string, moduleId: string }> | { id: string, moduleId: string } }) {
  const router = useRouter()

  const resolvedParams = 'then' in params ? use(params) : params
  const { id: courseId, moduleId } = resolvedParams

  const [formData, setFormData] = useState<LessonFormData>({
    title: ''
  })

  const [moduleName, setModuleName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setIsLoading(true)

        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )

        const module = await moduleRepository.findById(moduleId)

        if (!module) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }

        setModuleName(module.title)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching module data:', error)
        setError('Falha ao carregar dados do módulo')
        setIsLoading(false)
      }
    }

    fetchModuleData()
  }, [moduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('O título da lição não pode estar vazio')
      return
    }

    setIsSubmitting(true)

    try {

      const moduleRepository = container.get<ModuleRepository>(
        Register.content.repository.ModuleRepository
      )

      const lessonRepository = container.get<LessonRepository>(
        Register.content.repository.LessonRepository
      )

      const existingModule = await moduleRepository.findById(moduleId)
      if (!existingModule) {
        throw new Error(`Module with ID ${moduleId} not found`)
      }

      const lessonCount = await lessonRepository.countByModule(moduleId)
      const lessonOrder = lessonCount

      const id = await lessonRepository.generateId()

      const lesson = Lesson.create({
        id,
        moduleId,
        title: formData.title,
        order: lessonOrder,
        contents: [],
        // @ts-ignore - We're explicitly setting activity and questionnaire to null
        activity: null,
        // @ts-ignore - We're explicitly setting activity and questionnaire to null
        questionnaire: null
      })

      await lessonRepository.save(lesson)

      router.push(`/courses/edit/${courseId}/modules/${moduleId}`)
    } catch (error) {
      console.error('Erro ao criar lição:', error)
      alert(`Falha ao criar lição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Carregando dados do módulo...</p>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href={`/courses/edit/${courseId}/modules/${moduleId}`}>
                  <Button>Voltar para o Módulo</Button>
                </Link>
              </CardContent>
            </Card>
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
            <div>
              <h1 className="text-3xl font-bold">Criar Nova Lição</h1>
              <p className="text-gray-500">Módulo: {moduleName}</p>
            </div>
            <Link href={`/courses/edit/${courseId}/modules/${moduleId}`}>
              <Button className="border bg-transparent hover:bg-gray-100">Voltar para o Módulo</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Lição</CardTitle>
              <CardDescription>
                Preencha os detalhes da nova lição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSection onSubmit={handleSubmit} error={error}>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título da Lição
                  </label>
                  <InputText
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Digite o título da lição"
                    required
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Dicas para Criar Lições Eficazes</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
                    <li>Use títulos claros e descritivos que indiquem o conteúdo da lição</li>
                    <li>Mantenha as lições focadas em um único tópico ou conceito</li>
                    <li>Organize as lições em uma sequência lógica de aprendizado</li>
                    <li>Após criar a lição, adicione conteúdos como vídeos, PDFs ou questionários</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Link href={`/tutor/courses/edit/${courseId}/modules/${moduleId}`}>
                    <Button className="border bg-transparent hover:bg-gray-100" type="button">Cancelar</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando...' : 'Criar Lição'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
