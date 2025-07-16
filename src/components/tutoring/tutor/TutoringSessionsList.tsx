'use client'

import { useState } from 'react'
import { TutorSession } from '@/app/tutor/tutoring/data/mockTutorData'
import { TutorSessionCard } from './TutorSessionCard'
import { SessionFilters } from './SessionFilters'
import { CalendarIcon } from 'lucide-react'

interface TutoringSessionsListProps {
  sessions: TutorSession[]
  onSessionClick: (session: TutorSession) => void
}

export function TutoringSessionsList({ sessions, onSessionClick }: TutoringSessionsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Filter sessions based on selected filters
  const filteredSessions = sessions.filter(session => {
    const statusMatch = statusFilter === 'all' || session.status === statusFilter
    const priorityMatch = priorityFilter === 'all' || session.priority === priorityFilter
    
    let dateMatch = true
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      dateMatch = session.date === today
    } else if (dateFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0]
      dateMatch = session.date >= today && session.status === 'scheduled'
    } else if (dateFilter === 'past') {
      const today = new Date().toISOString().split('T')[0]
      dateMatch = session.date < today || session.status === 'completed'
    }

    return statusMatch && priorityMatch && dateMatch
  })

  // Sort sessions by date and time
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  // Group sessions by status for better organization
  const groupedSessions = {
    scheduled: sortedSessions.filter(s => s.status === 'scheduled'),
    in_progress: sortedSessions.filter(s => s.status === 'in_progress'),
    completed: sortedSessions.filter(s => s.status === 'completed'),
    cancelled: sortedSessions.filter(s => s.status === 'cancelled' || s.status === 'no_show')
  }

  const statusLabels = {
    scheduled: 'Agendadas',
    in_progress: 'Em Andamento',
    completed: 'Concluídas',
    cancelled: 'Canceladas/Faltaram'
  }

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
