'use client'

import type { TutoringSession } from '@/_core/modules/tutoring'
import { TutoringSessionStatus } from '@/_core/modules/tutoring'
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, LinkIcon, ExternalLinkIcon } from 'lucide-react'
import { TutoringStatusUtils, MeetingUrlUtils } from '../shared/tutoring-utils'

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

  // Get icon component for status
  const StatusIcon = TutoringStatusUtils.getIcon(session.status)

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
          ${TutoringStatusUtils.getColor(session.status)}
        `}>
          <StatusIcon size={12} />
          {TutoringStatusUtils.getLabel(session.status)}
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

      {/* Meeting URL for active sessions */}
      {session.meetingUrl && (session.status === TutoringSessionStatus.SCHEDULED || session.status === TutoringSessionStatus.IN_PROGRESS) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            <LinkIcon size={16} />
            <span>Entrar na Reunião</span>
            <ExternalLinkIcon size={14} />
          </a>
          <p className="text-xs text-gray-500 text-center mt-1">
            {MeetingUrlUtils.getMeetingPlatform(session.meetingUrl)}
          </p>
        </div>
      )}

      {/* Cancel button for upcoming sessions */}
      {isUpcoming && (session.status === TutoringSessionStatus.REQUESTED || session.status === TutoringSessionStatus.SCHEDULED) && onCancel && (
        <div className={`mt-3 pt-3 border-t border-gray-100 ${session.meetingUrl ? 'mt-2 pt-2' : ''}`}>
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
