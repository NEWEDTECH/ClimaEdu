'use client'

import { CalendarIcon, ClockIcon, UsersIcon, VideoIcon } from 'lucide-react'
import type { StudentScheduledClassItem } from '@/_core/modules/scheduled-class'
import { ScheduledClassDateUtils, MeetingPlatformUtils } from '../shared/scheduled-class-utils'

interface UpcomingClassesListProps {
  items: StudentScheduledClassItem[]
  loading: boolean
  error: string | null
}

export function UpcomingClassesList({ items, loading, error }: UpcomingClassesListProps) {
  if (loading) {
    return <p className="text-center text-gray-500 py-6">Carregando próximas aulas...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 py-6">Erro ao carregar aulas: {error}</p>
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-6">Nenhuma aula agendada no momento.</p>
  }

  return (
    <ul className="space-y-3">
      {items.map(({ scheduledClass, className }) => (
        <li
          key={scheduledClass.id}
          className="border dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white">
              {scheduledClass.title || 'Aula ao vivo'}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <UsersIcon size={14} />
                {className}
              </span>
              <span className="flex items-center gap-1 capitalize">
                <CalendarIcon size={14} />
                {ScheduledClassDateUtils.formatDate(scheduledClass.scheduledDate)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon size={14} />
                {ScheduledClassDateUtils.formatTime(scheduledClass.scheduledDate)}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {MeetingPlatformUtils.getPlatform(scheduledClass.meetingUrl)}
            </p>
          </div>

          <a
            href={scheduledClass.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-primary text-secondary shadow-sm hover:bg-primary/90 transition-colors"
          >
            <VideoIcon size={14} />
            Entrar na aula
          </a>
        </li>
      ))}
    </ul>
  )
}
