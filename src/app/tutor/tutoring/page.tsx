'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { TutoringSessionsList } from '@/components/tutoring/tutor/TutoringSessionsList'
import { SessionDetailsModal } from '@/components/tutoring/tutor/SessionDetailsModal'
import { TutoringStats } from '@/components/tutoring/tutor/TutoringStats'
import { useTutorSessions } from '@/hooks/tutoring'
import { useProfile } from '@/context/zustand/useProfile'
import type { TutoringSession } from '@/_core/modules/tutoring'

export default function TutorTutoringPage() {
  const { infoUser } = useProfile()
  const tutorId = infoUser.id
  
  const { 
    sessions, 
    loading, 
    error, 
    updateSessionStatus,
    refetch
  } = useTutorSessions({ 
    tutorId: tutorId,
    autoRefresh: true // Auto-refresh every 15 minutes
  })

  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSessionClick = (session: TutoringSession) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleSessionUpdate = async (updatedSession: TutoringSession) => {
    try {
      await updateSessionStatus(updatedSession.id, updatedSession.status)
      setSelectedSession(updatedSession)
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
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

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando sessões de tutoria...</p>
            </div>
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
            <div className="text-center py-8">
              <p className="text-red-500">Erro ao carregar sessões: {error}</p>
              <button 
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tentar novamente
              </button>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Sessões de Tutoria</h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas sessões de tutoria e ajude os alunos com suas dúvidas.
            </p>
          </div>

          {/* Stats Overview */}
          <TutoringStats sessions={sessions} />

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Sessões Agendadas</CardTitle>
              <CardDescription>
                Suas sessões de tutoria organizadas por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TutoringSessionsList 
                sessions={sessions}
                onSessionClick={handleSessionClick}
              />
            </CardContent>
          </Card>

          {/* Session Details Modal */}
          {selectedSession && (
            <SessionDetailsModal
              session={selectedSession}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSessionUpdate={handleSessionUpdate}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
