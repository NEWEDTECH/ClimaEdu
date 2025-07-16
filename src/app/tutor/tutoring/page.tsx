'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card/card'
import { TutoringSessionsList } from '@/components/tutoring/tutor/TutoringSessionsList'
import { SessionDetailsModal } from '@/components/tutoring/tutor/SessionDetailsModal'
import { TutoringStats } from '@/components/tutoring/tutor/TutoringStats'
import { mockTutorSessions, TutorSession } from './data/mockTutorData'

export default function TutorTutoringPage() {
  const [sessions, setSessions] = useState<TutorSession[]>(mockTutorSessions)
  const [selectedSession, setSelectedSession] = useState<TutorSession | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSessionClick = (session: TutorSession) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleSessionUpdate = (updatedSession: TutorSession) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    )
    setSelectedSession(updatedSession)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
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
