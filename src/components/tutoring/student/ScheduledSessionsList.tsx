'use client'

import { ScheduledSession } from '../../../app/student/tutoring/data/mockData'
import { SessionCard } from './SessionCard'
import { CalendarIcon } from 'lucide-react'

interface ScheduledSessionsListProps {
  sessions: ScheduledSession[]
}

export function ScheduledSessionsList({ sessions }: ScheduledSessionsListProps) {
  // Sort sessions by date and time
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  // Separate upcoming and past sessions
  const now = new Date()
  const upcomingSessions = sortedSessions.filter(session => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`)
    return sessionDateTime > now && session.status !== 'cancelled'
  })

  const pastSessions = sortedSessions.filter(session => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`)
    return sessionDateTime <= now || session.status === 'completed' || session.status === 'cancelled'
  })

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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
