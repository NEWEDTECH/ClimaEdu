'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { CourseSelect } from './CourseSelect'
import { TutorSelect } from './TutorSelect'
import { DatePicker } from './DatePicker'
import { DurationSelector } from './DurationSelector'
import { AvailableTimeSlotsList } from './AvailableTimeSlotsList'
import { useTutoringScheduler, useStudentEnrolledCourses, useCourseTutors } from '@/hooks/tutoring'
import { useAvailableTimeSlots } from '@/hooks/tutoring/useAvailableTimeSlots'
import type { Course } from '@/_core/modules/content'
import type { AvailableTimeSlot } from '@/_core/modules/tutoring'
import { CalendarIcon, BookOpenIcon, MessageSquareIcon, UserIcon } from 'lucide-react'

// Availability is searched with the minimum duration so every free start time
// appears; the actual duration is chosen afterwards, limited to the free window
const MIN_SESSION_DURATION = 30
const MAX_SESSION_DURATION = 120
const START_TIME_INTERVAL = 15

const formSchema = z.object({
  subjectId: z.string().min(1, { message: 'Selecione um curso' }),
  date: z.string().min(1, { message: 'Selecione uma data' }),
  duration: z.number().min(30, { message: 'Duração mínima é 30 minutos' }),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface TutoringScheduleFormProps {
  studentId: string
  onSchedule: () => Promise<void>
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function TutoringScheduleForm({ studentId, onSchedule }: TutoringScheduleFormProps) {
  const { courses, loading, error } = useStudentEnrolledCourses({ studentId })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTutorId, setSelectedTutorId] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    slot: AvailableTimeSlot
    startTime: string
  } | null>(null)

  const { scheduleSession, loading: scheduling, error: scheduleError } = useTutoringScheduler()
  const { tutors, loading: loadingTutors, error: tutorsError } = useCourseTutors(selectedCourse?.id ?? null)
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
      duration: MIN_SESSION_DURATION,
      notes: ''
    }
  })

  const watchedSubjectId = watch('subjectId')
  const watchedDate = watch('date')
  const watchedDuration = watch('duration')

  // Single tutor → auto-select; multiple → student picks in the select
  useEffect(() => {
    if (tutors.length === 1) {
      setSelectedTutorId(tutors[0].id)
    } else {
      setSelectedTutorId('')
    }
  }, [tutors])

  // Any change in course/tutor/date invalidates the current selection
  useEffect(() => {
    clearResults()
    setSelectedTimeSlot(null)
  }, [watchedSubjectId, selectedTutorId, watchedDate, clearResults])

  const fetchAvailability = useCallback(async () => {
    if (!watchedSubjectId || !selectedTutorId || !watchedDate) return

    try {
      // Parse as local midnight to avoid UTC offset shifting the day of week
      const [year, month, day] = watchedDate.split('-').map(Number)
      const searchDate = new Date(year, month - 1, day)

      await findAvailableSlots({
        courseId: watchedSubjectId,
        tutorId: selectedTutorId,
        date: searchDate,
        duration: MIN_SESSION_DURATION
      })
    } catch (error) {
      console.error('Error searching availability:', error)
    }
  }, [watchedSubjectId, selectedTutorId, watchedDate, findAvailableSlots])

  // Availability renders automatically once course + tutor + date are set
  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  /**
   * Longest free window (in minutes) starting at the selected time.
   * Each available start time guarantees 30 free minutes; consecutive starts
   * in 15-minute steps extend the window, so booked sessions naturally cap it.
   */
  const maxDurationForSelection = useMemo(() => {
    if (!selectedTimeSlot) return MAX_SESSION_DURATION

    const availableSet = new Set(selectedTimeSlot.slot.availableStartTimes)
    const startMinutes = timeToMinutes(selectedTimeSlot.startTime)

    let freeUntil = startMinutes
    for (
      let current = startMinutes;
      availableSet.has(minutesToTime(current));
      current += START_TIME_INTERVAL
    ) {
      freeUntil = current + MIN_SESSION_DURATION
    }

    return Math.min(freeUntil - startMinutes, MAX_SESSION_DURATION)
  }, [selectedTimeSlot])

  // Keep the chosen duration valid when the selected time changes
  useEffect(() => {
    if (watchedDuration > maxDurationForSelection) {
      setValue('duration', MIN_SESSION_DURATION)
    }
  }, [maxDurationForSelection, watchedDuration, setValue])

  const handleSubjectChange = (subjectId: string) => {
    setValue('subjectId', subjectId)
    const course = courses.find((c: Course) => c.id === subjectId)
    setSelectedCourse(course || null)
    setSelectedTutorId('')
  }

  const handleDateChange = (date: string) => {
    setValue('date', date)
  }

  const handleDurationChange = (duration: number) => {
    setValue('duration', duration)
  }

  const handleTimeSlotSelect = (slot: AvailableTimeSlot, startTime: string) => {
    setSelectedTimeSlot(prev =>
      prev?.startTime === startTime && prev.slot.timeSlot.id === slot.timeSlot.id
        ? null
        : { slot, startTime }
    )
  }

  const onSubmit = async (data: FormValues) => {
    if (!selectedTimeSlot || !selectedTutorId) {
      return
    }

    try {
      const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number)
      const [year, month, day] = data.date.split('-').map(Number)
      const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

      await scheduleSession({
        studentId,
        courseId: data.subjectId,
        tutorId: selectedTutorId,
        scheduledDate,
        duration: data.duration,
        studentQuestion: data.notes || 'Sessão de tutoria agendada'
      })

      reset()
      setSelectedCourse(null)
      setSelectedTutorId('')
      setSelectedTimeSlot(null)
      clearResults()
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

  const hasMultipleTutors = tutors.length > 1
  const showAvailability = !!(watchedSubjectId && selectedTutorId && watchedDate)
  const selectedTutorName = tutors.find(tutor => tutor.id === selectedTutorId)?.name

  return (
    <div className="space-y-6">
      {(scheduleError || slotsError || tutorsError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Erro: {scheduleError || slotsError || tutorsError}
          </p>
        </div>
      )}

      <FormSection onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
              <BookOpenIcon size={16} />
              Curso
            </label>
            <CourseSelect
              courses={courses}
              selectedCourseId={watchedSubjectId}
              onCourseChange={handleSubjectChange}
              error={errors.subjectId?.message}
            />
          </div>

          {/* Tutor Selection */}
          {selectedCourse && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                <UserIcon size={16} />
                Tutor
              </label>

              {loadingTutors ? (
                <p className="text-sm text-gray-500">Carregando tutores...</p>
              ) : tutors.length === 0 ? (
                <p className="text-sm text-amber-600">
                  Nenhum tutor disponível para este curso.
                </p>
              ) : hasMultipleTutors ? (
                <TutorSelect
                  tutors={tutors}
                  selectedTutorId={selectedTutorId}
                  onTutorChange={setSelectedTutorId}
                />
              ) : (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tutor:</strong> {selectedTutorName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Date Selection */}
          {selectedTutorId && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                <CalendarIcon size={16} />
                Data
              </label>
              <DatePicker
                selectedDate={watchedDate}
                onDateChange={handleDateChange}
                error={errors.date?.message}
              />
            </div>
          )}

          {/* Available Time Slots (rendered automatically) */}
          {showAvailability && (
            <AvailableTimeSlotsList
              availableSlots={availableSlots}
              selectedDate={(() => { const [y, m, d] = watchedDate.split('-').map(Number); return new Date(y, m - 1, d) })()}
              selectedStartTime={selectedTimeSlot?.startTime ?? null}
              onTimeSlotSelect={handleTimeSlotSelect}
              loading={searchingSlots}
            />
          )}

          {/* Duration Selection (after picking a start time) */}
          {selectedTimeSlot && (
            <DurationSelector
              selectedDuration={watchedDuration}
              onDurationChange={handleDurationChange}
              maxDuration={maxDurationForSelection}
            />
          )}

          {/* Notes */}
          {selectedTimeSlot && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
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
              {scheduling
                ? 'Agendando...'
                : `Confirmar Agendamento (${selectedTimeSlot.startTime} - ${minutesToTime(timeToMinutes(selectedTimeSlot.startTime) + watchedDuration)})`}
            </Button>
          )}
        </div>
      </FormSection>
    </div>
  )
}
