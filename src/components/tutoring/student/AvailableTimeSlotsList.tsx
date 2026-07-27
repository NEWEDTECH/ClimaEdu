'use client'

import { Button } from '@/components/button'
import type { AvailableTimeSlot } from '@/_core/modules/tutoring'
import {
  ClockIcon,
  CalendarIcon,
  AlertCircleIcon
} from 'lucide-react'

interface AvailableTimeSlotsListProps {
  availableSlots: AvailableTimeSlot[]
  selectedDate: Date
  selectedStartTime: string | null
  onTimeSlotSelect: (slot: AvailableTimeSlot, startTime: string) => void
  loading?: boolean
}

export function AvailableTimeSlotsList({
  availableSlots,
  selectedDate,
  selectedStartTime,
  onTimeSlotSelect,
  loading = false
}: AvailableTimeSlotsListProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Buscando horários disponíveis...</p>
        </div>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircleIcon size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
          Nenhum horário disponível
        </h3>
        <p className="text-gray-500 mb-4 dark:text-white">
          O tutor não possui horários disponíveis nesta data.
        </p>
        <p className="text-sm text-gray-400 dark:text-white">
          Tente selecionar uma data diferente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <CalendarIcon size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Horários Disponíveis do Tutor
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 capitalize">
          {formatDate(selectedDate)}
        </p>
      </div>

      {/* Available start times */}
      <div className="space-y-3">
        {availableSlots.map((slot) => (
          <div
            key={slot.timeSlot.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
              <ClockIcon size={14} />
              {slot.timeSlot.startTime} às {slot.timeSlot.endTime}
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slot.availableStartTimes.map((startTime) => {
                const isSelected = selectedStartTime === startTime

                return (
                  <Button
                    key={startTime}
                    type="button"
                    onClick={() => onTimeSlotSelect(slot, startTime)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
                    }`}
                  >
                    {startTime}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
