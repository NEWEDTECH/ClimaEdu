'use client'

import { useState } from 'react'
import { TutorSession } from '@/app/tutor/tutoring/data/mockTutorData'
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
  PauseIcon,
  FileTextIcon
} from 'lucide-react'

interface SessionDetailsModalProps {
  session: TutorSession
  isOpen: boolean
  onClose: () => void
  onSessionUpdate: (session: TutorSession) => void
}

export function SessionDetailsModal({ session, isOpen, onClose, onSessionUpdate }: SessionDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [tutorNotes, setTutorNotes] = useState(session.tutorNotes || '')
  const [sessionSummary, setSessionSummary] = useState(session.sessionSummary || '')

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getPriorityColor = (priority: TutorSession['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleStatusChange = (newStatus: TutorSession['status']) => {
    const updatedSession = { ...session, status: newStatus, updatedAt: new Date().toISOString() }
    onSessionUpdate(updatedSession)
  }

  const handleSaveNotes = () => {
    const updatedSession = { ...session, tutorNotes, updatedAt: new Date().toISOString() }
    onSessionUpdate(updatedSession)
    setIsEditingNotes(false)
  }

  const handleSaveSummary = () => {
    const updatedSession = { ...session, sessionSummary, updatedAt: new Date().toISOString() }
    onSessionUpdate(updatedSession)
    setIsEditingSummary(false)
  }

  const canStartSession = session.status === 'scheduled'
  const canCompleteSession = session.status === 'in_progress'
  const canCancelSession = session.status === 'scheduled' || session.status === 'in_progress'

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
                <span className="font-medium">{session.studentName}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{session.studentEmail}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <p className="text-gray-900 font-medium">{session.courseName}</p>
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
                <span className="capitalize">{formatDate(session.date)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <ClockIcon size={16} />
                <span>{formatTime(session.time)} ({session.duration}min)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(session.priority)}`}>
                <AlertCircleIcon size={14} />
                {session.priority === 'high' ? 'Alta' : session.priority === 'medium' ? 'Média' : 'Baixa'}
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

          {/* Session Summary (only for completed sessions) */}
          {(session.status === 'completed' || isEditingSummary) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resumo da Sessão
                </label>
                {!isEditingSummary && session.status === 'completed' && (
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
                onClick={() => handleStatusChange('in_progress')}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlayIcon size={16} className="mr-1" />
                Iniciar Sessão
              </Button>
            )}
            
            {canCompleteSession && (
              <Button 
                onClick={() => handleStatusChange('completed')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckIcon size={16} className="mr-1" />
                Concluir Sessão
              </Button>
            )}
            
            {canCancelSession && (
              <Button 
                onClick={() => handleStatusChange('cancelled')}
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
