'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TimeSlot, DayOfWeek } from '@/_core/modules/tutoring'
import { Button } from '@/components/button'
import { 
  XIcon, 
  ClockIcon, 
  CalendarIcon,
  AlertCircleIcon,
  SaveIcon
} from 'lucide-react'

const DAYS_OF_WEEK = [
  { value: DayOfWeek.SUNDAY, label: 'Domingo' },
  { value: DayOfWeek.MONDAY, label: 'Segunda-feira' },
  { value: DayOfWeek.TUESDAY, label: 'Terça-feira' },
  { value: DayOfWeek.WEDNESDAY, label: 'Quarta-feira' },
  { value: DayOfWeek.THURSDAY, label: 'Quinta-feira' },
  { value: DayOfWeek.FRIDAY, label: 'Sexta-feira' },
  { value: DayOfWeek.SATURDAY, label: 'Sábado' }
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

const formSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de fim é obrigatório'),
  recurrenceEndDate: z.string().optional()
}).refine((data) => {
  const startMinutes = timeToMinutes(data.startTime)
  const endMinutes = timeToMinutes(data.endTime)
  return startMinutes < endMinutes
}, {
  message: 'Horário de início deve ser anterior ao horário de fim',
  path: ['endTime']
}).refine((data) => {
  const startMinutes = timeToMinutes(data.startTime)
  const endMinutes = timeToMinutes(data.endTime)
  return (endMinutes - startMinutes) >= 30
}, {
  message: 'Duração mínima é de 30 minutos',
  path: ['endTime']
}).refine((data) => {
  const startMinutes = timeToMinutes(data.startTime)
  const endMinutes = timeToMinutes(data.endTime)
  return (endMinutes - startMinutes) <= 480
}, {
  message: 'Duração máxima é de 8 horas',
  path: ['endTime']
})

type FormValues = z.infer<typeof formSchema>

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

interface TimeSlotEditorProps {
  isOpen: boolean
  selectedDay: DayOfWeek | null
  onClose: () => void
  onSave: (data: {
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    recurrenceEndDate?: Date
  }) => Promise<void>
  existingTimeSlots: TimeSlot[]
}

export function TimeSlotEditor({
  isOpen,
  selectedDay,
  onClose,
  onSave,
  existingTimeSlots
}: TimeSlotEditorProps) {
  const [saving, setSaving] = useState(false)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOfWeek: selectedDay ?? DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '10:00',
      recurrenceEndDate: ''
    }
  })

  const watchedDayOfWeek = watch('dayOfWeek')
  const watchedStartTime = watch('startTime')
  const watchedEndTime = watch('endTime')

  useEffect(() => {
    if (selectedDay !== null) {
      setValue('dayOfWeek', selectedDay)
    }
  }, [selectedDay, setValue])

  useEffect(() => {
    if (watchedStartTime && watchedEndTime && watchedDayOfWeek !== undefined) {
      checkForConflicts()
    }
  }, [watchedDayOfWeek, watchedStartTime, watchedEndTime])

  const checkForConflicts = () => {
    if (!watchedStartTime || !watchedEndTime) return

    const daySlots = existingTimeSlots.filter(slot => slot.dayOfWeek === watchedDayOfWeek)
    
    const startMinutes = timeToMinutes(watchedStartTime)
    const endMinutes = timeToMinutes(watchedEndTime)

    const hasConflict = daySlots.some(slot => {
      const slotStart = timeToMinutes(slot.startTime)
      const slotEnd = timeToMinutes(slot.endTime)
      
      return (startMinutes < slotEnd && slotStart < endMinutes)
    })

    if (hasConflict) {
      const conflictingSlot = daySlots.find(slot => {
        const slotStart = timeToMinutes(slot.startTime)
        const slotEnd = timeToMinutes(slot.endTime)
        return (startMinutes < slotEnd && slotStart < endMinutes)
      })
      
      setConflictWarning(
        `Conflito com horário existente: ${conflictingSlot?.startTime} - ${conflictingSlot?.endTime}`
      )
    } else {
      setConflictWarning(null)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (conflictWarning) {
      return
    }

    try {
      setSaving(true)
      
      await onSave({
        dayOfWeek: data.dayOfWeek as DayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined
      })
      
      reset()
      onClose()
    } catch {
      // Error is handled by parent component
    } finally {
      setSaving(false)
    }
  }

  const getDurationText = () => {
    if (!watchedStartTime || !watchedEndTime) return ''
    
    const startMinutes = timeToMinutes(watchedStartTime)
    const endMinutes = timeToMinutes(watchedEndTime)
    const duration = endMinutes - startMinutes
    
    if (duration >= 60) {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`
    }
    return `${duration}min`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Adicionar Horário
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Day of Week */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon size={16} />
              Dia da Semana
            </label>
            <select
              {...register('dayOfWeek', { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="text-sm text-red-600 mt-1">{errors.dayOfWeek.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ClockIcon size={16} />
                Início
              </label>
              <select
                {...register('startTime')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.startTime && (
                <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ClockIcon size={16} />
                Fim
              </label>
              <select
                {...register('endTime')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.endTime && (
                <p className="text-sm text-red-600 mt-1">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {watchedStartTime && watchedEndTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Duração:</strong> {getDurationText()}
              </p>
            </div>
          )}

          {/* Conflict Warning */}
          {conflictWarning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircleIcon size={16} className="text-red-600" />
                <p className="text-sm text-red-800">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* Recurrence End Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon size={16} />
              Data de Fim da Recorrência (opcional)
            </label>
            <input
              type="date"
              {...register('recurrenceEndDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se não especificado, o horário será recorrente indefinidamente
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving || !!conflictWarning}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <SaveIcon size={16} />
              )}
              {saving ? 'Salvando...' : 'Salvar Horário'}
            </Button>
            
            <Button
              type="button"
              onClick={onClose}
              className="px-6 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
