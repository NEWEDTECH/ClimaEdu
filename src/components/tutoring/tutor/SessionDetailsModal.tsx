'use client'

import { useState } from 'react'
import { TutoringSession, TutoringSessionStatus } from '@/_core/modules/tutoring'
import { SessionPriorityUtils, TutoringDateUtils, MeetingUrlUtils } from '../shared/tutoring-utils'
import { Button } from '@/components/button'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  MessageSquareIcon, 
  AlertCircleIcon, 
  XIcon,
  EditIcon,
  CheckIcon,
  PlayIcon,
  FileTextIcon,
  LinkIcon
} from 'lucide-react'

interface SessionDetailsModalProps {
  session: TutoringSession
  isOpen: boolean
  onClose: () => void
  onSessionUpdate: (session: TutoringSession) => void
}

export function SessionDetailsModal({ session, isOpen, onClose, onSessionUpdate }: SessionDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [isEditingMeetingUrl, setIsEditingMeetingUrl] = useState(false)
  const [tutorNotes, setTutorNotes] = useState(session.tutorNotes || '')
  const [sessionSummary, setSessionSummary] = useState(session.sessionSummary || '')
  const [meetingUrl, setMeetingUrl] = useState(session.meetingUrl || '')

  if (!isOpen) return null

  const handleStatusChange = async (newStatus: TutoringSessionStatus) => {
    try {
      // Use entity methods to apply business rules
      const updatedSession = TutoringSession.fromData({ ...session })
      
      switch (newStatus) {
        case TutoringSessionStatus.SCHEDULED:
          updatedSession.schedule()
          break
        case TutoringSessionStatus.IN_PROGRESS:
          updatedSession.start()
          break
        case TutoringSessionStatus.COMPLETED:
          updatedSession.complete(sessionSummary || 'Sessão concluída')
          break
        case TutoringSessionStatus.CANCELLED:
          updatedSession.cancel('Cancelado pelo tutor')
          break
        case TutoringSessionStatus.NO_SHOW:
          updatedSession.markAsNoShow()
          break
      }
      
      await onSessionUpdate(updatedSession)
    } catch (error) {
      console.error('Error changing status:', error)
    }
  }

  const handleSaveNotes = async () => {
    try {
      // Use entity method to apply business rules
      const updatedSession = TutoringSession.fromData({ ...session })
      updatedSession.addTutorNotes(tutorNotes)
      
      await onSessionUpdate(updatedSession)
      setIsEditingNotes(false)
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const handleSaveSummary = async () => {
    try {
      // Use entity method to apply business rules
      const updatedSession = TutoringSession.fromData({ ...session })
      
      if (updatedSession.status === TutoringSessionStatus.COMPLETED) {
        // For completed sessions, we can update the summary directly
        updatedSession.sessionSummary = sessionSummary
        updatedSession.updatedAt = new Date()
      } else {
        // For other sessions, complete them with the summary
        updatedSession.complete(sessionSummary)
      }
      
      await onSessionUpdate(updatedSession)
      setIsEditingSummary(false)
    } catch (error) {
      console.error('Error saving summary:', error)
    }
  }

  const handleSaveMeetingUrl = async () => {
    try {
      // Use entity method to apply business rules
      const updatedSession = TutoringSession.fromData({ ...session })
      updatedSession.setMeetingUrl(meetingUrl || undefined)
      
      await onSessionUpdate(updatedSession)
      setIsEditingMeetingUrl(false)
    } catch (error) {
      console.error('Error saving meeting URL:', error)
    }
  }

  const canStartSession = session.status === TutoringSessionStatus.REQUESTED || session.status === TutoringSessionStatus.SCHEDULED
  const canCompleteSession = session.status === TutoringSessionStatus.IN_PROGRESS
  const canCancelSession = session.status === TutoringSessionStatus.REQUESTED || 
                           session.status === TutoringSessionStatus.SCHEDULED || 
                           session.status === TutoringSessionStatus.IN_PROGRESS

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes da Sessão
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student and Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aluno
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <UserIcon size={16} />
                <span className="font-medium">Estudante {session.studentId.slice(-4)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">student-{session.studentId.slice(-4)}@email.com</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <p className="text-gray-900 font-medium">Curso {session.courseId.slice(-4)}</p>
            </div>
          </div>

          {/* Date, Time and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <CalendarIcon size={16} />
                <span className="capitalize">{TutoringDateUtils.formatDate(session.scheduledDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <ClockIcon size={16} />
                <span>{TutoringDateUtils.formatTime(session.scheduledDate)} ({session.duration}min)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${SessionPriorityUtils.getColor(session.priority)} bg-opacity-10`}>
                <AlertCircleIcon size={14} />
                {SessionPriorityUtils.getLabel(session.priority)}
              </div>
            </div>
          </div>

          {/* Student Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dúvida do Aluno
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MessageSquareIcon size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-800">{session.studentQuestion}</p>
              </div>
            </div>
          </div>

          {/* Tutor Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Anotações do Tutor
              </label>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <EditIcon size={14} />
                  Editar
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={tutorNotes}
                  onChange={(e) => setTutorNotes(e.target.value)}
                  placeholder="Adicione suas anotações sobre a sessão..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} className="text-sm">
                    <CheckIcon size={14} className="mr-1" />
                    Salvar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditingNotes(false)
                      setTutorNotes(session.tutorNotes || '')
                    }}
                    className="text-sm border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {session.tutorNotes ? (
                  <p className="text-gray-800">{session.tutorNotes}</p>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma anotação adicionada ainda.</p>
                )}
              </div>
            )}
          </div>

          {/* Meeting URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Link da Reunião
              </label>
              {!isEditingMeetingUrl && (
                <button
                  onClick={() => setIsEditingMeetingUrl(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <EditIcon size={14} />
                  Editar
                </button>
              )}
            </div>
            
            {isEditingMeetingUrl ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456789 ou https://meet.google.com/abc-defg-hij"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {meetingUrl && !MeetingUrlUtils.validateUrl(meetingUrl) && (
                  <p className="text-sm text-red-600">Por favor, insira uma URL válida (deve começar com http:// ou https://)</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveMeetingUrl} 
                    className="text-sm"
                    disabled={!!meetingUrl && !MeetingUrlUtils.validateUrl(meetingUrl)}
                  >
                    <CheckIcon size={14} className="mr-1" />
                    Salvar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditingMeetingUrl(false)
                      setMeetingUrl(session.meetingUrl || '')
                    }}
                    className="text-sm border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                {session.meetingUrl ? (
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {MeetingUrlUtils.getMeetingPlatform(session.meetingUrl)}
                      </p>
                      <a 
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {MeetingUrlUtils.formatUrlForDisplay(session.meetingUrl, 60)}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-gray-400" />
                    <p className="text-gray-500 italic">Nenhum link de reunião adicionado ainda.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Session Summary (only for completed sessions) */}
          {(session.status === TutoringSessionStatus.COMPLETED || isEditingSummary) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resumo da Sessão
                </label>
                {!isEditingSummary && session.status === TutoringSessionStatus.COMPLETED && (
                  <button
                    onClick={() => setIsEditingSummary(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <EditIcon size={14} />
                    Editar
                  </button>
                )}
              </div>
              
              {isEditingSummary ? (
                <div className="space-y-2">
                  <textarea
                    value={sessionSummary}
                    onChange={(e) => setSessionSummary(e.target.value)}
                    placeholder="Descreva o que foi abordado na sessão, principais pontos discutidos, progresso do aluno..."
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSummary} className="text-sm">
                      <CheckIcon size={14} className="mr-1" />
                      Salvar
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingSummary(false)
                        setSessionSummary(session.sessionSummary || '')
                      }}
                      className="text-sm border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  {session.sessionSummary ? (
                    <p className="text-gray-800">{session.sessionSummary}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nenhum resumo adicionado ainda.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Materials (if any) */}
          {session.materials && session.materials.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materiais Compartilhados
              </label>
              <div className="space-y-2">
                {session.materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <FileTextIcon size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-800">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex gap-2">
            {canStartSession && (
              <Button 
                onClick={() => handleStatusChange(TutoringSessionStatus.IN_PROGRESS)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlayIcon size={16} className="mr-1" />
                Iniciar Sessão
              </Button>
            )}
            
            {canCompleteSession && (
              <Button 
                onClick={() => handleStatusChange(TutoringSessionStatus.COMPLETED)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckIcon size={16} className="mr-1" />
                Concluir Sessão
              </Button>
            )}
            
            {canCancelSession && (
              <Button 
                onClick={() => handleStatusChange(TutoringSessionStatus.CANCELLED)}
                className="bg-red-600 hover:bg-red-700"
              >
                <XIcon size={16} className="mr-1" />
                Cancelar Sessão
              </Button>
            )}
          </div>

          <Button 
            onClick={onClose}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
