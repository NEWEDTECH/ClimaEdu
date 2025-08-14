'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { CourseSelect } from './CourseSelect'
import { DatePicker } from './DatePicker'
import { TimeSlotPicker } from './TimeSlotPicker'
import { useTutoringScheduler } from '@/hooks/tutoring'
import type { Course } from '@/_core/modules/content'
import { CalendarIcon, ClockIcon, BookOpenIcon, MessageSquareIcon } from 'lucide-react'

const availableTimeSlots = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
]

const formSchema = z.object({
  subjectId: z.string().min(1, { message: 'Selecione um curso' }),
  date: z.string().min(1, { message: 'Selecione uma data' }),
  time: z.string().min(1, { message: 'Selecione um horário' }),
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
  const { scheduleSession, loading: scheduling, error: scheduleError } = useTutoringScheduler()

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
      time: '',
      notes: ''
    }
  })

  const watchedSubjectId = watch('subjectId')
  const watchedDate = watch('date')

  const onSubmit = async (data: FormValues) => {
    try {
      // Parse date and time
      const scheduledDate = new Date(`${data.date}T${data.time}:00`)
      
      await scheduleSession({
        studentId,
        courseId: selectedCourse?.id || data.subjectId,
        scheduledDate,
        duration: 60,
        studentQuestion: data.notes || 'Sessão de tutoria agendada'
      })
      
      reset()
      setSelectedCourse(null)
      await onSchedule()
    } catch (error) {
      console.error('Error scheduling session:', error)
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    setValue('subjectId', subjectId)
    const course = courses.find((c: Course) => c.id === subjectId)
    setSelectedCourse(course || null)
  }

  const handleDateChange = (date: string) => {
    setValue('date', date)
    // Reset time when date changes
    setValue('time', '')
  }

  const handleTimeChange = (time: string) => {
    setValue('time', time)
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

  return (
    <FormSection onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {scheduleError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Erro ao agendar: {scheduleError}</p>
          </div>
        )}

        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookOpenIcon size={16} />
            Curso
          </label>
          <CourseSelect
            courses={courses.map((course: Course) => ({
              id: course.id,
              name: course.title,
              description: course.description,
              tutor: 'Professor Disponível'
            }))}
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

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ClockIcon size={16} />
            Horário
          </label>
          <TimeSlotPicker
            availableSlots={availableTimeSlots}
            selectedTime={watch('time')}
            onTimeChange={handleTimeChange}
            disabled={!watchedDate}
            error={errors.time?.message}
          />
          {!watchedDate && (
            <p className="text-sm text-gray-500">
              Selecione uma data primeiro para ver os horários disponíveis
            </p>
          )}
        </div>

        {/* Notes */}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={scheduling}
          className="w-full font-medium"
        >
          {scheduling ? 'Agendando...' : 'Agendar Sessão'}
        </Button>
      </div>
    </FormSection>
  )
}
