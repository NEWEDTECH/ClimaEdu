'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { CourseSelect } from './CourseSelect'
import { DatePicker } from './DatePicker'
import { DurationSelector } from './DurationSelector'
import { AvailableTimeSlotsList } from './AvailableTimeSlotsList'
import { useTutoringScheduler } from '@/hooks/tutoring'
import { useAvailableTimeSlots } from '@/hooks/tutoring/useAvailableTimeSlots'
import type { Course } from '@/_core/modules/content'
import type { AvailableTimeSlot } from '@/_core/modules/tutoring'
import { CalendarIcon, BookOpenIcon, MessageSquareIcon, SearchIcon } from 'lucide-react'

const formSchema = z.object({
  subjectId: z.string().min(1, { message: 'Selecione um curso' }),
  date: z.string().min(1, { message: 'Selecione uma data' }),
  duration: z.number().min(30, { message: 'Duração mínima é 30 minutos' }),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface TutoringScheduleFormProps {
  courses: Course[]
  loading: boolean
  error: string | null
  studentId: string
  onSchedule: () => Promise<void>
}

export function TutoringScheduleForm({ courses, loading, error, studentId, onSchedule }: TutoringScheduleFormProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    slot: AvailableTimeSlot
    startTime: string
  } | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const { scheduleSession, loading: scheduling, error: scheduleError } = useTutoringScheduler()
  const { 
    availableSlots, 
    loading: searchingSlots, 
    error: slotsError, 
    findAvailableSlots,
    clearResults 
  } = useAvailableTimeSlots()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: '',
      date: '',
      duration: 60,
      notes: ''
    }
  })

  const watchedSubjectId = watch('subjectId')
  const watchedDate = watch('date')
  const watchedDuration = watch('duration')

  // Clear results when form values change (but not when hasSearched changes)
  useEffect(() => {
    clearResults()
    setSelectedTimeSlot(null)
    setHasSearched(false)
  }, [watchedSubjectId, watchedDate, watchedDuration, clearResults])

  const handleSubjectChange = (subjectId: string) => {
    setValue('subjectId', subjectId)
    const course = courses.find((c: Course) => c.id === subjectId)
    setSelectedCourse(course || null)
  }

  const handleDateChange = (date: string) => {
    setValue('date', date)
  }

  const handleDurationChange = (duration: number) => {
    setValue('duration', duration)
  }

  const handleSearchAvailability = async () => {
    if (!watchedSubjectId || !watchedDate || !watchedDuration) {
      return
    }

    try {
      const searchDate = new Date(watchedDate)
      await findAvailableSlots({
        courseId: watchedSubjectId,
        date: searchDate,
        duration: watchedDuration
      })
      setHasSearched(true)
    } catch (error) {
      console.error('Error searching availability:', error)
    }
  }

  const handleTimeSlotSelect = (slot: AvailableTimeSlot, startTime: string) => {
    setSelectedTimeSlot({ slot, startTime })
  }

  const onSubmit = async (data: FormValues) => {
    if (!selectedTimeSlot) {
      return
    }

    try {
      // Create the scheduled date with the selected time
      const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number)
      const scheduledDate = new Date(data.date)
      scheduledDate.setHours(hours, minutes, 0, 0)
      
      await scheduleSession({
        studentId,
        courseId: data.subjectId,
        scheduledDate,
        duration: data.duration,
        studentQuestion: data.notes || 'Sessão de tutoria agendada'
      })
      
      reset()
      setSelectedCourse(null)
      setSelectedTimeSlot(null)
      clearResults()
      setHasSearched(false)
      await onSchedule()
    } catch (error) {
      console.error('Error scheduling session:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Carregando cursos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">Erro ao carregar cursos: {error}</p>
      </div>
    )
  }

  const canSearch = !!(watchedSubjectId && watchedDate && watchedDuration)
  const showAvailability = hasSearched && canSearch

  return (
    <div className="space-y-6">
      {(scheduleError || slotsError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Erro: {scheduleError || slotsError}
          </p>
        </div>
      )}

      <FormSection onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookOpenIcon size={16} />
              Curso
            </label>
            <CourseSelect
              courses={courses}
              selectedCourseId={watchedSubjectId}
              onCourseChange={handleSubjectChange}
              error={errors.subjectId?.message}
            />
            {selectedCourse && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Curso:</strong> {selectedCourse.title}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedCourse.description}
                </p>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarIcon size={16} />
              Data
            </label>
            <DatePicker
              selectedDate={watchedDate}
              onDateChange={handleDateChange}
              error={errors.date?.message}
            />
          </div>

          {/* Duration Selection */}
          <DurationSelector
            selectedDuration={watchedDuration}
            onDurationChange={handleDurationChange}
            disabled={!watchedSubjectId || !watchedDate}
          />

          {/* Search Button */}
          <Button
            type="button"
            onClick={handleSearchAvailability}
            disabled={!canSearch || searchingSlots}
            className="w-full flex items-center justify-center gap-2"
          >
            <SearchIcon size={16} />
            {searchingSlots ? 'Buscando...' : 'Buscar Horários Disponíveis'}
          </Button>

          {/* Available Time Slots */}
          {showAvailability && (
            <AvailableTimeSlotsList
              availableSlots={availableSlots}
              selectedDate={new Date(watchedDate)}
              selectedDuration={watchedDuration}
              onTimeSlotSelect={handleTimeSlotSelect}
              loading={searchingSlots}
            />
          )}

          {/* Notes */}
          {selectedTimeSlot && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquareIcon size={16} />
                Observações (opcional)
              </label>
              <textarea
                {...register('notes')}
                placeholder="Descreva o que gostaria de revisar ou suas dúvidas específicas..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Submit Button */}
          {selectedTimeSlot && (
            <Button
              type="submit"
              disabled={scheduling}
              className="w-full font-medium bg-green-600 hover:bg-green-700"
            >
              {scheduling ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          )}
        </div>
      </FormSection>
    </div>
  )
}
