'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import type { AvailableTimeSlot } from '@/_core/modules/tutoring'
import { 
  ClockIcon, 
  UserIcon, 
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react'

interface AvailableTimeSlotsListProps {
  availableSlots: AvailableTimeSlot[]
  selectedDate: Date
  selectedDuration: number
  onTimeSlotSelect: (slot: AvailableTimeSlot, startTime: string) => void
  loading?: boolean
}

export function AvailableTimeSlotsList({
  availableSlots,
  selectedDate,
  selectedDuration,
  onTimeSlotSelect,
  loading = false
}: AvailableTimeSlotsListProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    slotId: string
    startTime: string
  } | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  const handleTimeSlotClick = (slot: AvailableTimeSlot, startTime: string) => {
    const slotKey = `${slot.timeSlot.id}-${startTime}`
    
    if (selectedSlot?.slotId === slotKey) {
      // Deselect if clicking the same slot
      setSelectedSlot(null)
    } else {
      // Select new slot
      setSelectedSlot({
        slotId: slotKey,
        startTime
      })
    }
  }

  const handleConfirmSelection = () => {
    if (!selectedSlot) return

    const slot = availableSlots.find(s => 
      s.availableStartTimes.some(time => 
        `${s.timeSlot.id}-${time}` === selectedSlot.slotId
      )
    )

    if (slot) {
      onTimeSlotSelect(slot, selectedSlot.startTime)
    }
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
          Não encontramos tutores disponíveis para a data e duração selecionadas.
        </p>
        <p className="text-sm text-gray-400 dark:text-white">
          Tente selecionar uma data diferente ou reduzir a duração da sessão.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Horários Disponíveis
          </span>
        </div>
        <p className="text-sm text-blue-700">
          {formatDate(selectedDate)} • Duração: {formatDuration(selectedDuration)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {availableSlots.length} tutor{availableSlots.length !== 1 ? 'es' : ''} disponível{availableSlots.length !== 1 ? 'eis' : ''}
        </p>
      </div>

      {/* Available Slots */}
      <div className="space-y-3">
        {availableSlots.map((slot) => (
          <div
            key={slot.timeSlot.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            {/* Tutor Info */}
            <div className="flex items-center gap-2 mb-3">
              <UserIcon size={16} className="text-gray-600" />
              <span className="font-medium text-gray-900">
                Tutor ID: {slot.tutorId}
              </span>
              <span className="text-sm text-gray-500">
                • {slot.timeSlot.getDayName()}
              </span>
            </div>

            {/* Available Times */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ClockIcon size={14} />
                Horários disponíveis:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slot.availableStartTimes.map((startTime) => {
                  const slotKey = `${slot.timeSlot.id}-${startTime}`
                  const isSelected = selectedSlot?.slotId === slotKey
                  const endTime = calculateEndTime(startTime, selectedDuration)
                  
                  return (
                    <Button
                      key={startTime}
                      onClick={() => handleTimeSlotClick(slot, startTime)}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">
                        {startTime} - {endTime}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Selection */}
      {selectedSlot && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircleIcon size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Horário selecionado: {selectedSlot.startTime} - {calculateEndTime(selectedSlot.startTime, selectedDuration)}
              </span>
            </div>
            <Button
              onClick={handleConfirmSelection}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirmar Agendamento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
