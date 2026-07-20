'use client'

import { CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react'
import type { StudentScheduledClassItem } from '@/_core/modules/scheduled-class'
import { ScheduledClassDateUtils, ScheduledClassStatusUtils } from '../shared/scheduled-class-utils'

interface PastClassesListProps {
  items: StudentScheduledClassItem[]
  loading: boolean
}

export function PastClassesList({ items, loading }: PastClassesListProps) {
  if (loading) {
    return <p className="text-center text-gray-500 py-6">Carregando histórico de aulas...</p>
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-6">Nenhuma aula realizada ou cancelada ainda.</p>
  }

  return (
    <ul className="space-y-3">
      {items.map(({ scheduledClass, className }) => (
        <li
          key={scheduledClass.id}
          className="border dark:border-gray-700 rounded-lg p-4 space-y-1"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white">
              {scheduledClass.title || 'Aula ao vivo'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${ScheduledClassStatusUtils.getColor(scheduledClass)}`}
            >
              {ScheduledClassStatusUtils.getLabel(scheduledClass)}
            </span>
          </div>

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

          {scheduledClass.isCancelled() && scheduledClass.cancelReason && (
            <p className="text-sm text-red-600">Motivo: {scheduledClass.cancelReason}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
