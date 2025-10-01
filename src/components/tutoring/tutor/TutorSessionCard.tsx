'use client'

import { TutoringSession } from '@/_core/modules/tutoring'
import { TutoringStatusUtils, SessionPriorityUtils, TutoringDateUtils, MeetingUrlUtils } from '../shared/tutoring-utils'
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, AlertCircleIcon, LinkIcon, ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/button'

interface TutorSessionCardProps {
  session: TutoringSession
  onClick: () => void
}

export function TutorSessionCard({ session, onClick }: TutorSessionCardProps) {
  // Get icon component for status
  const StatusIcon = TutoringStatusUtils.getIcon(session.status)

  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            Estudante {session.studentId.slice(-4)}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            Curso {session.courseId.slice(-4)}
          </p>
        </div>
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1
          ${TutoringStatusUtils.getColor(session.status)}
        `}>
          <StatusIcon size={12} />
          {TutoringStatusUtils.getLabel(session.status)}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon size={14} />
          <span className="capitalize">{TutoringDateUtils.formatDate(session.scheduledDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon size={14} />
          <span>{TutoringDateUtils.formatTime(session.scheduledDate)} ({session.duration}min)</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <AlertCircleIcon size={14} className={SessionPriorityUtils.getColor(session.priority)} />
          <span className={`font-medium ${SessionPriorityUtils.getColor(session.priority)}`}>
            Prioridade {SessionPriorityUtils.getLabel(session.priority)}
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
          <span>student-{session.studentId.slice(-4)}@email.com</span>
        </div>
        
        <div className="flex items-center gap-2">
          {session.meetingUrl && (
            <a
              href={session.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded hover:bg-green-200 transition-colors"
              title={`Entrar na reunião - ${MeetingUrlUtils.getMeetingPlatform(session.meetingUrl)}`}
            >
              <LinkIcon size={12} />
              <ExternalLinkIcon size={10} />
            </a>
          )}
          
          <Button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Ver detalhes →
          </Button>
        </div>
      </div>
    </div>
  )
}
