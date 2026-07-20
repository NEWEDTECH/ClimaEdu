'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/button'
import { XIcon, CalendarIcon } from 'lucide-react'
import type { ScheduledClass, TutorClassOption } from '@/_core/modules/scheduled-class'
import { ScheduledClassDateUtils, MeetingPlatformUtils } from '../shared/scheduled-class-utils'

export interface ScheduleClassFormData {
  classId: string
  scheduledDate: Date
  meetingUrl: string
  title?: string
}

interface ScheduleClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ScheduleClassFormData) => Promise<void>
  tutorClasses: TutorClassOption[]
  saving: boolean
  /** When provided, the modal works in edit mode */
  editingClass?: ScheduledClass | null
}

export function ScheduleClassModal({
  isOpen,
  onClose,
  onSubmit,
  tutorClasses,
  saving,
  editingClass
}: ScheduleClassModalProps) {
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const isEditing = !!editingClass

  // Sync form fields whenever the modal opens (create or edit)
  useEffect(() => {
    if (!isOpen) return

    if (editingClass) {
      const inputValues = ScheduledClassDateUtils.toInputValues(editingClass.scheduledDate)
      setClassId(editingClass.classId)
      setDate(inputValues.date)
      setTime(inputValues.time)
      setMeetingUrl(editingClass.meetingUrl)
      setTitle(editingClass.title || '')
    } else {
      setClassId('')
      setDate('')
      setTime('')
      setMeetingUrl('')
      setTitle('')
    }
    setFormError(null)
  }, [isOpen, editingClass])

  if (!isOpen) return null

  const validate = (): string | null => {
    if (!classId) return 'Selecione uma turma'
    if (!date || !time) return 'Informe a data e a hora da aula'

    const scheduledDate = ScheduledClassDateUtils.fromInputValues(date, time)
    if (isNaN(scheduledDate.getTime())) return 'Data ou hora inválida'
    if (scheduledDate.getTime() <= Date.now()) return 'A data da aula deve ser no futuro'

    if (!meetingUrl.trim()) return 'Informe o link da reunião (Meet ou Zoom)'
    if (!MeetingPlatformUtils.isValidUrl(meetingUrl)) {
      return 'O link deve ser uma URL válida (http:// ou https://)'
    }

    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setFormError(null)
      await onSubmit({
        classId,
        scheduledDate: ScheduledClassDateUtils.fromInputValues(date, time),
        meetingUrl: meetingUrl.trim(),
        title: title.trim() || undefined
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar a aula')
    }
  }

  const minDate = ScheduledClassDateUtils.toInputValues(new Date()).date

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} />
            {isEditing ? 'Editar Aula' : 'Agendar Aula'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Turma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Turma <span className="text-red-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={isEditing}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Selecione a turma</option>
              {tutorClasses.map(option => (
                <option key={option.classId} value={option.classId}>
                  {option.className} — {option.courseTitle}
                </option>
              ))}
            </select>
            {!isEditing && tutorClasses.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Nenhuma turma vinculada aos seus cursos foi encontrada.
              </p>
            )}
          </div>

          {/* Título (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assunto da aula <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Revisão do Módulo 3"
              maxLength={120}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Link da reunião */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link da reunião (Meet ou Zoom) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Agendar Aula'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
