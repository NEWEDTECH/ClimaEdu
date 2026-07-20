'use client'

import { useState } from 'react'
import { CalendarIcon, ClockIcon, UsersIcon, VideoIcon } from 'lucide-react'
import { Pagination } from '@/components/pagination/Pagination'
import type { StudentScheduledClassItem } from '@/_core/modules/scheduled-class'
import {
  ScheduledClassDateUtils,
  MeetingPlatformUtils,
  ScheduledClassStatusUtils
} from '../shared/scheduled-class-utils'

const PAGE_SIZE = 6

interface StudentClassesCardsProps {
  items: StudentScheduledClassItem[]
  loading: boolean
  error: string | null
}

export function StudentClassesCards({ items, loading, error }: StudentClassesCardsProps) {
  const [currentPage, setCurrentPage] = useState(1)

  if (loading) {
    return <p className="text-center text-gray-500 py-8 text-sm">Carregando aulas...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 py-8 text-sm">Erro ao carregar aulas: {error}</p>
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-8 text-sm">Nenhuma aula agendada no momento.</p>
  }

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const paginatedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedItems.map(({ scheduledClass, className }) => (
          <div
            key={scheduledClass.id}
            className="border dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {scheduledClass.title || 'Aula ao vivo'}
              </p>
              <span
                className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${ScheduledClassStatusUtils.getColor(scheduledClass)}`}
              >
                {ScheduledClassStatusUtils.getLabel(scheduledClass)}
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-1.5">
                <UsersIcon size={13} className="shrink-0" />
                {className}
              </p>
              <p className="flex items-center gap-1.5">
                <CalendarIcon size={13} className="shrink-0" />
                {ScheduledClassDateUtils.formatDate(scheduledClass.scheduledDate)}
              </p>
              <p className="flex items-center gap-1.5">
                <ClockIcon size={13} className="shrink-0" />
                {ScheduledClassDateUtils.formatTime(scheduledClass.scheduledDate)} · {MeetingPlatformUtils.getPlatform(scheduledClass.meetingUrl)}
              </p>
              {scheduledClass.isCancelled() && scheduledClass.cancelReason && (
                <p className="text-red-600 line-clamp-2">Motivo: {scheduledClass.cancelReason}</p>
              )}
            </div>

            {scheduledClass.isUpcoming() && (
              <a
                href={scheduledClass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-primary text-secondary shadow-sm hover:bg-primary/90 transition-colors"
              >
                <VideoIcon size={13} />
                Entrar na aula
              </a>
            )}
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
