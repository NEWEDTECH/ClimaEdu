'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react'
import { ScheduleClassModal, type ScheduleClassFormData } from '@/components/scheduled-class/tutor/ScheduleClassModal'
import { ScheduledClassesList } from '@/components/scheduled-class/tutor/ScheduledClassesList'
import { useTutorScheduledClasses } from '@/hooks/scheduled-class'
import { useProfile } from '@/context/zustand/useProfile'
import type { ScheduledClass } from '@/_core/modules/scheduled-class'

export default function TutorScheduledClassesPage() {
  const { infoUser } = useProfile()
  const tutorId = infoUser.id

  const {
    scheduledClasses,
    tutorClasses,
    loading,
    error,
    saving,
    refetch,
    scheduleClass,
    updateScheduledClass,
    cancelScheduledClass
  } = useTutorScheduledClasses({
    tutorId: tutorId,
    institutionId: infoUser.currentIdInstitution
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingScheduledClass, setEditingScheduledClass] = useState<ScheduledClass | null>(null)

  const handleOpenCreateModal = () => {
    setEditingScheduledClass(null)
    setIsModalOpen(true)
  }

  const handleEdit = (scheduledClass: ScheduledClass) => {
    setEditingScheduledClass(scheduledClass)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingScheduledClass(null)
  }

  const handleSubmit = async (data: ScheduleClassFormData) => {
    if (editingScheduledClass) {
      await updateScheduledClass({
        scheduledClassId: editingScheduledClass.id,
        ...data
      })
    } else {
      await scheduleClass(data)
    }
  }

  const handleCancel = async (scheduledClass: ScheduledClass) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar esta aula? Os alunos da turma serão notificados.'
    )
    if (!confirmed) return

    try {
      await cancelScheduledClass(scheduledClass.id)
    } catch (error) {
      console.error('Error cancelling scheduled class:', error)
    }
  }

  if (!tutorId) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando informações do usuário...</p>
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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Link href="/tutor/tutoring">
                <Button
                  variant="secondary"
                  className="border border-gray-300"
                  icon={<ArrowLeftIcon size={16} />}
                >
                  Voltar
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aulas da Turma</h1>
            </div>
            <Button onClick={handleOpenCreateModal} icon={<PlusIcon size={16} />}>
              Agendar Aula
            </Button>
          </div>

          {/* Scheduled Classes List */}
          <Card>
            <CardHeader>
              <CardTitle>Aulas Agendadas</CardTitle>
              <CardDescription>
                Gerencie as aulas ao vivo das suas turmas. Ao agendar, editar ou cancelar,
                os alunos da turma são notificados automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 py-8">Carregando aulas agendadas...</p>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Erro ao carregar aulas: {error}</p>
                  <Button onClick={refetch} className="mt-4">
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <ScheduledClassesList
                  scheduledClasses={scheduledClasses}
                  tutorClasses={tutorClasses}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  saving={saving}
                />
              )}
            </CardContent>
          </Card>

          {/* Schedule Class Modal (create/edit) */}
          <ScheduleClassModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            tutorClasses={tutorClasses}
            saving={saving}
            editingClass={editingScheduledClass}
          />
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
