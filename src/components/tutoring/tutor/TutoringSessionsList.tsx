'use client'

import { useState } from 'react'
import { TutoringSession, TutoringSessionStatus, SessionPriority } from '@/_core/modules/tutoring'
import { TutorSessionCard } from './TutorSessionCard'
import { SessionFilters } from './SessionFilters'
import { TutoringStatusUtils } from '../shared/tutoring-utils'
import { CalendarIcon } from 'lucide-react'

interface TutoringSessionsListProps {
  sessions: TutoringSession[]
  onSessionClick: (session: TutoringSession) => void
}

export function TutoringSessionsList({ sessions, onSessionClick }: TutoringSessionsListProps) {
  const [statusFilter, setStatusFilter] = useState<TutoringSessionStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<SessionPriority | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Filter sessions based on selected filters
  const filteredSessions = sessions.filter(session => {
    const statusMatch = statusFilter === 'all' || session.status === statusFilter
    const priorityMatch = priorityFilter === 'all' || session.priority === priorityFilter
    
    let dateMatch = true
    if (dateFilter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sessionDate = new Date(session.scheduledDate)
      sessionDate.setHours(0, 0, 0, 0)
      dateMatch = sessionDate.getTime() === today.getTime()
    } else if (dateFilter === 'upcoming') {
      const now = new Date()
      dateMatch = session.scheduledDate >= now && session.isActive()
    } else if (dateFilter === 'past') {
      const now = new Date()
      dateMatch = session.scheduledDate < now || session.isFinished()
    }

    return statusMatch && priorityMatch && dateMatch
  })

  // Sort sessions by scheduled date
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    return a.scheduledDate.getTime() - b.scheduledDate.getTime()
  })

  // Group sessions by status for better organization using enums
  const groupedSessions = {
    [TutoringSessionStatus.REQUESTED]: sortedSessions.filter(s => s.status === TutoringSessionStatus.REQUESTED),
    [TutoringSessionStatus.SCHEDULED]: sortedSessions.filter(s => s.status === TutoringSessionStatus.SCHEDULED),
    [TutoringSessionStatus.IN_PROGRESS]: sortedSessions.filter(s => s.status === TutoringSessionStatus.IN_PROGRESS),
    [TutoringSessionStatus.COMPLETED]: sortedSessions.filter(s => s.status === TutoringSessionStatus.COMPLETED),
    [TutoringSessionStatus.CANCELLED]: sortedSessions.filter(s => 
      s.status === TutoringSessionStatus.CANCELLED || 
      s.status === TutoringSessionStatus.NO_SHOW
    )
  }

  const statusLabels = TutoringStatusUtils.getGroupLabels()

  if (sortedSessions.length === 0) {
    return (
      <div className="space-y-4">
        <SessionFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          dateFilter={dateFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onDateChange={setDateFilter}
        />
        
        <div className="text-center py-12">
          <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma sessão encontrada
          </h3>
          <p className="text-gray-500">
            Não há sessões que correspondam aos filtros selecionados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SessionFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        dateFilter={dateFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onDateChange={setDateFilter}
      />

      {/* Show grouped sessions only if no specific filters are applied */}
      {statusFilter === 'all' && dateFilter === 'all' ? (
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([status, sessionList]) => {
            if (sessionList.length === 0) return null
            
            return (
              <div key={status}>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarIcon size={16} />
                  {statusLabels[status as keyof typeof statusLabels]} ({sessionList.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sessionList.map((session) => (
                    <TutorSessionCard
                      key={session.id}
                      session={session}
                      onClick={() => onSessionClick(session)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Show flat list when filters are applied */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedSessions.map((session) => (
            <TutorSessionCard
              key={session.id}
              session={session}
              onClick={() => onSessionClick(session)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
