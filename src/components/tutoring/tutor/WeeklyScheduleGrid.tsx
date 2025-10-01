'use client'

import { TimeSlot, DayOfWeek } from '@/_core/modules/tutoring'
import { Button } from '@/components/button'
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeOffIcon,
  ClockIcon
} from 'lucide-react'

interface WeeklyScheduleGridProps {
  timeSlots: TimeSlot[]
  onAddTimeSlot: (dayOfWeek: DayOfWeek) => void
  onDeleteTimeSlot: (timeSlotId: string) => void
  onToggleAvailability: (timeSlotId: string, isAvailable: boolean) => void
}

const DAYS_OF_WEEK = [
  { value: DayOfWeek.SUNDAY, label: 'Domingo', short: 'Dom' },
  { value: DayOfWeek.MONDAY, label: 'Segunda', short: 'Seg' },
  { value: DayOfWeek.TUESDAY, label: 'Terça', short: 'Ter' },
  { value: DayOfWeek.WEDNESDAY, label: 'Quarta', short: 'Qua' },
  { value: DayOfWeek.THURSDAY, label: 'Quinta', short: 'Qui' },
  { value: DayOfWeek.FRIDAY, label: 'Sexta', short: 'Sex' },
  { value: DayOfWeek.SATURDAY, label: 'Sábado', short: 'Sáb' }
]

export function WeeklyScheduleGrid({
  timeSlots,
  onAddTimeSlot,
  onDeleteTimeSlot,
  onToggleAvailability
}: WeeklyScheduleGridProps) {
  
  const getTimeSlotsForDay = (dayOfWeek: DayOfWeek) => {
    return timeSlots
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`
  }

  const getDurationText = (slot: TimeSlot) => {
    const duration = slot.getDurationInMinutes()
    if (duration >= 60) {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`
    }
    return `${duration}min`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {DAYS_OF_WEEK.map((day) => {
        const daySlots = getTimeSlotsForDay(day.value)
        
        return (
          <div key={day.value} className="border border-gray-200 rounded-lg">
            {/* Day Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {day.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {daySlots.length} horário{daySlots.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  onClick={() => onAddTimeSlot(day.value)}
                  className="p-1 h-8 w-8 bg-blue-600 hover:bg-blue-700"
                  title={`Adicionar horário para ${day.label}`}
                >
                  <PlusIcon size={14} />
                </Button>
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-3 space-y-2 min-h-[200px]">
              {daySlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClockIcon size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Nenhum horário configurado
                  </p>
                  <Button
                    onClick={() => onAddTimeSlot(day.value)}
                    className="mt-2 text-xs px-3 py-1 h-auto"
                  >
                    Adicionar
                  </Button>
                </div>
              ) : (
                daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      slot.isCurrentlyActive()
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Time Range */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        slot.isCurrentlyActive()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getDurationText(slot)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium ${
                        slot.isCurrentlyActive()
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {slot.isCurrentlyActive() ? 'Ativo' : 'Inativo'}
                      </span>
                      
                      {slot.recurrenceEndDate && (
                        <span className="text-xs text-gray-500">
                          Até {slot.recurrenceEndDate.toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => onToggleAvailability(slot.id, !slot.isAvailable)}
                        className={`p-1 h-6 w-6 ${
                          slot.isAvailable
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                        title={slot.isAvailable ? 'Desativar' : 'Ativar'}
                      >
                        {slot.isAvailable ? (
                          <EyeOffIcon size={12} />
                        ) : (
                          <EyeIcon size={12} />
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => onDeleteTimeSlot(slot.id)}
                        className="p-1 h-6 w-6 bg-red-600 hover:bg-red-700"
                        title="Excluir horário"
                      >
                        <TrashIcon size={12} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
