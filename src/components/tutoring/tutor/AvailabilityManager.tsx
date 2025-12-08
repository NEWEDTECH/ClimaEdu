'use client'

import { useState, useEffect } from 'react'
import { useAvailabilityManager } from '@/hooks/tutoring/useAvailabilityManager'
import { DayOfWeek } from '@/_core/modules/tutoring'
import { Button } from '@/components/button'
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid'
import { TimeSlotEditor } from './TimeSlotEditor'
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react'

interface AvailabilityManagerProps {
  tutorId: string
}

export function AvailabilityManager({ tutorId }: AvailabilityManagerProps) {
  const {
    loading,
    error,
    timeSlots,
    loadTimeSlots,
    createTimeSlot,
    deleteTimeSlot,
    updateTimeSlotAvailability
  } = useAvailabilityManager(tutorId)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadTimeSlots()
  }, [loadTimeSlots])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleCreateTimeSlot = async (data: {
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    recurrenceEndDate?: Date
  }) => {
    try {
      await createTimeSlot({
        tutorId,
        ...data
      })
      setIsEditorOpen(false)
      setSelectedDay(null)
      setSuccessMessage('Horário criado com sucesso!')
    } catch {
      // Error is handled by the hook
    }
  }

  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) {
      return
    }

    try {
      await deleteTimeSlot(timeSlotId)
      setSuccessMessage('Horário excluído com sucesso!')
    } catch {
      // Error is handled by the hook
    }
  }

  const handleToggleAvailability = async (timeSlotId: string, isAvailable: boolean) => {
    try {
      await updateTimeSlotAvailability(timeSlotId, isAvailable)
      setSuccessMessage(
        isAvailable ? 'Horário ativado com sucesso!' : 'Horário desativado com sucesso!'
      )
    } catch {
      // Error is handled by the hook
    }
  }

  const handleAddTimeSlot = (dayOfWeek?: DayOfWeek) => {
    setSelectedDay(dayOfWeek || null)
    setIsEditorOpen(true)
  }

  const totalActiveSlots = timeSlots.filter(slot => slot.isCurrentlyActive()).length
  const totalWeeklyHours = timeSlots
    .filter(slot => slot.isCurrentlyActive())
    .reduce((sum, slot) => sum + slot.getDurationInHours(), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciar Disponibilidade
          </h1>
          <p className="text-gray-600 mt-1 dark:text-white">
            Configure seus horários disponíveis para tutoria
          </p>
        </div>
        <Button
          onClick={() => handleAddTimeSlot()}
          className="flex items-center gap-2"
        >
          Adicionar Horário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Horários Ativos
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {totalActiveSlots}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ClockIcon size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Horas Semanais
              </p>
              <p className="text-2xl font-bold text-green-600">
                {totalWeeklyHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={20} className="text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Status
              </p>
              <p className="text-sm font-semibold text-purple-600">
                {totalActiveSlots > 0 ? 'Disponível' : 'Sem horários'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircleIcon size={16} className="text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} className="text-green-600" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Grade Semanal
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Visualize e gerencie seus horários por dia da semana
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando horários...</p>
              </div>
            </div>
          ) : (
            <WeeklyScheduleGrid
              timeSlots={timeSlots}
              onAddTimeSlot={handleAddTimeSlot}
              onDeleteTimeSlot={handleDeleteTimeSlot}
              onToggleAvailability={handleToggleAvailability}
            />
          )}
        </div>
      </div>

      {/* Time Slot Editor Modal */}
      {isEditorOpen && (
        <TimeSlotEditor
          isOpen={isEditorOpen}
          selectedDay={selectedDay}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedDay(null)
          }}
          onSave={handleCreateTimeSlot}
          existingTimeSlots={timeSlots}
        />
      )}
    </div>
  )
}
