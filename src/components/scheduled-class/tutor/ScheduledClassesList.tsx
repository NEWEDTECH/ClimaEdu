'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { CalendarIcon, ClockIcon, LinkIcon, UsersIcon, EditIcon, XIcon } from 'lucide-react'
import type { ScheduledClass, TutorClassOption } from '@/_core/modules/scheduled-class'
import {
  ScheduledClassDateUtils,
  MeetingPlatformUtils,
  ScheduledClassStatusUtils
} from '../shared/scheduled-class-utils'

type TabKey = 'upcoming' | 'past'

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

  const classNameById = new Map(tutorClasses.map(option => [option.classId, option.className]))

  const upcomingClasses = scheduledClasses
    .filter(scheduledClass => scheduledClass.isUpcoming())
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())

  const pastClasses = scheduledClasses
    .filter(scheduledClass => !scheduledClass.isUpcoming())
    .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())

  const visibleClasses = activeTab === 'upcoming' ? upcomingClasses : pastClasses

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-gray-700">
        <TabButton
          label={`Próximas (${upcomingClasses.length})`}
          isActive={activeTab === 'upcoming'}
          onClick={() => setActiveTab('upcoming')}
        />
        <TabButton
          label={`Realizadas / Canceladas (${pastClasses.length})`}
          isActive={activeTab === 'past'}
          onClick={() => setActiveTab('past')}
        />
      </div>

      {/* List */}
      {visibleClasses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {activeTab === 'upcoming'
            ? 'Nenhuma aula agendada. Clique em "Agendar Aula" para criar uma.'
            : 'Nenhuma aula realizada ou cancelada ainda.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibleClasses.map(scheduledClass => (
            <li
              key={scheduledClass.id}
              className="border dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
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
                    {classNameById.get(scheduledClass.classId) ?? 'Turma'}
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

                <a
                  href={scheduledClass.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  <LinkIcon size={14} className="shrink-0" />
                  {MeetingPlatformUtils.getPlatform(scheduledClass.meetingUrl)}
                </a>

                {scheduledClass.isCancelled() && scheduledClass.cancelReason && (
                  <p className="text-sm text-red-600">Motivo: {scheduledClass.cancelReason}</p>
                )}
              </div>

              {scheduledClass.isUpcoming() && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => onEdit(scheduledClass)}
                    disabled={saving}
                    className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    icon={<EditIcon size={14} />}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => onCancel(scheduledClass)}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    icon={<XIcon size={14} />}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
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
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}
