'use client'

import { TutorSession } from '@/app/tutor/tutoring/data/mockTutorData'
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, PlayIcon } from 'lucide-react'

interface TutorSessionCardProps {
  session: TutorSession
  onClick: () => void
}

export function TutorSessionCard({ session, onClick }: TutorSessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusColor = (status: TutorSession['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: TutorSession['status']) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon size={12} />
      case 'in_progress':
        return <PlayIcon size={12} />
      case 'completed':
        return <CheckCircleIcon size={12} />
      case 'cancelled':
      case 'no_show':
        return <XCircleIcon size={12} />
      default:
        return <ClockIcon size={12} />
    }
  }

  const getStatusText = (status: TutorSession['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada'
      case 'in_progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      case 'cancelled':
        return 'Cancelada'
      case 'no_show':
        return 'Faltou'
      default:
        return 'Agendada'
    }
  }

  const getPriorityColor = (priority: TutorSession['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityText = (priority: TutorSession['priority']) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return 'Média'
    }
  }

  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {session.studentName}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {session.courseName}
          </p>
        </div>
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1
          ${getStatusColor(session.status)}
        `}>
          {getStatusIcon(session.status)}
          {getStatusText(session.status)}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon size={14} />
          <span className="capitalize">{formatDate(session.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon size={14} />
          <span>{formatTime(session.time)} ({session.duration}min)</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <AlertCircleIcon size={14} className={getPriorityColor(session.priority)} />
          <span className={`font-medium ${getPriorityColor(session.priority)}`}>
            Prioridade {getPriorityText(session.priority)}
          </span>
        </div>
      </div>

      {session.studentQuestion && (
        <div className="mb-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquareIcon size={14} className="mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2 text-xs">
              {session.studentQuestion}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <UserIcon size={12} />
          <span>{session.studentEmail}</span>
        </div>
        
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Ver detalhes →
        </button>
      </div>
    </div>
  )
}
