'use client'

import { ScheduledSession } from '../../../app/student/tutoring/data/mockData'
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface SessionCardProps {
  session: ScheduledSession
  isUpcoming: boolean
}

export function SessionCard({ session, isUpcoming }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusColor = (status: ScheduledSession['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: ScheduledSession['status']) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon size={12} />
      case 'completed':
        return <CheckCircleIcon size={12} />
      case 'cancelled':
        return <XCircleIcon size={12} />
      default:
        return <ClockIcon size={12} />
    }
  }

  const getStatusText = (status: ScheduledSession['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada'
      case 'completed':
        return 'Concluída'
      case 'cancelled':
        return 'Cancelada'
      default:
        return 'Agendada'
    }
  }

  return (
    <div className={`
      p-4 rounded-lg border transition-colors
      ${isUpcoming 
        ? 'bg-white border-gray-200 hover:border-gray-300' 
        : 'bg-gray-50 border-gray-100'
      }
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {session.courseName}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <UserIcon size={14} />
            <span>{session.tutorName}</span>
          </div>
        </div>
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1
          ${getStatusColor(session.status)}
        `}>
          {getStatusIcon(session.status)}
          {getStatusText(session.status)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon size={14} />
          <span className="capitalize">{formatDate(session.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon size={14} />
          <span>{formatTime(session.time)}</span>
        </div>

        {session.notes && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquareIcon size={14} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{session.notes}</span>
          </div>
        )}
      </div>

      {isUpcoming && session.status === 'scheduled' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">
              Cancelar
            </button>
            <button className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
              Reagendar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
