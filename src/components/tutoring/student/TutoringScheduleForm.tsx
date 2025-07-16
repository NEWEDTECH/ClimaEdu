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
import { Course, availableTimeSlots } from '../../../app/student/tutoring/data/mockData'
import { CalendarIcon, ClockIcon, BookOpenIcon, MessageSquareIcon } from 'lucide-react'

const formSchema = z.object({
  courseId: z.string().min(1, { message: 'Selecione um curso' }),
  date: z.string().min(1, { message: 'Selecione uma data' }),
  time: z.string().min(1, { message: 'Selecione um horário' }),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface TutoringScheduleFormProps {
  courses: Course[]
  onSchedule: (data: FormValues) => void
}

export function TutoringScheduleForm({ courses, onSchedule }: TutoringScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

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
      courseId: '',
      date: '',
      time: '',
      notes: ''
    }
  })

  const watchedCourseId = watch('courseId')
  const watchedDate = watch('date')

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSchedule(data)
      reset()
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error scheduling session:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCourseChange = (courseId: string) => {
    setValue('courseId', courseId)
    const course = courses.find(c => c.id === courseId)
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

  return (
    <FormSection onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Course Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookOpenIcon size={16} />
            Curso
          </label>
          <CourseSelect
            courses={courses}
            selectedCourseId={watchedCourseId}
            onCourseChange={handleCourseChange}
            error={errors.courseId?.message}
          />
          {selectedCourse && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Professor:</strong> {selectedCourse.tutor}
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
          disabled={isSubmitting}
          className="w-full font-medium"
        >
          {isSubmitting ? 'Agendando...' : 'Agendar Sessão'}
        </Button>
      </div>
    </FormSection>
  )
}
