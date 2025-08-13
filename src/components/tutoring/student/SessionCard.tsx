'use client'

import type { TutoringSession } from '@/_core/modules/tutoring'
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface SessionCardProps {
  session: TutoringSession
  isUpcoming: boolean
  onCancel?: () => void
  cancelling?: boolean
}

export function SessionCard({ session, isUpcoming, onCancel, cancelling }: SessionCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: TutoringSession['status']) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: TutoringSession['status']) => {
    switch (status) {
      case 'REQUESTED':
        return <ClockIcon size={12} />
      case 'SCHEDULED':
        return <ClockIcon size={12} />
      case 'IN_PROGRESS':
        return <ClockIcon size={12} />
      case 'COMPLETED':
        return <CheckCircleIcon size={12} />
      case 'CANCELLED':
        return <XCircleIcon size={12} />
      case 'NO_SHOW':
        return <XCircleIcon size={12} />
      default:
        return <ClockIcon size={12} />
    }
  }

  const getStatusText = (status: TutoringSession['status']) => {
    switch (status) {
      case 'REQUESTED':
        return 'Solicitada'
      case 'SCHEDULED':
        return 'Agendada'
      case 'IN_PROGRESS':
        return 'Em Andamento'
      case 'COMPLETED':
        return 'Concluída'
      case 'CANCELLED':
        return 'Cancelada'
      case 'NO_SHOW':
        return 'Não Compareceu'
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
            Sessão de Tutoria
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <UserIcon size={14} />
            <span>Professor Disponível</span>
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
          <span className="capitalize">{formatDate(session.scheduledDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon size={14} />
          <span>{formatTime(session.scheduledDate)}</span>
        </div>

        {session.studentQuestion && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquareIcon size={14} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{session.studentQuestion}</span>
          </div>
        )}

        {session.tutorNotes && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquareIcon size={14} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2 italic">Notas do tutor: {session.tutorNotes}</span>
          </div>
        )}
      </div>

      {isUpcoming && (session.status === 'REQUESTED' || session.status === 'SCHEDULED') && onCancel && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button 
              onClick={onCancel}
              disabled={cancelling}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Cancelando...' : 'Cancelar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
