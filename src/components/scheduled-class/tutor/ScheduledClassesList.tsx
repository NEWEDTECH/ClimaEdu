'use client'

import { useState } from 'react'
import { CalendarIcon, ClockIcon, LinkIcon, UsersIcon, EditIcon, XIcon } from 'lucide-react'
import { Pagination } from '@/components/pagination/Pagination'
import type { ScheduledClass, TutorClassOption } from '@/_core/modules/scheduled-class'
import {
  ScheduledClassDateUtils,
  MeetingPlatformUtils,
  ScheduledClassStatusUtils
} from '../shared/scheduled-class-utils'

type TabKey = 'upcoming' | 'past'

const PAGE_SIZE = 5

interface ScheduledClassesListProps {
  scheduledClasses: ScheduledClass[]
  tutorClasses: TutorClassOption[]
  onEdit: (scheduledClass: ScheduledClass) => void
  onCancel: (scheduledClass: ScheduledClass) => void
  saving: boolean
}

export function ScheduledClassesList({
  scheduledClasses,
  tutorClasses,
  onEdit,
  onCancel,
  saving
}: ScheduledClassesListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [currentPage, setCurrentPage] = useState(1)

  const classNameById = new Map(tutorClasses.map(option => [option.classId, option.className]))

  const upcomingClasses = scheduledClasses
    .filter(scheduledClass => scheduledClass.isUpcoming())
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())

  const pastClasses = scheduledClasses
    .filter(scheduledClass => !scheduledClass.isUpcoming())
    .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())

  const visibleClasses = activeTab === 'upcoming' ? upcomingClasses : pastClasses
  const totalPages = Math.ceil(visibleClasses.length / PAGE_SIZE)
  const paginatedClasses = visibleClasses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-gray-700">
        <TabButton
          label={`Próximas (${upcomingClasses.length})`}
          isActive={activeTab === 'upcoming'}
          onClick={() => handleTabChange('upcoming')}
        />
        <TabButton
          label={`Realizadas / Canceladas (${pastClasses.length})`}
          isActive={activeTab === 'past'}
          onClick={() => handleTabChange('past')}
        />
      </div>

      {/* List */}
      {visibleClasses.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">
          {activeTab === 'upcoming'
            ? 'Nenhuma aula agendada. Clique em "Agendar Aula" para criar uma.'
            : 'Nenhuma aula realizada ou cancelada ainda.'}
        </p>
      ) : (
        <ul className="divide-y dark:divide-gray-700 border dark:border-gray-700 rounded-lg">
          {paginatedClasses.map(scheduledClass => (
            <li
              key={scheduledClass.id}
              className="px-3 py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {scheduledClass.title || 'Aula ao vivo'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ScheduledClassStatusUtils.getColor(scheduledClass)}`}
                  >
                    {ScheduledClassStatusUtils.getLabel(scheduledClass)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <UsersIcon size={12} />
                    {classNameById.get(scheduledClass.classId) ?? 'Turma'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={12} />
                    {ScheduledClassDateUtils.formatDateTime(scheduledClass.scheduledDate)}
                  </span>
                  <a
                    href={scheduledClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <LinkIcon size={12} />
                    {MeetingPlatformUtils.getPlatform(scheduledClass.meetingUrl)}
                  </a>
                </div>

                {scheduledClass.isCancelled() && scheduledClass.cancelReason && (
                  <p className="text-xs text-red-600 truncate">Motivo: {scheduledClass.cancelReason}</p>
                )}
              </div>

              {scheduledClass.isUpcoming() && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(scheduledClass)}
                    disabled={saving}
                    title="Editar aula"
                    className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => onCancel(scheduledClass)}
                    disabled={saving}
                    title="Cancelar aula"
                    className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}
