'use client'

import { SessionCard } from './SessionCard'
import { useStudentSessions } from '@/hooks/tutoring'
import type { TutoringSession } from '@/_core/modules/tutoring'
import { CalendarIcon } from 'lucide-react'

interface ScheduledSessionsListProps {
  sessions: TutoringSession[]
  loading: boolean
  error: string | null
  studentId: string
}

export function ScheduledSessionsList({ sessions, loading, error, studentId }: ScheduledSessionsListProps) {
  const { cancelSession, cancelling } = useStudentSessions({ studentId })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Carregando sessões...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">Erro ao carregar sessões: {error}</p>
      </div>
    )
  }

  // Sort sessions by scheduled date
  const sortedSessions = [...sessions].sort((a, b) => {
    return a.scheduledDate.getTime() - b.scheduledDate.getTime()
  })

  // Separate upcoming and past sessions
  const now = new Date()
  const upcomingSessions = sortedSessions.filter(session => {
    return session.scheduledDate > now && 
           (session.status === 'REQUESTED' || session.status === 'SCHEDULED')
  })

  const pastSessions = sortedSessions.filter(session => {
    return session.scheduledDate <= now || 
           session.status === 'COMPLETED' || 
           session.status === 'CANCELLED' ||
           session.status === 'NO_SHOW'
  })

  const handleCancelSession = async (sessionId: string) => {
    try {
      await cancelSession(sessionId, 'Cancelado pelo estudante')
    } catch (error) {
      console.error('Error cancelling session:', error)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma sessão agendada
        </h3>
        <p className="text-gray-500">
          Agende sua primeira sessão de tutoria para começar!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CalendarIcon size={16} />
            Próximas Sessões ({upcomingSessions.length})
          </h3>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                isUpcoming={true}
                onCancel={() => handleCancelSession(session.id)}
                cancelling={cancelling}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <CalendarIcon size={16} />
            Sessões Anteriores ({pastSessions.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pastSessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                isUpcoming={false}
                onCancel={() => handleCancelSession(session.id)}
                cancelling={cancelling}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
